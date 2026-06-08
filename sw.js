const CACHE_NAME = 'techrider-v74';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './dist.css'
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

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const accept = req.headers.get('accept') || '';
  const isHTML = req.mode === 'navigate' || accept.includes('text/html');
  // 코드 자산(HTML/CSS/JS)은 항상 네트워크 우선 → HTML·CSS·JS 버전이 어긋나 레이아웃이
  // 깨지는 문제 방지. 성공 시 캐시 갱신, 실패(오프라인) 시에만 캐시로 폴백.
  const isCode = isHTML || (sameOrigin && /\.(css|js)$/.test(url.pathname));

  if (isCode) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => {
          c.put(isHTML ? './index.html' : req, copy);
        }).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then((c) => c || (isHTML ? caches.match('./index.html') : undefined)))
    );
    return;
  }
  // 그 외 정적 자산(이미지/매니페스트/아이콘 등)은 캐시 우선
  e.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
