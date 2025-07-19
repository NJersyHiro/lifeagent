'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export default function AuthPage() {
    const { data: session, status } = useSession()

    if (status === 'loading') {
        return (
            <main className="p-4 max-w-md mx-auto mt-10">
                <p>読み込み中...</p>
            </main>
        )
    }

    return (
        <main className="p-4 max-w-md mx-auto mt-10">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">認証管理</h1>
                
                {session ? (
                    <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-md">
                            <p className="text-green-800 font-medium">ログイン中</p>
                            <p className="text-sm text-gray-600 mt-1">
                                {session.user?.email}
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                アクセストークン: {session.access_token ? '取得済み' : '未取得'}
                            </p>
                        </div>

                        <button
                            onClick={() => signOut({ callbackUrl: '/auth' })}
                            className="w-full bg-red-500 text-white px-4 py-2 rounded-md 
                                hover:bg-red-600 transition-colors"
                        >
                            ログアウト
                        </button>

                        <div className="pt-4 border-t space-y-2">
                            <a
                                href="/emails"
                                className="block w-full bg-blue-500 text-white px-4 py-2 rounded-md 
                                    hover:bg-blue-600 transition-colors text-center"
                            >
                                メール一覧へ
                            </a>
                            <a
                                href="/api/gmail/fetch"
                                className="block w-full bg-green-500 text-white px-4 py-2 rounded-md 
                                    hover:bg-green-600 transition-colors text-center"
                            >
                                新着メールを取得
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Googleアカウントでログインしてください。
                            Gmail、カレンダーへのアクセス許可が必要です。
                        </p>
                        
                        <button
                            onClick={() => signIn('google', { callbackUrl: '/auth' })}
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md 
                                hover:bg-blue-600 transition-colors flex items-center 
                                justify-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Googleでログイン
                        </button>

                        <div className="text-sm text-gray-500 mt-4">
                            <p>ログイン時に以下の権限を要求します：</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>基本的なプロフィール情報</li>
                                <li>Gmailの読み取り・送信</li>
                                <li>Googleカレンダーのイベント管理</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}