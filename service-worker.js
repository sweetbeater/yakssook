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

// onBackgroundMessage를 등록하되 showNotification은 호출하지 않음
// → Firebase SDK가 브라우저 자동 표시를 가로채서 여기로 보내지만 아무것도 안 함
// → 대신 push 이벤트에서 직접 1번만 표시
messaging.onBackgroundMessage(() => {
  // 의도적으로 비워둠: push 이벤트에서 처리
});

// push 이벤트: 실제 알림 표시 (1번만)
self.addEventListener('push', e => {
  if (!e.data) return;
  let payload;
  try { payload = e.data.json(); } catch { return; }

  const n = payload.notification || {};
  const d = payload.data || {};
  const title = n.title || d.title || '약 쏘옥';
  const body  = n.body  || d.body  || '';
  const tag   = d.tag   || 'yakssook';

  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/yakssook/icon-192.png',
      badge: '/yakssook/icon-192.png',
      tag,
      renotify: true,
      data: d,
    })
  );
});

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

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
