/* 少女工作台 Service Worker - 离线缓存 */
const CACHE_NAME = 'gwdt-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg'
];

// 安装：预缓存核心资源
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// 拦截请求：cache-first 策略
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // 缓存新获取的同源资源
        if (resp && resp.status === 200 && new URL(e.request.url).origin === self.location.origin) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});

// 接收消息：允许页面主动触发更新
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
