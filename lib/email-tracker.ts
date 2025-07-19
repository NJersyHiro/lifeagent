// メールの処理状態を管理するユーティリティ

const PROCESSED_EMAILS_KEY = 'processedEmailIds'
const MAX_STORED_IDS = 100

// 処理済みメールIDをメモリとlocalStorageで管理
class EmailTracker {
    private processedIds: Set<string>
    
    constructor() {
        this.processedIds = new Set()
        this.loadFromStorage()
    }
    
    private loadFromStorage() {
        if (typeof window === 'undefined') return
        
        try {
            const stored = localStorage.getItem(PROCESSED_EMAILS_KEY)
            if (stored) {
                const ids = JSON.parse(stored) as string[]
                ids.forEach(id => this.processedIds.add(id))
            }
        } catch (error) {
            console.error('Failed to load processed emails:', error)
        }
    }
    
    private saveToStorage() {
        if (typeof window === 'undefined') return
        
        try {
            // 最新のMAX_STORED_IDS件のみ保持
            const ids = Array.from(this.processedIds).slice(-MAX_STORED_IDS)
            localStorage.setItem(PROCESSED_EMAILS_KEY, JSON.stringify(ids))
        } catch (error) {
            console.error('Failed to save processed emails:', error)
        }
    }
    
    hasProcessed(emailId: string): boolean {
        return this.processedIds.has(emailId)
    }
    
    markAsProcessed(emailId: string) {
        this.processedIds.add(emailId)
        this.saveToStorage()
    }
    
    clear() {
        this.processedIds.clear()
        if (typeof window !== 'undefined') {
            localStorage.removeItem(PROCESSED_EMAILS_KEY)
        }
    }
}

// シングルトンインスタンス
export const emailTracker = typeof window !== 'undefined' ? new EmailTracker() : null