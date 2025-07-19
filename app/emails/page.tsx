'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface Email {
    id: string
    messageId: string
    from: string
    to: string
    subject: string
    snippet: string
    date: string
    isRead: boolean
}

export default function EmailsPage() {
    const { data: session } = useSession()
    const [emails, setEmails] = useState<Email[]>([])
    const [loading, setLoading] = useState(false)
    const [fetchingNew, setFetchingNew] = useState(false)

    // 保存済みのメールを取得
    const loadEmails = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/gmail/list')
            if (res.ok) {
                const data = await res.json()
                setEmails(data)
            }
        } catch (error) {
            console.error('Error loading emails:', error)
        } finally {
            setLoading(false)
        }
    }

    // 新着メールを取得
    const fetchNewEmails = async () => {
        setFetchingNew(true)
        try {
            const res = await fetch('/api/gmail/fetch')
            if (res.ok) {
                const data = await res.json()
                alert(data.message)
                loadEmails() // リロード
            } else {
                const error = await res.json()
                alert(`エラー: ${error.error}`)
            }
        } catch (error) {
            console.error('Error fetching new emails:', error)
            alert('メールの取得に失敗しました')
        } finally {
            setFetchingNew(false)
        }
    }

    useEffect(() => {
        if (session) {
            loadEmails()
        }
    }, [session])

    if (!session) {
        return (
            <main className="p-4">
                <p>ログインが必要です</p>
            </main>
        )
    }

    return (
        <main className="p-4 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">メール一覧</h1>
                <button
                    onClick={fetchNewEmails}
                    disabled={fetchingNew}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md 
                        hover:bg-blue-600 disabled:bg-gray-400 
                        disabled:cursor-not-allowed transition-colors"
                >
                    {fetchingNew ? '取得中...' : '新着メールを取得'}
                </button>
            </div>

            {loading ? (
                <p>読み込み中...</p>
            ) : emails.length === 0 ? (
                <p className="text-gray-500">メールがありません</p>
            ) : (
                <div className="space-y-2">
                    {emails.map(email => (
                        <div
                            key={email.id}
                            className={`p-4 border rounded-lg ${
                                email.isRead ? 'bg-white' : 'bg-blue-50 border-blue-300'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">
                                        From: {email.from}
                                    </p>
                                    <h3 className={`text-lg ${
                                        email.isRead ? '' : 'font-semibold'
                                    }`}>
                                        {email.subject || '(件名なし)'}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {new Date(email.date).toLocaleString('ja-JP')}
                                </p>
                            </div>
                            <p className="text-gray-700 truncate">
                                {email.snippet}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}