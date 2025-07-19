'use client'
import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async () => {
    const res = await fetch('/api/parse', {
      method: 'POST',
      body: JSON.stringify({ text: input }),
    })
    const json = await res.json()
    if (json.type === 'event') {
      await fetch('/api/calendar/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: json.title,
          date: json.date,
          time: json.time,
        }),
      })
    }

    setResult(json)
  }

  return (
    <main className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">LifeAgent: テキストから予定/ToDo登録</h1>
      <textarea
        className="w-full p-2 border rounded"
        placeholder="例: 来週火曜日13時に歯医者"
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>
        解析する
      </button>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>分類: {result.type}</p>
          <p>タイトル: {result.title}</p>
          <p>日付: {result.date}</p>
          <p>時間: {result.time}</p>
        </div>
      )}
    </main>

  )
}
