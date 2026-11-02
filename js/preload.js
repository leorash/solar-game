// =========================================================================
// 合成大太阳 · 资源预加载器（新增文件，不改动任何原有逻辑/文本/图片）
// 作用：在游戏运行的同时，于浏览器空闲时段后台分级预取全部贴图与音频，
//       使后续打开知识卡、战功硬币、战功图鉴时图片即时显示，无需等待下载。
// 兼容 http(s) 与 file:// 协议；file:// 下仅跳过 Service Worker 注册。
// =========================================================================
(function () {
    'use strict';

    // 从静态数据中收集全部贴图路径，并按用途分为三个优先级
    function collectUrls() {
        const cards = new Set();
        const planets = new Set();
        const merits = new Set();

        // 注意：game-data.js 以顶层 const 声明 PLANETS / MERITS，
        // const/let 属于全局词法绑定、不会挂到 window 上，因此这里直接引用
        // 全局标识符（typeof 对未声明标识符也安全），而非 window.PLANETS。
        const planetList = (typeof PLANETS !== 'undefined') ? PLANETS : null;
        const meritMap = (typeof MERITS !== 'undefined') ? MERITS : null;

        if (Array.isArray(planetList)) {
            planetList.forEach(function (p) {
                if (p.image) cards.add(p.image);
                if (p.godImage) planets.add(p.godImage);
            });
        }
        if (meritMap && typeof meritMap === 'object') {
            Object.keys(meritMap).forEach(function (k) {
                const m = meritMap[k];
                if (m && m.image) merits.add(m.image);
            });
        }

        // 威胁卡 / 黑洞卡修复后实际使用的贴图（确保同样被提前预取）
        planets.add('assets/planets/debris.webp');
        merits.add('assets/merits/chaos_abyss.webp');

        // 优先级从高到低：知识卡正面 → 卡背面神祇 → 战功硬币（体积最大）
        return {
            tiers: [
                Array.from(cards),
                Array.from(planets),
                Array.from(merits)
            ]
        };
    }

    // 音频清单（低优先级，全部贴图就绪后再加载）
    const AUDIO_URLS = [
        'assets/audio/norm.mp3',
        'assets/audio/raree.mp3',
        'assets/audio/epic.mp3',
        'assets/audio/legen.mp3',
        'assets/audio/god.mp3',
        'assets/audio/diguojinxingqu.mp3',
        'assets/audio/finale.mp3'
    ];

    const CONCURRENCY = 4; // 同时进行的下载数，避免抢占带宽、拖慢物理动画
    const state = { total: 0, done: 0, failed: [] };
    const holders = []; // 持有 Image/Audio 引用，防止被垃圾回收而中断下载

    function idle(cb) {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(cb, { timeout: 2000 });
        } else {
            setTimeout(cb, 200);
        }
    }

    function preloadOne(url, isAudio, isRetry) {
        return new Promise(function (resolve) {
            const el = isAudio ? new Audio() : new Image();
            holders.push(el);
            let settled = false;
            let hasRetried = false;
            let timer = null;

            const finish = function (ok) {
                if (settled) return;
                settled = true;
                if (timer) clearTimeout(timer);
                state.done++;
                if (!ok) state.failed.push(url);
                if (typeof window.__preloadProgress === 'function') {
                    window.__preloadProgress({ loaded: state.done, total: state.total, failed: state.failed.length });
                }
                resolve(ok);
            };

            // 绑定单个元素的成功/失败事件
            function bind(elm) {
                if (isAudio) {
                    // 媒体元素在不播放时通用 load 事件不一定触发，
                    // 以 canplaythrough / loadeddata 作为成功信号，并加超时兜底
                    elm.preload = 'auto';
                    elm.addEventListener('canplaythrough', function () { finish(true); });
                    elm.addEventListener('loadeddata', function () { finish(true); });
                    timer = setTimeout(function () { finish(true); }, 10000);
                } else {
                    elm.addEventListener('load', function () { finish(true); });
                }
                elm.addEventListener('error', function () {
                    // 弱网环境下失败自动重试一次（hasRetried 保证只重试一次）
                    if (hasRetried) { finish(false); return; }
                    hasRetried = true;
                    const retryEl = isAudio ? new Audio() : new Image();
                    holders.push(retryEl);
                    bind(retryEl);
                    retryEl.src = url;
                });
            }

            bind(el);
            el.src = url;
        });
    }

    // 并发执行一个队列（内部多个 worker 共同消费）
    async function runQueue(urls, isAudio) {
        let index = 0;
        async function worker() {
            while (index < urls.length) {
                const url = urls[index++];
                await preloadOne(url, isAudio, false);
            }
        }
        const workers = [];
        for (let i = 0; i < Math.min(CONCURRENCY, urls.length); i++) workers.push(worker());
        await Promise.all(workers);
    }

    async function start() {
        let info;
        try {
            info = collectUrls();
        } catch (e) {
            console.warn('[preload] 资源收集失败，预加载跳过', e);
            return;
        }

        const imageCount = info.tiers.reduce(function (n, arr) { return n + arr.length; }, 0);
        state.total = imageCount + AUDIO_URLS.length;

        // 分级顺序加载：高优先级队列完成后再进入下一级，每级内部并发
        for (let t = 0; t < info.tiers.length; t++) {
            await new Promise(function (resolve) { idle(resolve); });
            await runQueue(info.tiers[t], false);
        }

        // 全部贴图就绪后，再在空闲时预取音频
        await new Promise(function (resolve) { idle(resolve); });
        await runQueue(AUDIO_URLS, true);

        console.log('[preload] 预加载结束，成功 ' + (state.total - state.failed.length) + '/' + state.total +
            (state.failed.length ? '，失败：' + state.failed.join(', ') : ''));
    }

    // 暴露进度与状态（可选，便于在控制台调试）
    window.__preloadState = state;

    // 启动预加载：调度在空闲时段，不阻塞首屏渲染与游戏初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { idle(start); });
    } else {
        idle(start);
    }

    // 注册 Service Worker（仅 http(s) 环境；file:// 下自动跳过）
    if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').then(function (reg) {
                console.log('[preload] Service Worker 注册成功，scope:', reg.scope);
            }).catch(function (err) {
                console.warn('[preload] Service Worker 注册失败', err);
            });
        });
    }
})();
