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

// notification 필드가 있는 FCM 메시지:
// 브라우저가 자동으로 알림을 표시 → onBackgroundMessage는 호출되지 않음
// 단, firebase-messaging-compat은 onBackgroundMessage를 등록만 해도
// 브라우저 자동 표시를 막고 여기서 처리하므로 tag 지정으로 중복 방지
messaging.onBackgroundMessage(payload => {
  const n = payload.notification || {};
  const d = payload.data || {};
  const title = n.title || d.title || '약 쏘옥';
  const body  = n.body  || d.body  || '';
  const tag   = d.tag   || 'yakssook';

  // tag가 같으면 기존 알림을 대체 → 중복 없음
  return self.registration.showNotification(title, {
    body,
    icon: '/yakssook/icon-192.png',
    badge: '/yakssook/icon-192.png',
    tag,
    renotify: false, // 같은 tag 재알림 안 함 → 진동/소리 중복 방지
    data: d,
  });
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
