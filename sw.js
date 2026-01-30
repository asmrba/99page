const CACHE_NAME = '99asmr-v2.7'; // 每次更新代码请务必修改此版本号
const OFFLINE_URL = '/offline.html';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  OFFLINE_URL
];

// 1. 安装阶段：强制跳过等待
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // 强制当前安装的 SW 进入激活状态，不要排队等待旧 SW 退出
  self.skipWaiting();
});

// 2. 激活阶段：清理旧缓存并立即夺权
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => { 
        if (key !== CACHE_NAME) {
          console.log('清理旧缓存:', key);
          return caches.delete(key); 
        }
      })
    ))
  );
  // 关键：让新 SW 立即获得页面的控制权
  self.clients.claim();
});

// 3. 请求拦截
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // 网络请求失败（离线）时，从缓存返回离线页面
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // 优先返回缓存，如果没有则请求网络
        return response || fetch(event.request);
      })
    );
  }
});

