'use client'

import { useEffect, useState } from 'react'

type Todo = {
    id: string
    title: string
    dueDate?: string
    createdAt: string
    completed: boolean
}

export default function TodoPage() {
    const [todos, setTodos] = useState<Todo[]>([])

    useEffect(() => {
        fetch('/api/todo')
            .then((res) => res.json())
            .then(setTodos)
    }, [])

    return (
        <main className="p-4 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">ToDo一覧</h1>
            <ul className="space-y-2">
                {todos.map((todo) => (
                    <li key={todo.id} className="p-2 border rounded bg-white">
                        <span className="font-medium">{todo.title}</span>
                        {todo.dueDate && (
                            <span className="text-sm text-gray-500 ml-2">
                                （期限: {new Date(todo.dueDate).toLocaleDateString()}）
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </main>
    )
}
