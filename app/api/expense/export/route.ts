import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Parser } from 'json2csv'

type ExpenseRow = {
    id: string
    date: Date
    item: string
    amount: number
    category: string
    createdAt: Date
}

export async function GET() {
    try {
        // @ts-expect-error Prisma client types are generated at build time
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
        })

        const fields = [
            { label: '日付', value: (row: ExpenseRow) => row.date.toISOString().split('T')[0] },
            { label: '項目', value: 'item' },
            { label: '金額', value: 'amount' },
            { label: '勘定科目', value: 'category' },
        ]

        const parser = new Parser({ fields, withBOM: true })
        const csv = parser.parse(expenses)

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="expenses.csv"',
            },
        })
    } catch (error) {
        console.error('Error exporting expenses:', error)
        return NextResponse.json({ error: 'Export failed' }, { status: 500 })
    }
}
