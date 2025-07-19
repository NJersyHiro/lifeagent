import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET() {
    try {
        // セッションの確認
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
        }

        // @ts-expect-error Prisma client types are generated at build time
        const emails = await prisma.email.findMany({
            orderBy: { date: 'desc' },
            take: 100, // 最新100件を取得
        })

        return NextResponse.json(emails)
    } catch (error) {
        console.error('Error fetching emails:', error)
        return NextResponse.json({ error: 'メールの取得に失敗しました' }, { status: 500 })
    }
}