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

// notification 필드가 있으면 브라우저가 자동 표시 → onBackgroundMessage는 실행 안 됨
// 단, webpush.notification.tag를 지정해두면 자동 표시 시에도 tag가 적용되어 중복 덮어쓰기됨
// → onBackgroundMessage는 notification 없는 data-only 메시지에만 실행되므로
//    현재 구조(notification 있음)에서는 이 핸들러 불필요
// 하지만 만약의 경우를 위해 유지 (notification + data 둘 다 처리)
messaging.onBackgroundMessage(payload => {
  const n = payload.notification || {};
  const d = payload.data || {};

  const title = n.title || d.title || '약 쏘옥';
  const body  = n.body  || d.body  || '';
  const tag   = d.tag   || 'yakssook';

  // notification 필드가 있으면 브라우저가 이미 자동 표시했을 수 있음
  // tag가 같으면 덮어쓰기되므로 중복 없음
  self.registration.showNotification(title, {
    body,
    icon: '/yakssook/icon-192.png',
    badge: '/yakssook/icon-192.png',
    tag,
    renotify: true,
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
