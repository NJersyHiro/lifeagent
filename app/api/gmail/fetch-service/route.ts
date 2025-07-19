import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'

// サービスアカウントを使用したGmail API（ドメイン全体の委任が必要）
export async function GET(req: NextRequest) {
    try {
        // サービスアカウントの認証情報を読み込み
        const credentialsPath = path.join(process.cwd(), '.gcp', 'vision-key.json')
        const credentialsData = await readFile(credentialsPath, 'utf-8')
        const credentials = JSON.parse(credentialsData)

        // ユーザーのメールアドレスを取得（クエリパラメータまたは環境変数から）
        const url = new URL(req.url)
        const userEmail = url.searchParams.get('email') || process.env.GMAIL_USER_EMAIL

        if (!userEmail) {
            return NextResponse.json({ 
                error: 'メールアドレスが指定されていません' 
            }, { status: 400 })
        }

        // JWT認証クライアントの作成（ドメイン全体の委任用）
        const auth = new google.auth.JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: [
                'https://www.googleapis.com/auth/gmail.readonly',
            ],
            subject: userEmail, // 代理アクセスするユーザー
        })

        // Gmail APIクライアントの初期化
        const gmail = google.gmail({ version: 'v1', auth })

        // 最新のメールを取得（過去24時間）
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const query = `after:${Math.floor(yesterday.getTime() / 1000)}`

        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 50,
        })

        const messages = response.data.messages || []
        console.log(`Found ${messages.length} new messages`)

        const savedEmails = []

        // 各メッセージの詳細を取得して保存
        for (const message of messages) {
            try {
                const messageDetail = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id!,
                })

                const payload = messageDetail.data.payload
                const headers = payload?.headers || []
                
                // ヘッダーから必要な情報を抽出
                const getHeader = (name: string) => 
                    headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || ''

                const from = getHeader('from')
                const to = getHeader('to')
                const subject = getHeader('subject')
                const dateStr = getHeader('date')
                const date = dateStr ? new Date(dateStr) : new Date()

                // メール本文を取得
                let body = ''
                if (payload?.body?.data) {
                    body = Buffer.from(payload.body.data, 'base64').toString()
                } else if (payload?.parts) {
                    // マルチパートメッセージの場合
                    const textPart = payload.parts.find(part => part.mimeType === 'text/plain')
                    if (textPart?.body?.data) {
                        body = Buffer.from(textPart.body.data, 'base64').toString()
                    }
                }

                // ラベルを取得
                const labels = messageDetail.data.labelIds?.join(',') || ''

                // データベースに保存（重複チェック付き）
                // @ts-expect-error Prisma client types are generated at build time
                const email = await prisma.email.upsert({
                    where: { messageId: message.id! },
                    update: {
                        isRead: !messageDetail.data.labelIds?.includes('UNREAD'),
                    },
                    create: {
                        messageId: message.id!,
                        threadId: message.threadId!,
                        from,
                        to,
                        subject,
                        body: body.substring(0, 10000), // SQLiteの制限を考慮
                        snippet: messageDetail.data.snippet || '',
                        date,
                        isRead: !messageDetail.data.labelIds?.includes('UNREAD'),
                        labels,
                    },
                })

                savedEmails.push(email)
            } catch (error) {
                console.error(`Error processing message ${message.id}:`, error)
            }
        }

        return NextResponse.json({
            message: `${savedEmails.length}件のメールを保存しました`,
            emails: savedEmails,
        })

    } catch (error) {
        console.error('Gmail fetch error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ 
            error: 'メールの取得に失敗しました', 
            details: errorMessage,
            note: 'サービスアカウントを使用する場合は、Google Workspaceでドメイン全体の委任を設定する必要があります'
        }, { status: 500 })
    }
}