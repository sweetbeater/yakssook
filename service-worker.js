importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyArCJz3f9WKjIl9N-nzFtQzy7EAE8KjnAM",
  authDomain: "yakssook-c924f.firebaseapp.com",
  projectId: "yakssook-c924f",
  storageBucket: "yakssook-c924f.firebasestorage.app",
  messagingSenderId: "1053954576861",
  appId: "1:1053954576861:web:1b8aab71b34a5a2897e634"
});

const messaging = firebase.messaging();

// 백그라운드 FCM 푸시 수신
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || '약 쏘옥';
  const body  = payload.notification?.body  || '파트너가 약을 복용했어요!';
  const icon  = '/icon-192.svg';

  self.registration.showNotification(title, {
    body,
    icon,
    badge: icon,
    vibrate: [200, 100, 200],
    tag: 'yakssook-' + Date.now(),
    data: payload.data || {}
  });
});

// 알림 클릭 → 앱 열기
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});
