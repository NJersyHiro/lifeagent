'use client'

import { useEffect, useState } from 'react'

type Expense = {
    id: string
    date: string
    item: string
    amount: number
    category: string
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([])

    useEffect(() => {
        fetch('/api/expense')
            .then((res) => res.json())
            .then(setExpenses)
    }, [])

    return (
        <main className="p-4">
            <h1 className="text-xl font-bold mb-4">支出一覧（青色申告用）</h1>
            <table className="table-auto w-full text-sm border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 border">日付</th>
                        <th className="p-2 border">項目</th>
                        <th className="p-2 border">金額</th>
                        <th className="p-2 border">勘定科目</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((e) => (
                        <tr key={e.id}>
                            <td className="border p-2">{new Date(e.date).toLocaleDateString()}</td>
                            <td className="border p-2">{e.item}</td>
                            <td className="border p-2">{e.amount}</td>
                            <td className="border p-2">{e.category}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    )
}
