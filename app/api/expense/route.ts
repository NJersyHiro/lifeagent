import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 保存処理
export async function POST(req: NextRequest) {
    try {
        const { date, item, amount, category } = await req.json()

        if (!date || !item || !amount || !category) {
            return NextResponse.json({ error: '全フィールドが必須です' }, { status: 400 })
        }

        const saved = await prisma.expense.create({
            data: {
                date: new Date(date),
                item,
                amount: Number(amount),
                category,
            },
        })

        return NextResponse.json(saved)
    } catch (error) {
        console.error('Error saving expense:', error)
        return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
    }
}

// 一覧取得
export async function GET() {
    try {
        const all = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
        })

        return NextResponse.json(all)
    } catch (error) {
        console.error('Error fetching expenses:', error)
        return NextResponse.json({ error: 'データベースエラー' }, { status: 500 })
    }
}
