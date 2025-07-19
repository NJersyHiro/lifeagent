'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function EmailCheckPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [checking, setChecking] = useState(true)
    const [message, setMessage] = useState('新着メールをチェック中...')

    useEffect(() => {
        if (!session) {
            router.push('/auth')
            return
        }

        const checkForNewEmail = async () => {
            try {
                setMessage('新着メールを取得中...')
                
                // 新着メールを取得
                const fetchRes = await fetch('/api/gmail/fetch')
                const fetchData = await fetchRes.json()
                
                if (!fetchRes.ok) {
                    setMessage(`メールの取得に失敗しました: ${fetchData.error || 'Unknown error'}`)
                    setChecking(false)
                    return
                }

                setMessage('取得したメールを確認中...')

                // 最新の未読メールを確認
                const webhookRes = await fetch('/api/emails/webhook')
                if (webhookRes.ok) {
                    const { emailId } = await webhookRes.json()
                    if (emailId) {
                        setMessage('新着メールが見つかりました。リダイレクト中...')
                        // 少し待ってからリダイレクト
                        setTimeout(() => {
                            router.push(`/emails/${emailId}?autoGenerate=true`)
                        }, 1000)
                    } else {
                        setMessage('新着メールはありません')
                        setChecking(false)
                    }
                } else {
                    setMessage('メールの確認に失敗しました')
                    setChecking(false)
                }
            } catch (error) {
                console.error('Error checking emails:', error)
                setMessage(`エラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
                setChecking(false)
            }
        }

        checkForNewEmail()
    }, [session, router])

    return (
        <main className="p-4 max-w-md mx-auto mt-20">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                {checking ? (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-lg">{message}</p>
                    </>
                ) : (
                    <>
                        <p className="text-lg mb-4">{message}</p>
                        <button
                            onClick={() => router.push('/emails')}
                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                        >
                            メール一覧へ
                        </button>
                    </>
                )}
            </div>
        </main>
    )
}