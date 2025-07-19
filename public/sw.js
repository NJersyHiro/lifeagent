// Service Worker for background email checking
const CACHE_NAME = 'lifeagent-v1';

self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
    event.waitUntil(clients.claim());
});

// プッシュ通知の処理
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || '新しいメールが届きました',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            data: { emailId: data.emailId }
        };

        event.waitUntil(
            self.registration.showNotification('新着メール', options)
        );
    }
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.notification.data && event.notification.data.emailId) {
        const url = `/emails/${event.notification.data.emailId}?autoGenerate=true`;
        
        event.waitUntil(
            clients.openWindow(url)
        );
    }
});