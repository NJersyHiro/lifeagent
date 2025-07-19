import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
        }

        // paramsをawaitする
        const { id } = await params

        const email = await prisma.email.findUnique({
            where: { id }
        })

        if (!email) {
            return NextResponse.json({ error: 'メールが見つかりません' }, { status: 404 })
        }

        const replyDrafts = await prisma.replyDraft.findMany({
            where: { emailId: id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({
            email,
            replyDrafts
        })
    } catch (error) {
        console.error('Error fetching email:', error)
        return NextResponse.json({ error: 'メールの取得に失敗しました' }, { status: 500 })
    }
}