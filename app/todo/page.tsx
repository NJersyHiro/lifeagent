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

    const fetchTodos = async () => {
        const res = await fetch('/api/todo')
        const data = await res.json()
        setTodos(data)
    }

    useEffect(() => {
        fetchTodos()
    }, [])

    const toggleCompleted = async (id: string, completed: boolean) => {
        await fetch('/api/todo', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, completed }),
        })
        fetchTodos()
    }

    return (
        <main className="p-4 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">ToDo一覧</h1>
            <ul className="space-y-2">
                {todos.map((todo) => (
                    <li
                        key={todo.id}
                        className={`p-2 border rounded flex justify-between items-center ${todo.completed ? 'bg-green-100 line-through' : 'bg-white'
                            }`}
                    >
                        <div>
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => toggleCompleted(todo.id, !todo.completed)}
                                className="mr-2"
                            />
                            <span className="font-medium">{todo.title}</span>
                            {todo.dueDate && (
                                <span className="text-sm text-gray-500 ml-2">
                                    （期限: {new Date(todo.dueDate).toLocaleDateString()}）
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    )
}
