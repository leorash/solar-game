// =========================================================================
// 合成大太阳 · Service Worker（新增文件）
// 作用：
// 1. 长效本地缓存，突破 GitHub Pages 仅 Cache-Control: max-age=600（10 分钟）
//    的缓存限制，二次访问与离线场景下资源秒开；
// 2. 图片/音频采用缓存优先，命中缓存即直接返回，不再发起网络请求；
// 3. 预加载器（preload.js）发出的请求会被本文件自动捕获并写入缓存。
// 更新方式：提升下方 CACHE_VERSION 版本号，客户端会自动清理旧缓存并更新。
// =========================================================================
var CACHE_VERSION = 'solar-game-v1';

// 应用骨架：体积小、每次访问必需，安装阶段立即预缓存
var APP_SHELL = [
    './',
    './index.html',
    './css/styles.css',
    './data/game-data.js',
    './js/game.js',
    './js/preload.js'
];

// 安装：预缓存应用骨架；图片/音频走运行时缓存，避免单个资源失败导致安装失败
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(function (cache) { return cache.addAll(APP_SHELL); })
            .then(function () { return self.skipWaiting(); })
    );
});

// 激活：清理所有旧版本缓存并立即接管页面
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key) {
                if (key !== CACHE_VERSION) return caches.delete(key);
            }));
        }).then(function () { return self.clients.claim(); })
    );
});

// 缓存优先 + 后台更新（Stale While Revalidate）
function staleWhileRevalidate(request) {
    return caches.match(request).then(function (cached) {
        var fetchPromise = fetch(request).then(function (response) {
            if (response && response.status === 200 && response.type === 'basic') {
                var copy = response.clone();
                caches.open(CACHE_VERSION).then(function (cache) { cache.put(request, copy); });
            }
            return response;
        }).catch(function () { return cached; });
        return cached || fetchPromise;
    });
}

// 缓存优先（Cache First）：命中即返回，未命中才走网络并写入缓存
function cacheFirst(request) {
    return caches.match(request).then(function (cached) {
        if (cached) return cached;
        return fetch(request).then(function (response) {
            if (response && response.status === 200 && response.type === 'basic') {
                var copy = response.clone();
                caches.open(CACHE_VERSION).then(function (cache) { cache.put(request, copy); });
            }
            return response;
        });
    });
}

self.addEventListener('fetch', function (event) {
    var req = event.request;
    if (req.method !== 'GET') return;

    var url = new URL(req.url);

    if (url.origin === self.location.origin) {
        // 同源资源：
        // - 文档导航 → SWR，保证 HTML 有更新时能及时拿到新版本
        // - 图片/音频/样式/脚本 → 缓存优先，命中即秒开
        if (req.mode === 'navigate') {
            event.respondWith(staleWhileRevalidate(req));
        } else if (/\.(webp|mp3|css|js|woff2?|png|jpe?g|svg)$/i.test(url.pathname)) {
            event.respondWith(cacheFirst(req));
        } else {
            event.respondWith(staleWhileRevalidate(req));
        }
        return;
    }

    // 跨域 CDN：网络优先，成功响应（含 opaque）才缓存；离线时回退缓存
    if (/cdn|cdnjs|jsdelivr|tailwind/.test(url.hostname)) {
        event.respondWith(
            fetch(req).then(function (response) {
                if (response && (response.status === 200 || response.type === 'opaque')) {
                    var copy = response.clone();
                    caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, copy); });
                }
                return response;
            }).catch(function () {
                return caches.match(req);
            })
        );
    }
});
