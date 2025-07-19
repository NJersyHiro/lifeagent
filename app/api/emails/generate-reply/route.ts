import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { GoogleGenAI } from '@google/genai'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

delete process.env.GOOGLE_GENAI_USE_VERTEXAI

const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
        }

        const { emailId, from, subject, body, instruction } = await req.json()

        if (!emailId || !from || !subject || !body) {
            return NextResponse.json({ error: '必要な情報が不足しています' }, { status: 400 })
        }

        // プロンプトを作成
        const prompt = `
あなたはメール返信を作成するアシスタントです。
以下のメールに対して、適切な返信を日本語で作成してください。

${instruction ? `特別な指示: ${instruction}` : '丁寧で親切な返信を心がけてください。'}

元のメール:
From: ${from}
Subject: ${subject}
本文:
${body}

返信を作成してください。件名は含めず、本文のみを出力してください。
署名も自動的に追加されるので不要です。
`

        const request = {
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }

        const result = await genAI.models.generateContent(request)
        const replyContent = result?.text

        if (!replyContent) {
            return NextResponse.json({ 
                error: 'AIからの応答を取得できませんでした' 
            }, { status: 500 })
        }

        // 返信ドラフトを保存
        const draft = await prisma.replyDraft.create({
            data: {
                emailId,
                content: replyContent.trim(),
                instruction: instruction || null,
            }
        })

        return NextResponse.json({
            message: '返信ドラフトを作成しました',
            draft
        })

    } catch (error) {
        console.error('Error generating reply:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ 
            error: '返信の生成に失敗しました', 
            details: message 
        }, { status: 500 })
    }
}