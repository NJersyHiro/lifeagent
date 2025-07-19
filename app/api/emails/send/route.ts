import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.access_token) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
        }

        const { draftId, to, subject, body, threadId, messageId } = await req.json()

        if (!to || !subject || !body) {
            return NextResponse.json({ error: '必要な情報が不足しています' }, { status: 400 })
        }

        // OAuth2クライアントの設定
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.NEXTAUTH_URL + '/api/auth/callback/google'
        )

        oauth2Client.setCredentials({
            access_token: session.access_token as string,
        })

        // Gmail APIクライアントの初期化
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

        // メールの作成
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`
        const messageParts = [
            `From: me`,
            `To: ${to}`,
            `Subject: ${utf8Subject}`,
            `In-Reply-To: ${messageId}`,
            `References: ${messageId}`,
            'Content-Type: text/plain; charset=utf-8',
            'MIME-Version: 1.0',
            '',
            body,
            '',
            '---',
            'このメールはLifeAgent AIアシスタントを使用して作成・送信されました。'
        ]

        const message = messageParts.join('\n')
        const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

        // メールを送信
        const sendResult = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
                threadId: threadId
            }
        })

        // ドラフトのステータスを更新
        if (draftId) {
            await prisma.replyDraft.update({
                where: { id: draftId },
                data: {
                    sent: true,
                    sentAt: new Date()
                }
            })
        }

        return NextResponse.json({
            message: 'メールを送信しました',
            messageId: sendResult.data.id
        })

    } catch (error) {
        console.error('Error sending email:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ 
            error: 'メールの送信に失敗しました', 
            details: message 
        }, { status: 500 })
    }
}