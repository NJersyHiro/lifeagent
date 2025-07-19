import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function DELETE(
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

        await prisma.replyDraft.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'ドラフトを削除しました' })
    } catch (error) {
        console.error('Error deleting draft:', error)
        return NextResponse.json({ error: 'ドラフトの削除に失敗しました' }, { status: 500 })
    }
}