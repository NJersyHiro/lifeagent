'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { emailTracker } from '@/lib/email-tracker'

export default function EmailMonitor() {
    const { data: session } = useSession()
    const [isMonitoring, setIsMonitoring] = useState(false)
    const [lastCheck, setLastCheck] = useState<Date | null>(null)
    const [nextCheck, setNextCheck] = useState<Date | null>(null)
    const [isChecking, setIsChecking] = useState(false)
    const [serverMonitoring, setServerMonitoring] = useState(true) // サーバー側の監視状態
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const checkIntervalMs = 30 * 60 * 1000 // 30分
    const lastOpenedRef = useRef<string | null>(null)
    const isMounted = useRef(true)

    // ローカルストレージから監視状態を復元
    useEffect(() => {
        isMounted.current = true
        
        // サーバー側の監視状態を確認
        fetch('/api/gmail/status')
            .then(res => res.json())
            .then(data => {
                if (data.serverMonitoring !== undefined) {
                    setServerMonitoring(data.serverMonitoring)
                }
            })
            .catch(err => console.error('Failed to fetch server monitoring status:', err))
        
        return () => {
            isMounted.current = false
        }
    }, [])

    useEffect(() => {
        if (!session || !isMounted.current) return

        const savedState = localStorage.getItem('emailMonitoring')
        if (savedState === 'true' && !isMonitoring) {
            startMonitoring()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])

    const checkNewEmails = async () => {
        if (!session || isChecking || !isMounted.current) return

        setIsChecking(true)
        try {
            console.log('Checking for new emails...')
            setLastCheck(new Date())

            // 新着メールを取得
            const fetchRes = await fetch('/api/gmail/fetch')
            const fetchData = await fetchRes.json()
            
            if (!fetchRes.ok) {
                console.error('Failed to fetch emails:', fetchData.error || 'Unknown error')
                
                // 認証エラーの場合は通知
                if (fetchRes.status === 401) {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('認証エラー', {
                            body: '再度ログインしてください',
                            icon: '/favicon.ico'
                        })
                    }
                    // 監視を停止
                    stopMonitoring()
                    // ログインページへリダイレクト
                    window.location.href = '/auth'
                }
                return
            }

            console.log('Fetched emails:', fetchData.message)

            // 最新の未読メールを確認
            const webhookRes = await fetch('/api/emails/webhook')
            if (webhookRes.ok) {
                const { emailId } = await webhookRes.json()
                if (emailId && emailTracker && !emailTracker.hasProcessed(emailId)) {
                    console.log('New email found:', emailId)
                    emailTracker.markAsProcessed(emailId)
                    
                    // 新しいタブでメール詳細を開く
                    const url = `${window.location.origin}/emails/${emailId}?autoGenerate=true`
                    window.open(url, '_blank')

                    // 通知を表示（権限がある場合）
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('新着メール', {
                            body: '新しいメールが届きました。返信を自動生成しています。',
                            icon: '/favicon.ico'
                        })
                    }
                } else {
                    console.log('No new emails or already processed')
                }
            }
        } catch (error) {
            console.error('Error checking emails:', error)
        } finally {
            setIsChecking(false)
        }
    }

    const startMonitoring = async () => {
        if (!session) return

        setIsMonitoring(true)
        localStorage.setItem('emailMonitoring', 'true')

        // 通知の許可を求める
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission()
        }

        // 即座に一度チェック
        await checkNewEmails()

        // 定期的なチェックを開始
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        intervalRef.current = setInterval(() => {
            checkNewEmails()
        }, checkIntervalMs)

        // 次回チェック時刻を更新
        const updateNextCheck = () => {
            setNextCheck(new Date(Date.now() + checkIntervalMs))
        }
        updateNextCheck()

        // 1分ごとに次回チェック時刻の表示を更新
        const updateInterval = setInterval(updateNextCheck, 60000)

        return () => {
            clearInterval(updateInterval)
        }
    }

    const stopMonitoring = () => {
        setIsMonitoring(false)
        localStorage.setItem('emailMonitoring', 'false')
        
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        
        setNextCheck(null)
        lastOpenedRef.current = null
    }

    // クリーンアップ
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    if (!session) return null

    const formatTime = (date: Date | null) => {
        if (!date) return '-'
        return date.toLocaleTimeString('ja-JP')
    }

    const getTimeUntilNext = () => {
        if (!nextCheck) return ''
        const diff = nextCheck.getTime() - Date.now()
        if (diff <= 0) return '間もなく'
        const minutes = Math.floor(diff / 60000)
        return `${minutes}分後`
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 min-w-[200px]">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                メール自動監視
                {isMonitoring && (
                    <span className="animate-pulse text-green-500">●</span>
                )}
            </h3>
            
            <div className="text-xs space-y-1 mb-3">
                <p>状態: {isChecking ? '🔄 確認中...' : isMonitoring ? '🟢 監視中' : '⚫ 停止中'}</p>
                {serverMonitoring && (
                    <p className="text-blue-600">🤖 サーバー自動監視: 有効</p>
                )}
                {lastCheck && (
                    <p>最終確認: {formatTime(lastCheck)}</p>
                )}
                {isMonitoring && nextCheck && !isChecking && (
                    <p>次回確認: {getTimeUntilNext()}</p>
                )}
                {!session && (
                    <p className="text-red-500">ログインが必要です</p>
                )}
            </div>

            {isMonitoring ? (
                <button
                    onClick={stopMonitoring}
                    disabled={isChecking}
                    className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isChecking ? '確認中...' : '監視を停止'}
                </button>
            ) : (
                <button
                    onClick={startMonitoring}
                    disabled={isChecking}
                    className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    監視を開始
                </button>
            )}

            <p className="text-xs text-gray-500 mt-2">
                {serverMonitoring ? 'サーバーが自動監視中' : '30分ごとに新着メールを確認'}
            </p>
        </div>
    )
}