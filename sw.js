const CACHE_NAME = 'techrider-v45';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Firebase 등 실시간 통신은 캐시하지 않음(항상 네트워크)
  if (/firebaseio\.com|googleapis\.com|gstatic\.com\/firebasejs/.test(req.url)) return;
  const accept = req.headers.get('accept') || '';
  // HTML(코드)은 네트워크 우선 → 배포 변경 즉시 반영, 오프라인 시 캐시
  if (req.mode === 'navigate' || accept.includes('text/html')) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put('./index.html', copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
    );
    return;
  }
  // 그 외 정적 자산은 캐시 우선
  e.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
