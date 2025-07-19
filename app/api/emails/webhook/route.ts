import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 最新の未読メールIDと処理済みメールを保存する一時的なストレージ
let latestUnreadEmailId: string | null = null
const processedEmailIds = new Set<string>()
const MAX_PROCESSED_IDS = 100

export async function POST(req: NextRequest) {
    try {
        const { emailId, action } = await req.json()

        if (action === 'new_email' && emailId) {
            // 既に処理済みのメールは無視
            if (!processedEmailIds.has(emailId)) {
                latestUnreadEmailId = emailId
                return NextResponse.json({ 
                    message: '新着メール通知を受信しました',
                    emailId 
                })
            } else {
                return NextResponse.json({ 
                    message: '既に処理済みのメールです',
                    emailId 
                })
            }
        }

        return NextResponse.json({ error: '無効なアクション' }, { status: 400 })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Webhook処理エラー' }, { status: 500 })
    }
}

export async function GET() {
    // 最新の未読メールIDを取得して返す
    if (latestUnreadEmailId && !processedEmailIds.has(latestUnreadEmailId)) {
        const emailId = latestUnreadEmailId
        
        // 処理済みとしてマーク
        processedEmailIds.add(emailId)
        if (processedEmailIds.size > MAX_PROCESSED_IDS) {
            // 古いIDを削除
            const firstId = processedEmailIds.values().next().value
            processedEmailIds.delete(firstId)
        }
        
        latestUnreadEmailId = null // 一度取得したらクリア
        return NextResponse.json({ emailId })
    }

    // 未読メールがない場合は、DBから最新の未読メールを探す（ただし処理済みメール以外）
    try {
        const unreadEmails = await prisma.email.findMany({
            where: { 
                isRead: false,
                // 作成から5分以内のメールのみ
                createdAt: {
                    gte: new Date(Date.now() - 5 * 60 * 1000)
                }
            },
            orderBy: { date: 'desc' }
        })

        // 処理済みでないメールを探す
        for (const email of unreadEmails) {
            if (!processedEmailIds.has(email.id)) {
                processedEmailIds.add(email.id)
                if (processedEmailIds.size > MAX_PROCESSED_IDS) {
                    const firstId = processedEmailIds.values().next().value
                    processedEmailIds.delete(firstId)
                }
                return NextResponse.json({ emailId: email.id })
            }
        }

        return NextResponse.json({ emailId: null })
    } catch (error) {
        console.error('Error fetching unread email:', error)
        return NextResponse.json({ emailId: null })
    }
}