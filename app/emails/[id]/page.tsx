'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Email {
    id: string
    messageId: string
    threadId: string
    from: string
    to: string
    subject: string
    body: string
    date: string
    isRead: boolean
}

interface ReplyDraft {
    id: string
    content: string
    instruction: string | null
    approved: boolean
    sent: boolean
    createdAt: string
}

export default function EmailDetailPage() {
    const { data: session } = useSession()
    const params = useParams()
    const router = useRouter()
    const [email, setEmail] = useState<Email | null>(null)
    const [replyDrafts, setReplyDrafts] = useState<ReplyDraft[]>([])
    const [instruction, setInstruction] = useState('')
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)

    // メール詳細を取得
    const loadEmail = async (autoGenerateReply = false) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/emails/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setEmail(data.email)
                setReplyDrafts(data.replyDrafts || [])
                
                // 返信ドラフトがなく、autoGenerateReplyがtrueの場合は自動生成
                if (autoGenerateReply && data.email && (!data.replyDrafts || data.replyDrafts.length === 0)) {
                    await generateReplyForEmail(data.email)
                }
            }
        } catch (error) {
            console.error('Error loading email:', error)
        } finally {
            setLoading(false)
        }
    }

    // メール情報から直接AI返信を生成
    const generateReplyForEmail = async (emailData: Email) => {
        try {
            const res = await fetch('/api/emails/generate-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailId: emailData.id,
                    from: emailData.from,
                    subject: emailData.subject,
                    body: emailData.body,
                    instruction: '丁寧で親切な返信を作成してください'
                })
            })

            if (res.ok) {
                loadEmail() // リロードして新しいドラフトを表示
            }
        } catch (error) {
            console.error('Error auto-generating reply:', error)
        }
    }

    // AI返信を生成
    const generateReply = async () => {
        if (!email) return
        
        setGenerating(true)
        try {
            const res = await fetch('/api/emails/generate-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailId: email.id,
                    from: email.from,
                    subject: email.subject,
                    body: email.body,
                    instruction: instruction || undefined
                })
            })

            if (res.ok) {
                await res.json()
                loadEmail() // リロードして新しいドラフトを表示
                setInstruction('') // 指示をクリア
            } else {
                const error = await res.json()
                alert(`エラー: ${error.error}`)
            }
        } catch (error) {
            console.error('Error generating reply:', error)
            alert('返信の生成に失敗しました')
        } finally {
            setGenerating(false)
        }
    }

    // メールを送信
    const sendReply = async (draftId: string, content: string) => {
        if (!email) return
        
        const confirmed = confirm('この内容でメールを送信しますか？')
        if (!confirmed) return

        try {
            const res = await fetch('/api/emails/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    draftId,
                    to: email.from,
                    subject: `Re: ${email.subject}`,
                    body: content,
                    threadId: email.threadId,
                    messageId: email.messageId
                })
            })

            if (res.ok) {
                alert('メールを送信しました')
                loadEmail() // リロード
            } else {
                const error = await res.json()
                alert(`送信エラー: ${error.error}`)
            }
        } catch (error) {
            console.error('Error sending email:', error)
            alert('メールの送信に失敗しました')
        }
    }

    // ドラフトを削除
    const deleteDraft = async (draftId: string) => {
        try {
            const res = await fetch(`/api/emails/drafts/${draftId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                loadEmail()
            }
        } catch (error) {
            console.error('Error deleting draft:', error)
        }
    }

    useEffect(() => {
        if (session && params.id) {
            // URLパラメータで自動生成フラグをチェック
            const urlParams = new URLSearchParams(window.location.search)
            const autoGenerate = urlParams.get('autoGenerate') === 'true'
            loadEmail(autoGenerate)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, params.id])

    if (!session) {
        return (
            <main className="p-4">
                <p>ログインが必要です</p>
            </main>
        )
    }

    if (loading || !email) {
        return (
            <main className="p-4">
                <p>読み込み中...</p>
            </main>
        )
    }

    return (
        <main className="p-4 max-w-4xl mx-auto">
            <button
                onClick={() => router.push('/emails')}
                className="mb-4 text-blue-600 hover:underline"
            >
                ← メール一覧に戻る
            </button>

            {/* メール詳細 */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="mb-4">
                    <p className="text-sm text-gray-600">From: {email.from}</p>
                    <p className="text-sm text-gray-600">To: {email.to}</p>
                    <p className="text-sm text-gray-600">
                        Date: {new Date(email.date).toLocaleString('ja-JP')}
                    </p>
                </div>
                <h1 className="text-2xl font-bold mb-4">{email.subject}</h1>
                <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded">
                    {email.body}
                </div>
            </div>

            {/* AI返信の再生成 */}
            {replyDrafts.length > 0 && (
                <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-4">別の返信を生成</h2>
                    <textarea
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder="返信の指示を入力（例：丁寧に断る、日程を提案する、など）"
                        className="w-full p-3 border rounded-md mb-4"
                        rows={3}
                    />
                    <button
                        onClick={generateReply}
                        disabled={generating}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md 
                            hover:bg-blue-600 disabled:bg-gray-400 
                            disabled:cursor-not-allowed transition-colors"
                    >
                        {generating ? '生成中...' : '別の返信を生成'}
                    </button>
                </div>
            )}

            {/* 返信ドラフト一覧 */}
            {replyDrafts.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">返信ドラフト</h2>
                    {replyDrafts.map(draft => (
                        <div
                            key={draft.id}
                            className={`p-4 rounded-lg shadow-md ${
                                draft.sent ? 'bg-gray-100' : 'bg-white'
                            }`}
                        >
                            {draft.instruction && (
                                <p className="text-sm text-gray-600 mb-2">
                                    指示: {draft.instruction}
                                </p>
                            )}
                            <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded mb-3">
                                {draft.content}
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">
                                    作成: {new Date(draft.createdAt).toLocaleString('ja-JP')}
                                </p>
                                {draft.sent ? (
                                    <span className="text-green-600 font-medium">送信済み</span>
                                ) : (
                                    <div className="space-x-2">
                                        <button
                                            onClick={() => sendReply(draft.id, draft.content)}
                                            className="bg-green-500 text-white px-4 py-1 rounded 
                                                hover:bg-green-600 transition-colors"
                                        >
                                            送信
                                        </button>
                                        <button
                                            onClick={() => deleteDraft(draft.id)}
                                            className="bg-red-500 text-white px-4 py-1 rounded 
                                                hover:bg-red-600 transition-colors"
                                        >
                                            削除
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}