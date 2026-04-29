// 약 쏘옥 Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const FB_CONFIG = {
  apiKey: "AIzaSyArCJz3f9WKjIl9N-nzFtQzy7EAE8KjnAM",
  authDomain: "yakssook-c924f.firebaseapp.com",
  projectId: "yakssook-c924f",
  storageBucket: "yakssook-c924f.firebasestorage.app",
  messagingSenderId: "1053954576861",
  appId: "1:1053954576861:web:1b8aab71b34a5a2897e634"
};

firebase.initializeApp(FB_CONFIG);
const messaging = firebase.messaging();

// ── 백그라운드 FCM 수신 (앱이 닫혀 있을 때만 실행됨) ──
// 앱이 열려있을 때는 onMessage(포그라운드)가 처리하므로 여기선 실행 안 됨 → 중복 없음
messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {};
  const data = payload.data || {};
  const tag = data.tag || 'yakssook-notif';

  self.registration.showNotification(title || '약 쏘옥', {
    body: body || '',
    icon: '/yakssook/icon-192.png',
    badge: '/yakssook/icon-192.png',
    tag: tag,
    renotify: true,
    data: data
  });
});

// ── 알림 클릭 시 앱 포커스 ──
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('yakssook') && 'focus' in c) return c.focus();
      }
      return clients.openWindow('/yakssook/');
    })
  );
});

// ── 설치/활성화 ──
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
