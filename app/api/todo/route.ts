import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
    const { title, date } = await req.json()

    const todo = await prisma.todo.create({
        data: {
            title,
            dueDate: date ? new Date(`${date}T00:00:00`) : null,
        },
    })

    return NextResponse.json(todo)
}

export async function GET() {
    const todos = await prisma.todo.findMany({
        orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(todos)
}
