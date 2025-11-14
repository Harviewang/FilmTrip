// Service Worker for MapTiler caching
// 简单的Service Worker，用于缓存MapTiler地图瓦片

const CACHE_NAME = 'maptiler-cache-v1';

// 安装Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting(); // 立即激活新的Service Worker
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // 立即控制所有客户端
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  // 只缓存MapTiler相关的请求
  if (event.request.url.includes('maptiler') || event.request.url.includes('api.tiles.mapbox.com')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // 如果缓存中有响应，返回缓存
        if (response) {
          return response;
        }
        // 否则从网络获取
        return fetch(event.request).then((response) => {
          // 检查响应是否有效
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // 克隆响应
          const responseToCache = response.clone();
          // 将响应添加到缓存
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
    );
  }
  // 对于其他请求，直接通过
});
