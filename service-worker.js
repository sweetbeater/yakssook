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

// ─────────────────────────────────────────────
// 캐시 버전 전략
// 앱 배포 후 강제로 캐시를 비우고 싶을 때 아래 버전 숫자만 올리면 됩니다.
const CACHE = 'yakssook-v1';
// 오프라인 폴백용 앱 셸 (네트워크 우선이라 온라인이면 항상 최신본을 받습니다)
const PRECACHE = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // 일부 자산이 404여도 설치가 실패하지 않도록 개별 처리
      .then(c => Promise.allSettled(PRECACHE.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 외부 요청(gstatic CDN, Firebase/Firestore 등)은 가로채지 않음 → 실시간 데이터 보존
  if (url.origin !== self.location.origin) return;

  // HTML(앱 화면): 네트워크 우선 → 실패 시 캐시 → 최종 index.html 폴백
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const cp = res.clone();
          caches.open(CACHE).then(c => c.put(req, cp));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // 정적 자산(아이콘/매니페스트 등): 캐시 우선 + 백그라운드 갱신(stale-while-revalidate)
  e.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res && res.status === 200) {
          const cp = res.clone();
          caches.open(CACHE).then(c => c.put(req, cp));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
