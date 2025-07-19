'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Navigation() {
    const { data: session } = useSession()

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex gap-4">
                    <Link href="/" className="hover:text-gray-300">
                        ホーム
                    </Link>
                    <Link href="/emails/check" className="hover:text-gray-300 bg-red-600 px-3 py-1 rounded">
                        📧 新着メール確認
                    </Link>
                    <Link href="/emails" className="hover:text-gray-300">
                        メール一覧
                    </Link>
                    <Link href="/expenses" className="hover:text-gray-300">
                        支出
                    </Link>
                    <Link href="/receipt" className="hover:text-gray-300">
                        レシート
                    </Link>
                </div>
                
                <div className="flex items-center gap-4">
                    {session ? (
                        <>
                            <span className="text-sm">{session.user?.email}</span>
                            <button
                                onClick={() => signOut({ callbackUrl: '/auth' })}
                                className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                                ログアウト
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/auth"
                            className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                            ログイン
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}