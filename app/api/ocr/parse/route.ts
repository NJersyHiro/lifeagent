import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

delete process.env.GOOGLE_GENAI_USE_VERTEXAI

const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json()

        if (!text) {
            return NextResponse.json({ error: 'OCRテキストが空です' }, { status: 400 })
        }

        const prompt = `
あなたは青色申告を補助する経理AIです。
以下のレシートのテキストから、最も大きな金額に関する1件の情報を抽出し、以下の形式のJSONのみを出力してください：

- "date": 購入日付（"7/17" → "2025-07-17"のように変換）
- "item": 商品名（最も高額な品目）
- "amount": 金額（数値）
- "category": 青色申告向けの勘定科目（例: "交際費", "消耗品費", "旅費交通費", "食費", "通信費", "地代家賃", "雑費" など）

出力は厳密に次の形式とし、JSON以外（解説文、マークダウン、\`\`\` など）を絶対に含めないでください。
今日の日付は2025年7月19日です。

OCRレシート本文:
"""
${text}
"""
`

        const request = {
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }

        const result = await genAI.models.generateContent(request)

        // resultから直接 .text を取得
        const rawText = result?.text

        if (!rawText) {
            console.error("モデルからのレスポンスにテキストが含まれていませんでした。", result)
            return NextResponse.json({ error: 'モデルから有効なテキスト応答を取得できませんでした。' }, { status: 500 })
        }

        console.log("モデルからの生レスポンス:", rawText)

        const match = rawText.match(/\{[\s\S]*\}/)

        if (!match) {
            console.error("レスポンスからJSONオブジェクトが見つかりませんでした。")
            return NextResponse.json({ error: 'レスポンスから有効なJSON形式を抽出できませんでした。' }, { status: 500 })
        }

        const jsonText = match[0]
        const parsed = JSON.parse(jsonText)

        return NextResponse.json(parsed)

    } catch (err) {
        console.error("解析中にエラーが発生しました:", err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: 'LLM処理失敗', message }, { status: 500 })
    }
}
