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

// 5초 내 같은 tag 중복 차단
const recentNotifs = new Map();

messaging.onBackgroundMessage(payload => {
  const d = payload.data || {};
  const title = d.title || '약 쏘옥';
  const body  = d.body  || '';
  const tag   = d.tag   || 'yakssook';

  const now = Date.now();
  const last = recentNotifs.get(tag) || 0;
  if (now - last < 5000) return; // 5초 내 중복 차단
  recentNotifs.set(tag, now);

  return self.registration.showNotification(title, {
    body,
    icon: '/yakssook/icon-192.png',
    badge: '/yakssook/icon-192.png',
    tag,
    renotify: false,
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
