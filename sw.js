const CACHE_NAME = '99asmr-shell-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png'
];

// 安装时缓存核心文件
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 激活时接管页面
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 拦截请求：优先从网络获取，网络失败（如域名挂了）则从本地缓存获取
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});