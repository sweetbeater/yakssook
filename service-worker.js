// 약 쏘옥 Service Worker
// firebase-messaging 라이브러리 없이 push 이벤트 직접 처리
// → onBackgroundMessage 중복 문제 완전 해결

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
