'use client'

import { useState } from 'react'

export default function ReceiptPage() {
    const [image, setImage] = useState<File | null>(null)
    const [ocrResult, setOcrResult] = useState('')
    const [parsedResult, setParsedResult] = useState<{ date: string; item: string; amount: number; category: string } | null>(null)

    const handleOcrAndParse = async () => {
        if (!image) return

        const formData = new FormData()
        formData.append('file', image)

        const ocrRes = await fetch('/api/ocr/upload', {
            method: 'POST',
            body: formData,
        })
        const ocrJson = await ocrRes.json()
        const ocrText = ocrJson.text

        setOcrResult(ocrText)

        const parseRes = await fetch('/api/ocr/parse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: ocrText }),
        })

        const parsed = await parseRes.json()
        setParsedResult(parsed)
    }

    return (
        <main className="p-4">
            <h1 className="text-xl font-bold mb-4">レシートOCR＋構造化</h1>

            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
            <button
                onClick={handleOcrAndParse}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
                OCR → 構造化
            </button>

            {/* OCRされた元のテキスト */}
            {ocrResult && (
                <pre className="mt-4 p-2 bg-gray-100">{ocrResult}</pre>
            )}

            {parsedResult && (
                <div className="mt-4 p-4 bg-green-100 rounded">
                    <h2 className="font-bold mb-2">抽出結果（確認）</h2>
                    <p>日付: {parsedResult.date}</p>
                    <p>項目: {parsedResult.item}</p>
                    <p>金額: {parsedResult.amount}円</p>
                    <p>勘定科目: {parsedResult.category}</p>
                    <button
                        className="mt-2 bg-emerald-600 text-white px-4 py-2 rounded"
                        onClick={async () => {
                            const res = await fetch('/api/expense', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(parsedResult),
                            })
                            const json = await res.json()
                            alert('保存しました: ' + json.item)
                        }}
                    >
                        保存する
                    </button>
                </div>
            )}
        </main>
    )
}
