'use client'
import { useState } from 'react'

export default function ReceiptPage() {
    const [image, setImage] = useState<File | null>(null)
    const [ocrResult, setOcrResult] = useState('')

    const handleUpload = async () => {
        if (!image) return
        const formData = new FormData()
        formData.append('file', image)

        const res = await fetch('/api/ocr/upload', {
            method: 'POST',
            body: formData,
        })
        const json = await res.json()
        setOcrResult(json.text || json.error || '読み取り失敗')
    }

    return (
        <main className="p-4">
            <h1 className="text-xl font-bold mb-4">レシートOCR</h1>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
            <button
                onClick={handleUpload}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
                アップロードしてOCR実行
            </button>
            <pre className="mt-4 bg-gray-100 p-2 whitespace-pre-wrap">{ocrResult}</pre>
        </main>
    )
}
