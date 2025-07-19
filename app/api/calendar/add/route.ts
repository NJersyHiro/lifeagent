import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || !session.access_token) {
        return NextResponse.json({ error: '認証されていません' }, { status: 401 })
    }

    const { title, date, time } = await req.json()

    const event = {
        summary: title,
        start: {
            dateTime: `${date}T${time}:00`,
            timeZone: 'Asia/Tokyo',
        },
        end: {
            dateTime: `${date}T${time}:00`,
            timeZone: 'Asia/Tokyo',
        },
    }

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
    })

    const data = await res.json()

    if (!res.ok) {
        return NextResponse.json({ error: 'カレンダー登録失敗', detail: data }, { status: res.status })
    }

    return NextResponse.json({ success: true, eventId: data.id })
}
