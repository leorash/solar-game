// =========================================================================
// 合成大太阳 · 游戏逻辑
// 依赖：Matter.js（物理）、Tone.js（音频）、data/game-data.js（静态数据）
// 所有音频均为本地相对路径（assets/audio）
// =========================================================================

// =========================================================================
// 音效系统
// =========================================================================
let audioCtxStarted = false;
const synths = {};

function initAudio() {
    if (audioCtxStarted) return;
    Tone.start();
    audioCtxStarted = true;

    synths.drop = new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 2 }).toDestination();
    synths.drop.volume.value = -10;
    synths.merge = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.5 }
    }).toDestination();
    synths.merge.volume.value = -8;
    synths.unlock = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "triangle" } }).toDestination();
    synths.unlock.volume.value = -5;
    synths.blackhole = new Tone.MetalSynth({
        frequency: 100,
        envelope: { attack: 0.05, decay: 0.2, release: 0.5 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
    }).toDestination();
    synths.blackhole.volume.value = -12;
    synths.gameOver = new Tone.FMSynth().toDestination();
    synths.gameOver.volume.value = -5;
    synths.explosion = new Tone.NoiseSynth({
        noise: { type: 'brown' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.1 }
    }).toDestination();
    synths.explosion.volume.value = -3;
    synths.dissipate = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.5, decay: 1.5, sustain: 0, release: 0.5 }
    }).toDestination();
    synths.dissipate.volume.value = -8;
    synths.imperial = new Tone.Player({
        url: "assets/audio/diguojinxingqu.mp3",
        autoplay: false,
        onload: () => console.log("废弃空间站配乐加载成功"),
        onerror: (e) => console.error("废弃空间站配乐加载失败", e)
    }).toDestination();
    synths.imperial.volume.value = -15;
    synths.epicCommon = new Tone.Player({
        url: "assets/audio/norm.mp3",
        autoplay: false,
        onload: () => console.log("普通战功音乐加载成功"),
        onerror: (e) => console.error("普通战功音乐加载失败", e)
    }).toDestination();
    synths.epicCommon.volume.value = -15;
    synths.epicRare = new Tone.Player({
        url: "assets/audio/raree.mp3",
        autoplay: false,
        onload: () => console.log("稀有战功音乐加载成功"),
        onerror: (e) => console.error("稀有战功音乐加载失败", e)
    }).toDestination();
    synths.epicRare.volume.value = -15;
    synths.epicEpic = new Tone.Player({
        url: "assets/audio/epic.mp3",
        autoplay: false,
        onload: () => console.log("史诗战功音乐加载成功"),
        onerror: (e) => console.error("史诗战功音乐加载失败", e)
    }).toDestination();
    synths.epicEpic.volume.value = -15;
    synths.epicLegendary = new Tone.Player({
        url: "assets/audio/legen.mp3",
        autoplay: false,
        onload: () => console.log("传说战功音乐加载成功"),
        onerror: (e) => console.error("传说战功音乐加载失败", e)
    }).toDestination();
    synths.epicLegendary.volume.value = -15;
    synths.epic = new Tone.Player({
        url: "assets/audio/epic.mp3",
        autoplay: false,
        onload: () => console.log("战功音乐加载成功"),
        onerror: (e) => console.error("战功音乐加载失败", e)
    }).toDestination();
    synths.epic.volume.value = -15;
    synths.god = new Tone.Player({
        url: "assets/audio/god.mp3",
        autoplay: false,
        onload: () => console.log("神祇配乐加载成功"),
        onerror: (e) => console.error("神祇配乐加载失败", e)
    }).toDestination();
    synths.god.volume.value = -15;
    synths.ohoh = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.05, decay: 0.1, sustain: 0.2, release: 0.2 }
    }).toDestination();
    synths.ohoh.volume.value = -2;
    synths.galleryMusic = new Tone.Player({
        url: "assets/audio/finale.mp3",
        autoplay: false,
        loop: true,
        onload: () => console.log("图鉴背景音乐加载成功"),
        onerror: (e) => console.error("图鉴背景音乐加载失败", e)
    }).toDestination();
    synths.galleryMusic.volume.value = -18;

    document.getElementById('hintText').innerText = "开始你的太阳系探秘之旅";
}

// 可靠播放一个 Tone.Player：
// 已加载则立即播放；未加载则轮询等待加载完成后再播放。
// （不依赖 Tone.Player 延迟设置 onload——该方式在加载已开始后注册回调时不会被触发）
const playerWaitTimers = new Map();
function startPlayer(player) {
    if (!player) return;
    if (player.loaded) {
        try { player.start(); } catch (e) { /* ignore */ }
        return;
    }
    if (playerWaitTimers.has(player)) { clearInterval(playerWaitTimers.get(player)); }
    const iv = setInterval(() => {
        if (player.loaded) {
            clearInterval(iv);
            playerWaitTimers.delete(player);
            try { player.start(); } catch (e) { /* ignore */ }
        }
    }, 60);
    playerWaitTimers.set(player, iv);
}

function playSound(type, level = 0) {
    if (!audioCtxStarted) return;
    Tone.start();
    switch (type) {
        case 'drop':
            synths.drop.triggerAttackRelease("C2", "8n");
            break;
        case 'imperial':
            startPlayer(synths.imperial);
            break;
        case 'ohoh':
            const nowO = Tone.now();
            synths.ohoh.triggerAttackRelease("D4", "16n", nowO);
            synths.ohoh.triggerAttackRelease("G4", "8n", nowO + 0.2);
            break;
        case 'merge':
            const baseFreq = 220 + (level * 30);
            synths.merge.triggerAttackRelease(baseFreq, "8n");
            break;
        case 'unlock':
            const now = Tone.now();
            synths.unlock.triggerAttackRelease("C4", "16n", now);
            synths.unlock.triggerAttackRelease("E4", "16n", now + 0.1);
            synths.unlock.triggerAttackRelease("G4", "16n", now + 0.2);
            synths.unlock.triggerAttackRelease("C5", "8n", now + 0.3);
            break;
        case 'blackhole':
            synths.blackhole.triggerAttackRelease("32n");
            break;
        case 'explosion':
            synths.explosion.triggerAttackRelease("8n");
            break;
        case 'dissipate':
            synths.dissipate.triggerAttackRelease("2n");
            break;
        case 'gameover':
            synths.gameOver.triggerAttackRelease("C3", "4n", Tone.now());
            synths.gameOver.triggerAttackRelease("G2", "4n", Tone.now() + 0.3);
            synths.gameOver.triggerAttackRelease("C2", "1n", Tone.now() + 0.6);
            break;
        case 'epic_common':
            startPlayer(synths.epicCommon);
            break;
        case 'epic_rare':
            startPlayer(synths.epicRare);
            break;
        case 'epic_epic':
            startPlayer(synths.epicEpic);
            break;
        case 'epic_legendary':
            startPlayer(synths.epicLegendary);
            break;
        case 'epic':
            startPlayer(synths.epic);
            break;
    }
}

// =========================================================================
// 粒子系统
// =========================================================================
class Particle {
    constructor(x, y, color, isFirework = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.isFirework = isFirework;
        const baseAngle = Math.random() * Math.PI * 2;
        if (isFirework) {
            this.speed = Math.random() * 8 + 3;
            this.vx = Math.cos(baseAngle) * this.speed;
            this.vy = Math.sin(baseAngle) * this.speed - 3;
            this.decay = Math.random() * 0.015 + 0.005;
            this.r = Math.random() * 4 + 3;
        } else {
            this.speed = Math.random() * 5 + 2;
            this.vx = Math.cos(baseAngle) * this.speed;
            this.vy = Math.sin(baseAngle) * this.speed;
            this.decay = Math.random() * 0.05 + 0.02;
            this.r = Math.random() * 4 + 2;
        }
        this.life = 1.0;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.isFirework) { this.vy += 0.15; this.vx *= 0.98; }
        this.life -= this.decay;
    }
    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        if (this.isFirework) { ctx.shadowBlur = 10; ctx.shadowColor = this.color; }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }
}
let particles = [];

function spawnParticles(x, y, color, count = 20, isFirework = false) {
    for (let i = 0; i < count; i++) particles.push(new Particle(x, y, color, isFirework));
}

// =========================================================================
// 星空背景
// =========================================================================
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
let bgStars = [];

function initBgStars() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    bgStars = [];
    for (let i = 0; i < 150; i++) {
        bgStars.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            r: Math.random() * 1.5,
            opacity: Math.random(),
            speed: (Math.random() * 0.02) + 0.01
        });
    }
}

function drawBgStars() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgStars.forEach(star => {
        star.opacity += star.speed;
        if (star.opacity > 1 || star.opacity < 0.1) star.speed *= -1;
        bgCtx.beginPath();
        bgCtx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        bgCtx.fill();
    });
    requestAnimationFrame(drawBgStars);
}
window.addEventListener('resize', initBgStars);
initBgStars();
drawBgStars();

// =========================================================================
// Matter.js 物理引擎与全局状态
// =========================================================================
const Engine = Matter.Engine,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Events = Matter.Events;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextPlanetCtx = document.getElementById('nextPlanetCanvas').getContext('2d');

const GAME_WIDTH = 420;
const GAME_HEIGHT = 800;
const WALL_T = 60;
const DEAD_LINE = 150;

let engine, runner;
let score = 0;
let nextPlanetLevel = 0;
let isBlackHoleNext = false;
let isDebrisNext = false;
let nextDebrisIndex = 0;
let isAsteroidNext = false;
let isCometNext = false;

let currentMouseX = GAME_WIDTH / 2;
let canDrop = true;
let isGameOver = false;
let animationFrameId = null;
let gameOverFrames = 0;
let synthesizedPlanets = new Set();

let cardTimeout = null;
let cardIsFlipped = false;
let threatTimeout = null;
let threatIsFlipped = false;
let threatWarningShown = false;
let blackholeCardShown = false;
let bhCardTimeout = null;
let bhCardIsFlipped = false;

// =========================================================================
// 玩家统计 (localStorage)
// =========================================================================
let playerStats = JSON.parse(localStorage.getItem('solarMeritStats94')) || {
    unlockedMerits: [],
    restarts: 0,
    neptuneMerges: 0,
    totalMerges: 0,
    marsMerges: 0,
    sunMerges: 0,
    blackholeEats: 0,
    asteroidExplosions: 0,
    cometDissipates: 0,
    debrisDropped: 0,
    jupiterMerges: 0,
    earthMerges: 0,
    asteroidDropped: 0
};

if (playerStats.jupiterMerges === undefined) playerStats.jupiterMerges = 0;
if (playerStats.earthMerges === undefined) playerStats.earthMerges = 0;
if (playerStats.asteroidDropped === undefined) playerStats.asteroidDropped = 0;

let meritTriggeredThisGame = new Set();
let meritQueue = [];
let isMeritShowing = false;
let meritTimer = null;

let recentMergeTimes = [];
let frameCounter = 0;
let atlasCheckFrame = 0;

let recentEats = [];
let midasTriggered = false;
let achillesHeelTriggered = false;
let orpheusTriggered = false;
let achillesTortoiseTriggered = false;
let imperialCameoTriggered = false;

// ===== 战功图鉴状态 =====
let galleryOpen = false;
let galleryDetailOpen = false;
let galleryDetailFlipped = false;
let galleryDetailData = null;
let galleryMusicStarted = false;

// =========================================================================
// 战功重置逻辑
// =========================================================================
function resetGameCounters() {
    const stored = localStorage.getItem('solarMeritStats94');
    if (stored) {
        playerStats = JSON.parse(stored);
        if (playerStats.jupiterMerges === undefined) playerStats.jupiterMerges = 0;
        if (playerStats.earthMerges === undefined) playerStats.earthMerges = 0;
        if (playerStats.asteroidDropped === undefined) playerStats.asteroidDropped = 0;
    }

    playerStats.neptuneMerges = 0;
    playerStats.totalMerges = 0;
    playerStats.marsMerges = 0;
    playerStats.sunMerges = 0;
    playerStats.blackholeEats = 0;
    playerStats.asteroidExplosions = 0;
    playerStats.cometDissipates = 0;
    playerStats.debrisDropped = 0;
    playerStats.jupiterMerges = 0;
    playerStats.earthMerges = 0;
    playerStats.asteroidDropped = 0;

    recentEats = [];
    midasTriggered = false;
    achillesHeelTriggered = false;
    orpheusTriggered = false;
    achillesTortoiseTriggered = false;
    imperialCameoTriggered = false;

    const restartMerits = ['sisyphus', 'odysseus'];
    const newTriggered = new Set();
    newTriggered.add('sisyphus');
    for (let id of playerStats.unlockedMerits) {
        if (id === 'odysseus') {
            newTriggered.add('odysseus');
        }
    }
    meritTriggeredThisGame = newTriggered;
    playerStats.unlockedMerits = Array.from(meritTriggeredThisGame);
    saveStats();

    recentMergeTimes = [];
    frameCounter = 0;
    atlasCheckFrame = 0;
    meritQueue = [];
    isMeritShowing = false;
    if (meritTimer) {
        clearTimeout(meritTimer);
        meritTimer = null;
    }
    const wrapper = document.getElementById('meritCoinWrapper');
    wrapper.classList.remove('show');
    wrapper.classList.remove('flipped');
    wrapper.classList.add('hidden');

    saveStats();
}

function saveStats() { localStorage.setItem('solarMeritStats94', JSON.stringify(playerStats)); }

function resizeCanvas() { canvas.width = GAME_WIDTH; canvas.height = GAME_HEIGHT; }
resizeCanvas();

// =========================================================================
// 战功系统核心逻辑
// =========================================================================
function getRarityClass(rarity) { return RARITY_CLASSES[rarity] || 'rarity-common'; }

function triggerMerit(meritId) {
    if (!MERITS[meritId]) return;
    if (meritTriggeredThisGame.has(meritId)) return;

    meritTriggeredThisGame.add(meritId);
    if (!playerStats.unlockedMerits.includes(meritId)) {
        playerStats.unlockedMerits.push(meritId);
        saveStats();
    }

    meritQueue.push(meritId);
    if (!isMeritShowing) {
        showNextMerit();
    }

    if (galleryOpen) {
        renderMeritGallery();
    }
}

function showNextMerit() {
    if (meritQueue.length === 0) {
        isMeritShowing = false;
        return;
    }
    isMeritShowing = true;
    const meritId = meritQueue.shift();
    const meritData = MERITS[meritId];
    if (!meritData) {
        isMeritShowing = false;
        showNextMerit();
        return;
    }

    const imgUrl = meritData.image || '';
    const meritFront = document.getElementById('meritFront');
    if (imgUrl) meritFront.style.backgroundImage = `url(${imgUrl})`;
    else meritFront.style.backgroundImage = '';
    document.getElementById('meritFrontText').innerText = meritData.frontText || '⚡ 战功达成 ⚡';
    document.getElementById('meritBackTitle').innerText = meritData.title || '无上荣光';
    document.getElementById('meritBackText').innerText = meritData.backText || '愿星辰见证你的功绩。';

    const rarity = meritData.rarity || 'common';
    const wrapper = document.getElementById('meritCoinWrapper');
    wrapper.classList.remove('rarity-common', 'rarity-rare', 'rarity-epic', 'rarity-legendary');
    wrapper.classList.add(getRarityClass(rarity));

    wrapper.classList.remove('flipped');
    meritCoinFlipped = false;
    wrapper.classList.remove('hidden');
    playSound('epic_' + rarity);
    setTimeout(() => { wrapper.classList.add('show'); }, 50);
    startMeritTimer();
}

let meritCoinFlipped = false;
let meritTimerId = null;

function startMeritTimer() {
    if (meritTimerId) { clearTimeout(meritTimerId); meritTimerId = null; }
    meritTimerId = setTimeout(() => {
        hideMeritCoin();
    }, 10000);
}

function hideMeritCoin() {
    const wrapper = document.getElementById('meritCoinWrapper');
    wrapper.classList.remove('show');
    wrapper.classList.remove('flipped');
    meritCoinFlipped = false;
    if (meritTimerId) { clearTimeout(meritTimerId); meritTimerId = null; }
    setTimeout(() => {
        wrapper.classList.add('hidden');
        isMeritShowing = false;
        showNextMerit();
    }, 400);
}

function toggleMeritCoinFlip() {
    const wrapper = document.getElementById('meritCoinWrapper');
    if (wrapper.classList.contains('show')) {
        meritCoinFlipped = !meritCoinFlipped;
        if (meritCoinFlipped) wrapper.classList.add('flipped');
        else wrapper.classList.remove('flipped');
        if (meritTimerId) { clearTimeout(meritTimerId); meritTimerId = null; }
        startMeritTimer();
    }
}

function closeMeritManually() { hideMeritCoin(); }

// =========================================================================
// 卡片逻辑
// =========================================================================
function showKnowledgeCard(planetLevel) {
    const planet = PLANETS[planetLevel];
    if (!planet) return;
    hideThreatCard();
    hideBlackholeCard();

    if (synths.god) {
        try {
            if (synths.god.loaded) { synths.god.stop(); }
        } catch (e) { /* ignore */ }
        startPlayer(synths.god);
    }

    const card = document.getElementById('knowledgeCard');
    const front = document.getElementById('cardFront');
    const back = document.getElementById('cardBack');

    document.getElementById('kcDesc').innerText = planet.desc || "宇宙中的神秘星球。";
    front.style.backgroundImage = `url(${planet.image})`;
    front.style.backgroundSize = 'cover';
    front.style.backgroundPosition = 'center';
    front.style.backgroundRepeat = 'no-repeat';

    document.getElementById('kcGodName').innerText = planet.godName || "未知神祇";
    document.getElementById('kcGodDesc').innerText = planet.godDesc || "暂无神话故事记载。";
    const godImg = document.getElementById('kcGodImage');
    godImg.src = planet.godImage || "";
    godImg.alt = planet.godName || "神祇立绘";
    back.style.backgroundImage = `url(${planet.godImage || ''})`;
    back.style.backgroundSize = 'cover';
    back.style.backgroundPosition = 'center';
    back.style.backgroundRepeat = 'no-repeat';

    cardIsFlipped = false;
    card.classList.remove('flipped');
    card.classList.remove('hidden');
    setTimeout(() => card.classList.add('show'), 10);
    resetCardTimer();
}

function hideKnowledgeCard() {
    if (synths.god && synths.god.loaded) { try { synths.god.stop(); } catch (e) { console.warn("神祇配乐停止失败", e); } }
    const card = document.getElementById('knowledgeCard');
    card.classList.remove('show');
    card.classList.remove('flipped');
    cardIsFlipped = false;
    if (cardTimeout) { clearTimeout(cardTimeout); cardTimeout = null; }
    setTimeout(() => {
        card.classList.add('hidden');
        document.getElementById('cardFront').style.backgroundImage = '';
        document.getElementById('cardBack').style.backgroundImage = '';
    }, 400);
}

function resetCardTimer() {
    if (cardTimeout) { clearTimeout(cardTimeout); cardTimeout = null; }
    cardTimeout = setTimeout(() => { hideKnowledgeCard(); }, 10000);
}

function toggleCardFlip() {
    const card = document.getElementById('knowledgeCard');
    if (card.classList.contains('hidden') || !card.classList.contains('show')) return;
    cardIsFlipped = !cardIsFlipped;
    if (cardIsFlipped) card.classList.add('flipped');
    else card.classList.remove('flipped');
    resetCardTimer();
}

function showThreatCard() {
    hideKnowledgeCard();
    hideBlackholeCard();
    const card = document.getElementById('threatCard');
    threatIsFlipped = false;
    card.classList.remove('flipped');
    card.classList.remove('hidden');
    setTimeout(() => card.classList.add('show'), 10);
    resetThreatTimer();
    playSound('ohoh');
}

function hideThreatCard() {
    const card = document.getElementById('threatCard');
    card.classList.remove('show');
    card.classList.remove('flipped');
    threatIsFlipped = false;
    if (threatTimeout) { clearTimeout(threatTimeout); threatTimeout = null; }
    setTimeout(() => { card.classList.add('hidden'); }, 400);
}

function resetThreatTimer() {
    if (threatTimeout) { clearTimeout(threatTimeout); threatTimeout = null; }
    threatTimeout = setTimeout(() => { hideThreatCard(); }, 10000);
}

function toggleThreatFlip() {
    const card = document.getElementById('threatCard');
    if (card.classList.contains('hidden') || !card.classList.contains('show')) return;
    threatIsFlipped = !threatIsFlipped;
    if (threatIsFlipped) card.classList.add('flipped');
    else card.classList.remove('flipped');
    resetThreatTimer();
}

function showBlackholeCard() {
    hideKnowledgeCard();
    hideThreatCard();
    const card = document.getElementById('blackholeCard');
    bhCardIsFlipped = false;
    card.classList.remove('flipped');
    card.classList.remove('hidden');
    setTimeout(() => card.classList.add('show'), 10);
    resetBlackholeCardTimer();
    playSound('unlock');
}

function hideBlackholeCard() {
    const card = document.getElementById('blackholeCard');
    card.classList.remove('show');
    card.classList.remove('flipped');
    bhCardIsFlipped = false;
    if (bhCardTimeout) { clearTimeout(bhCardTimeout); bhCardTimeout = null; }
    setTimeout(() => { card.classList.add('hidden'); }, 400);
}

function resetBlackholeCardTimer() {
    if (bhCardTimeout) { clearTimeout(bhCardTimeout); bhCardTimeout = null; }
    bhCardTimeout = setTimeout(() => { hideBlackholeCard(); }, 10000);
}

function toggleBlackholeCardFlip() {
    const card = document.getElementById('blackholeCard');
    if (card.classList.contains('hidden') || !card.classList.contains('show')) return;
    bhCardIsFlipped = !bhCardIsFlipped;
    if (bhCardIsFlipped) card.classList.add('flipped');
    else card.classList.remove('flipped');
    resetBlackholeCardTimer();
}

// =========================================================================
// 物理碰撞与合成 - 战功计数 (含新增乱入片场检测)
// =========================================================================
function initPhysics() {
    engine = Engine.create();
    engine.gravity.y = 1.2;

    const wallOptions = { isStatic: true, render: { visible: false }, friction: 0.2 };
    const leftWall = Bodies.rectangle(-WALL_T / 2, GAME_HEIGHT / 2, WALL_T, GAME_HEIGHT * 2, wallOptions);
    const rightWall = Bodies.rectangle(GAME_WIDTH + WALL_T / 2, GAME_HEIGHT / 2, WALL_T, GAME_HEIGHT * 2, wallOptions);
    const ground = Bodies.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + WALL_T / 2, GAME_WIDTH * 2, WALL_T, {
        isStatic: true,
        friction: 0.5,
        render: { visible: false }
    });

    Composite.add(engine.world, [leftWall, rightWall, ground]);
    Events.on(engine, 'collisionStart', handleCollision);

    runner = Runner.create();
    Runner.run(runner, engine);
}

function handleCollision(event) {
    const pairs = event.pairs;
    const bodiesToRemove = new Set();
    const newBodiesToAdd = [];

    pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // ===== 原有碰撞逻辑（完全保留） =====
        if (!synthesizedPlanets.has(0)) {
            if (bodyA.planetLevel === 0 || bodyB.planetLevel === 0) {
                synthesizedPlanets.add(0);
                const plutoPos = bodyA.planetLevel === 0 ? bodyA.position : bodyB.position;
                spawnParticles(plutoPos.x, plutoPos.y, PLANETS[0].color, 35, true);
                showKnowledgeCard(0);
                playSound('unlock');
            }
        }

        if (bodyA.isAsteroid || bodyB.isAsteroid) {
            const asteroidBody = bodyA.isAsteroid ? bodyA : bodyB;
            if (!bodiesToRemove.has(asteroidBody)) {
                bodiesToRemove.add(asteroidBody);
                playSound('explosion');
                spawnParticles(asteroidBody.position.x, asteroidBody.position.y, "#f59e0b", 40, true);

                playerStats.asteroidExplosions++;
                saveStats();
                if (playerStats.asteroidExplosions >= 3) {
                    triggerMerit('heracles_strike');
                }

                const blastRadius = 400;
                const allBodies = Composite.allBodies(engine.world);
                for (let b of allBodies) {
                    if (b === asteroidBody || b.isStatic) continue;
                    if (b.planetLevel !== undefined || b.debrisIndex !== undefined || b.isBlackHole || b.isComet) {
                        const dx = b.position.x - asteroidBody.position.x;
                        const dy = b.position.y - asteroidBody.position.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < blastRadius) {
                            const velocityMultiplier = 25 * (1 - dist / blastRadius);
                            const vx = (dx / dist) * velocityMultiplier + (Math.random() - 0.5) * 15;
                            const vy = -Math.abs(dy / dist) * velocityMultiplier - 15 - Math.random() * 10;
                            Matter.Body.setVelocity(b, { x: b.velocity.x + vx, y: b.velocity.y + vy });
                            const originalFrictionAir = b.frictionAir;
                            Matter.Body.set(b, "frictionAir", 0.08);
                            setTimeout(() => {
                                if (b && Composite.allBodies(engine.world).includes(b)) Matter.Body.set(b, "frictionAir", originalFrictionAir);
                            }, 2000);
                        }
                    }
                }
            }
        }

        if (bodyA.debrisIndex !== undefined || bodyB.debrisIndex !== undefined) {
            const debrisBody = bodyA.debrisIndex !== undefined ? bodyA : bodyB;
            const otherBody = bodyA.debrisIndex !== undefined ? bodyB : bodyA;
            if (!otherBody.isBlackHole && otherBody.planetLevel !== undefined) {
                const forceMagnitude = 0.02;
                const angle = Math.atan2(otherBody.position.y - debrisBody.position.y, otherBody.position.x - debrisBody.position.x);
                Matter.Body.applyForce(otherBody, otherBody.position, { x: Math.cos(angle) * forceMagnitude, y: Math.sin(angle) * forceMagnitude });
            }
        }

        // ===== 黑洞吞噬逻辑（含新增乱入片场） =====
        if (bodyA.isBlackHole || bodyB.isBlackHole) {
            const blackHoleBody = bodyA.isBlackHole ? bodyA : bodyB;
            const otherBody = bodyA.isBlackHole ? bodyB : bodyA;
            if ((otherBody.planetLevel !== undefined || otherBody.debrisIndex !== undefined || otherBody.isComet) && !bodiesToRemove.has(otherBody) && !bodiesToRemove.has(blackHoleBody)) {
                bodiesToRemove.add(blackHoleBody);
                bodiesToRemove.add(otherBody);
                spawnParticles(otherBody.position.x, otherBody.position.y, "#c084fc");
                playSound('blackhole');

                playerStats.blackholeEats++;
                saveStats();
                if (playerStats.blackholeEats >= 3) {
                    triggerMerit('chaos_abyss');
                }
                if (playerStats.blackholeEats >= 6) {
                    triggerMerit('cronus_belly');
                }

                if (otherBody.planetLevel === 10) {
                    triggerMerit('odysseus');
                }

                if (otherBody.planetLevel !== undefined) {
                    const level = otherBody.planetLevel;
                    if (level >= 2 && level <= 7) {
                        recentEats = [];
                    } else if (level >= 8 || level <= 1) {
                        recentEats.push(level);
                        if (recentEats.length > 2) recentEats.shift();
                        if (recentEats.length === 2) {
                            const hasHigh = recentEats.some(l => l >= 8);
                            const hasLow = recentEats.some(l => l <= 1);
                            if (hasHigh && hasLow && !midasTriggered) {
                                midasTriggered = true;
                                triggerMerit('midas_touch');
                            }
                        }
                    }
                }

                // ★ 新增：检测乱入片场 (场上废弃空间站 >=2 且正在吞噬一个废弃空间站)
                if (!imperialCameoTriggered && otherBody.debrisIndex === 2) {
                    const allBodiesNow = Composite.allBodies(engine.world);
                    let stationCount = 0;
                    for (let b of allBodiesNow) {
                        if (b.debrisIndex === 2 && !bodiesToRemove.has(b)) {
                            stationCount++;
                        }
                    }
                    let totalStation = 0;
                    for (let b of allBodiesNow) {
                        if (b.debrisIndex === 2) totalStation++;
                    }
                    if (totalStation >= 2) {
                        imperialCameoTriggered = true;
                        triggerMerit('imperial_cameo');
                    }
                }

                if (!blackholeCardShown) { blackholeCardShown = true; showBlackholeCard(); }
                return;
            }
        }

        // ===== 行星合成逻辑 =====
        if (bodyA.planetLevel !== undefined && bodyB.planetLevel !== undefined) {
            if (bodyA.planetLevel === bodyB.planetLevel) {
                if (bodiesToRemove.has(bodyA) || bodiesToRemove.has(bodyB)) return;
                const currentLevel = bodyA.planetLevel;
                if (currentLevel >= PLANETS.length - 1) return;

                const nextLevel = currentLevel + 1;
                const newX = (bodyA.position.x + bodyB.position.x) / 2;
                const newY = (bodyA.position.y + bodyB.position.y) / 2;

                bodiesToRemove.add(bodyA);
                bodiesToRemove.add(bodyB);

                const newPlanetDef = PLANETS[nextLevel];
                score += newPlanetDef.score;
                updateScoreUI();

                if (!synthesizedPlanets.has(nextLevel)) {
                    synthesizedPlanets.add(nextLevel);
                    spawnParticles(newX, newY, newPlanetDef.color, 50, true);
                    showKnowledgeCard(nextLevel);
                    playSound('unlock');
                } else {
                    spawnParticles(newX, newY, newPlanetDef.color);
                    playSound('merge', nextLevel);
                }

                playerStats.totalMerges++;
                saveStats();

                if (nextLevel === 3) {
                    playerStats.marsMerges++;
                    saveStats();
                    if (playerStats.marsMerges >= 10) {
                        triggerMerit('troy_decade');
                    }
                }
                if (nextLevel === 10) {
                    playerStats.sunMerges++;
                    saveStats();
                    if (playerStats.sunMerges >= 2) {
                        triggerMerit('apollo_lyre');
                    }
                }
                if (nextLevel === 6) {
                    playerStats.neptuneMerges++;
                    saveStats();
                    if (playerStats.neptuneMerges >= 3) {
                        triggerMerit('poseidon');
                    }
                }
                if (playerStats.totalMerges >= 50) {
                    triggerMerit('prometheus');
                }
                const nowTime2 = Date.now();
                recentMergeTimes.push(nowTime2);
                recentMergeTimes = recentMergeTimes.filter(t => nowTime2 - t <= 3000);
                if (recentMergeTimes.length >= 3) {
                    triggerMerit('hebe');
                }

                if (nextLevel === 9) {
                    playerStats.jupiterMerges++;
                    saveStats();
                    if (playerStats.jupiterMerges >= 2) {
                        triggerMerit('athena_shield');
                    }
                }
                if (nextLevel === 5) {
                    playerStats.earthMerges++;
                    saveStats();
                    if (playerStats.earthMerges >= 6) {
                        triggerMerit('hera_apple');
                    }
                }

                const newBody = Bodies.circle(newX, newY, newPlanetDef.r, {
                    restitution: 0.2,
                    friction: 0.1,
                    density: 0.001 * (nextLevel + 1),
                    planetLevel: nextLevel,
                    render: { visible: false }
                });
                Matter.Body.setVelocity(newBody, { x: 0, y: -2 });
                newBodiesToAdd.push(newBody);
            }
        }
    });

    bodiesToRemove.forEach(body => { Composite.remove(engine.world, body); });
    newBodiesToAdd.forEach(body => { Composite.add(engine.world, body); });
}

// =========================================================================
// 分数更新 + 分数战功检测
// =========================================================================
function updateScoreUI() {
    document.getElementById('scoreDisplay').innerText = score;
    const sd = document.getElementById('scoreDisplay');
    sd.style.transform = 'scale(1.3)';
    setTimeout(() => sd.style.transform = 'scale(1)', 150);
    checkScoreMerits();
}

function checkScoreMerits() {
    if (score >= 1000) { triggerMerit('helios_chariot'); }
    if (score >= 3000) { triggerMerit('phaethon'); }
    if (score >= 8000) { triggerMerit('zeus_scepter'); }
    if (score >= 10000) { triggerMerit('ganges_sand'); }
}

// =========================================================================
// 下一个天体生成
// =========================================================================
function generateNextPlanet() {
    const randType = Math.random();
    isBlackHoleNext = false;
    isDebrisNext = false;
    isAsteroidNext = false;
    isCometNext = false;

    if (randType < 0.05) isBlackHoleNext = true;
    else if (randType < 0.12) { isDebrisNext = true; nextDebrisIndex = Math.floor(Math.random() * 3); } else if (randType < 0.15) isAsteroidNext = true;
    else if (randType < 0.22) isCometNext = true;
    else {
        if (Math.random() < 0.15) nextPlanetLevel = Math.floor(Math.random() * 4) + 4;
        else nextPlanetLevel = Math.floor(Math.random() * 4);
    }
    drawNextPlanetUI();
}

function drawNextPlanetUI() {
    nextPlanetCtx.clearRect(0, 0, 50, 50);
    if (isBlackHoleNext) { document.getElementById('nextPlanetName').innerText = BLACK_HOLE_DEF.name; drawPlanetGraphic(nextPlanetCtx, 25, 25, BLACK_HOLE_DEF.r * 0.6, BLACK_HOLE_DEF); } else if (isDebrisNext) {
        const def = DEBRIS_DEFS[nextDebrisIndex];
        document.getElementById('nextPlanetName').innerText = def.name;
        drawPlanetGraphic(nextPlanetCtx, 25, 25, def.r * 0.45, def);
    } else if (isAsteroidNext) {
        document.getElementById('nextPlanetName').innerText = ASTEROID_DEF.name;
        drawPlanetGraphic(nextPlanetCtx, 25, 25, ASTEROID_DEF.r * 0.7, ASTEROID_DEF);
    } else if (isCometNext) {
        document.getElementById('nextPlanetName').innerText = COMET_DEF.name;
        nextPlanetCtx.save();
        nextPlanetCtx.translate(25, 25);
        nextPlanetCtx.rotate(Math.PI / 4);
        drawPlanetGraphic(nextPlanetCtx, 0, 0, COMET_DEF.r * 0.7, COMET_DEF);
        nextPlanetCtx.restore();
    } else {
        const p = PLANETS[nextPlanetLevel];
        document.getElementById('nextPlanetName').innerText = p.name;
        const scale = Math.min(1, 20 / p.r);
        drawPlanetGraphic(nextPlanetCtx, 25, 25, p.r * scale, p);
    }
}

// =========================================================================
// 天体绘制
// =========================================================================
function drawPlanetGraphic(ctx, x, y, r, planet) {
    ctx.save();
    ctx.translate(x, y);

    if (planet && planet.special === 'blackhole') {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#a855f7";
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = "#020617";
        ctx.fill();
        ctx.lineWidth = 3;
        const ringGrad = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.2);
        ringGrad.addColorStop(0, "#c084fc");
        ringGrad.addColorStop(0.5, "#ec4899");
        ringGrad.addColorStop(1, "transparent");
        ctx.strokeStyle = ringGrad;
        ctx.stroke();
        ctx.restore();
        return;
    }

    if (planet && planet.special === 'comet') {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#22d3ee";
        let tailGrad = ctx.createLinearGradient(0, 0, -r * 2.5, 0);
        tailGrad.addColorStop(0, "rgba(34, 211, 238, 0.9)");
        tailGrad.addColorStop(1, "rgba(34, 211, 238, 0)");
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.7);
        ctx.lineTo(-r * 3, 0);
        ctx.lineTo(0, r * 0.7);
        ctx.fillStyle = tailGrad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        let coreGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
        coreGrad.addColorStop(0, "#ffffff");
        coreGrad.addColorStop(0.4, planet.color);
        coreGrad.addColorStop(1, "#0891b2");
        ctx.fillStyle = coreGrad;
        ctx.fill();
        ctx.restore();
        return;
    }

    if (planet && planet.special === 'debris') {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#0f172a";
        ctx.lineWidth = 2;
        ctx.strokeStyle = planet.shadow;
        if (planet.index === 0) {
            ctx.beginPath();
            ctx.moveTo(-r * 0.6, -r * 0.2);
            ctx.lineTo(-r * 0.1, -r * 0.8);
            ctx.lineTo(r * 0.7, -r * 0.3);
            ctx.lineTo(r * 0.4, r * 0.6);
            ctx.lineTo(-r * 0.4, r * 0.8);
            ctx.closePath();
            ctx.fillStyle = planet.color;
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#cbd5e1";
            ctx.fillRect(-r * 0.2, -r * 0.2, r * 0.3, r * 0.2);
            ctx.beginPath();
            ctx.moveTo(-r * 0.3, r * 0.2);
            ctx.lineTo(r * 0.2, r * 0.5);
            ctx.stroke();
        } else if (planet.index === 1) {
            ctx.fillStyle = planet.color;
            ctx.fillRect(-r * 0.4, -r * 0.4, r * 0.8, r * 0.8);
            ctx.strokeRect(-r * 0.4, -r * 0.4, r * 0.8, r * 0.8);
            ctx.fillStyle = "#1e3a8a";
            ctx.fillRect(-r * 1.1, -r * 0.2, r * 0.7, r * 0.4);
            ctx.strokeRect(-r * 1.1, -r * 0.2, r * 0.7, r * 0.4);
            ctx.beginPath();
            ctx.moveTo(r * 0.4, -r * 0.1);
            ctx.lineTo(r * 0.8, -r * 0.3);
            ctx.lineTo(r * 0.9, -r * 0.1);
            ctx.stroke();
            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
            ctx.fill();
        } else if (planet.index === 2) {
            ctx.save();
            ctx.fillStyle = "#475569";
            ctx.fillRect(-r * 1.0, -r * 0.1, r * 2.0, r * 0.2);
            ctx.fillStyle = "#64748b";
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = "#020617";
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.3);
            ctx.lineTo(0, r * 0.3);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-r * 0.3, 0);
            ctx.lineTo(r * 0.3, 0);
            ctx.stroke();
            ctx.fillStyle = "#0c4a6e";
            ctx.strokeStyle = planet.shadow;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-r * 1.2, -r * 1.2);
            ctx.lineTo(-r * 0.8, -r * 1.2);
            ctx.lineTo(-r * 0.8, r * 1.2);
            ctx.lineTo(-r * 1.2, r * 1.2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(r * 0.8, -r * 1.2);
            ctx.lineTo(r * 1.2, -r * 1.2);
            ctx.lineTo(r * 1.2, r * 1.2);
            ctx.lineTo(r * 0.8, r * 1.2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 0.5;
            for (let i = 1; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(-r * 1.2, -r * 1.2 + (r * 2.4) * i / 4);
                ctx.lineTo(-r * 0.8, -r * 1.2 + (r * 2.4) * i / 4);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(r * 0.8, -r * 1.2 + (r * 2.4) * i / 4);
                ctx.lineTo(r * 1.2, -r * 1.2 + (r * 2.4) * i / 4);
                ctx.stroke();
            }
            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(r * 0.2, -r * 0.4, r * 0.08, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-r * 0.9, r * 0.5);
            ctx.lineTo(-r * 1.1, r * 0.8);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
        return;
    }

    if (planet.special === 'sun') { ctx.shadowBlur = 40; ctx.shadowColor = "#f97316"; }
    if (planet.special === 'saturn') {
        ctx.save();
        ctx.rotate(Math.PI / 8);
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 2.1, r * 0.45, 0, Math.PI, Math.PI * 2);
        ctx.lineWidth = r * 0.25;
        let ringGrad = ctx.createRadialGradient(0, 0, r * 1.2, 0, 0, r * 2.1);
        ringGrad.addColorStop(0, "rgba(252, 211, 77, 0.95)");
        ringGrad.addColorStop(0.5, "rgba(217, 119, 6, 0.8)");
        ringGrad.addColorStop(1, "rgba(252, 211, 77, 0.0)");
        ctx.strokeStyle = ringGrad;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.6, r * 0.35, 0, Math.PI, Math.PI * 2);
        ctx.lineWidth = r * 0.05;
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.stroke();
        ctx.restore();
    }

    ctx.beginPath();
    if (planet.special === 'asteroid') {
        ctx.moveTo(-r * 0.8, -r * 0.3);
        ctx.lineTo(-r * 0.3, -r * 0.9);
        ctx.lineTo(r * 0.5, -r * 0.7);
        ctx.lineTo(r * 0.9, -r * 0.1);
        ctx.lineTo(r * 0.6, r * 0.8);
        ctx.lineTo(-r * 0.2, r * 0.9);
        ctx.lineTo(-r * 0.9, r * 0.4);
        ctx.closePath();
    } else {
        ctx.arc(0, 0, r, 0, Math.PI * 2);
    }
    ctx.clip();
    ctx.fillStyle = planet.color || "#ffffff";
    ctx.fill();

    if (planet.special === 'earth') {
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.moveTo(-r * 0.6, -r * 0.4);
        ctx.quadraticCurveTo(-r * 0.2, -r * 0.8, 0, -r * 0.4);
        ctx.quadraticCurveTo(r * 0.2, -r * 0.2, -r * 0.1, 0);
        ctx.quadraticCurveTo(-r * 0.5, r * 0.1, -r * 0.6, -r * 0.4);
        ctx.fill();
        ctx.fillStyle = "#854d0e";
        ctx.beginPath();
        ctx.arc(r * 0.4, r * 0.3, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.beginPath();
        ctx.ellipse(r * 0.2, -r * 0.3, r * 0.7, r * 0.15, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-r * 0.2, r * 0.4, r * 0.5, r * 0.1, Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = r * 0.08;
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.1, r * 0.3, 0, Math.PI);
        ctx.stroke();
    } else if (planet.special === 'jupiter') {
        const jGradients = ["#92400e", "#fde68a", "#b45309", "#fef3c7", "#78350f"];
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = jGradients[i];
            ctx.beginPath();
            ctx.ellipse(0, -r * 0.7 + (r * 0.35) * i, r * 1.1, r * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "#7f1d1d";
        ctx.beginPath();
        ctx.ellipse(r * 0.25, r * 0.15, r * 0.25, r * 0.15, -Math.PI / 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#450a0a";
        ctx.beginPath();
        ctx.ellipse(r * 0.25, r * 0.15, r * 0.1, r * 0.06, -Math.PI / 12, 0, Math.PI * 2);
        ctx.fill();
    } else if (planet.special === 'asteroid') {
        ctx.fillStyle = "#292524";
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -r * 0.2, r * 0.2, r * 0.15, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(r * 0.3, r * 0.3, r * 0.25, r * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (planet.special === 'pluto') {
        ctx.fillStyle = "rgba(60, 40, 20, 0.4)";
        ctx.beginPath();
        ctx.arc(-r * 0.4, -r * 0.2, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 245, 230, 0.9)";
        ctx.beginPath();
        ctx.moveTo(-r * 0.1, r * 0.1);
        ctx.bezierCurveTo(r * 0.4, -r * 0.3, r * 0.8, r * 0.1, r * 0.3, r * 0.6);
        ctx.bezierCurveTo(0, r * 0.8, -r * 0.4, r * 0.4, -r * 0.1, r * 0.1);
        ctx.fill();
    } else if (planet.special === 'moon') {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.arc(-r * 0.3, -r * 0.3, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.4, r * 0.15, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.beginPath();
        ctx.arc(-r * 0.1, r * 0.4, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
    } else if (planet.special === 'mercury') {
        ctx.fillStyle = "rgba(59, 130, 246, 0.35)";
        ctx.beginPath();
        ctx.arc(r * 0.3, r * 0.3, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.4, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(234, 179, 8, 0.25)";
        ctx.beginPath();
        ctx.arc(-r * 0.3, r * 0.2, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.1, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.4, r * 0.1, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.arc(-r * 0.22, -r * 0.12, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.4, -r * 0.08, r * 0.03, 0, Math.PI * 2);
        ctx.fill();
    } else if (planet.special === 'mars') {
        ctx.fillStyle = "rgba(120, 40, 15, 0.55)";
        ctx.beginPath();
        ctx.moveTo(-r, -r * 0.2);
        ctx.quadraticCurveTo(0, r * 0.4, r, -r * 0.2);
        ctx.lineTo(r, r * 0.3);
        ctx.quadraticCurveTo(0, 0, -r, r * 0.4);
        ctx.fill();
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.85, r * 0.4, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, r * 0.85, r * 0.3, r * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (planet.special === 'venus') {
        ctx.fillStyle = "rgba(252, 211, 77, 0.6)";
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.2, r * 0.9, r * 0.3, Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(234, 88, 12, 0.5)";
        ctx.beginPath();
        ctx.ellipse(0, r * 0.3, r * 0.8, r * 0.2, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-r * 0.2, 0, r * 0.6, r * 0.15, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (planet.special === 'uranus') {
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.1, r * 0.4, -Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
    } else if (planet.special === 'neptune') {
        ctx.fillStyle = "rgba(30, 58, 138, 0.6)";
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -r * 0.1, r * 0.35, r * 0.15, Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = r * 0.06;
        ctx.beginPath();
        ctx.arc(0, -r * 0.2, r * 0.8, Math.PI * 0.85, Math.PI * 1.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, r * 0.3, r * 0.6, Math.PI * 1.75, Math.PI * 2.05);
        ctx.stroke();
    } else if (planet.special === 'saturn') {
        ctx.save();
        ctx.rotate(Math.PI / 8);
        ctx.fillStyle = "rgba(253, 230, 138, 0.4)";
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.1, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(180, 83, 9, 0.3)";
        ctx.beginPath();
        ctx.ellipse(0, r * 0.2, r * 1.1, r * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.08, r * 1.1, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    if (planet.special !== 'sun') {
        let lightGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, -r * 0.1, -r * 0.1, r * 1.3);
        lightGrad.addColorStop(0, "rgba(255, 255, 255, 0.6)");
        lightGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.0)");
        lightGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.5)");
        lightGrad.addColorStop(1, "rgba(0, 0, 0, 0.95)");
        ctx.fillStyle = lightGrad;
        ctx.fillRect(-r, -r, r * 2, r * 2);
    } else {
        let sunGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        sunGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        sunGrad.addColorStop(0.4, "rgba(254, 240, 138, 0.3)");
        sunGrad.addColorStop(1, "rgba(249, 115, 22, 0.7)");
        ctx.fillStyle = sunGrad;
        ctx.fillRect(-r, -r, r * 2, r * 2);
    }
    ctx.restore();

    if (planet.special === 'saturn') {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 8);
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 2.1, r * 0.45, 0, 0, Math.PI);
        ctx.lineWidth = r * 0.25;
        let ringGrad = ctx.createRadialGradient(0, 0, r * 1.2, 0, 0, r * 2.1);
        ringGrad.addColorStop(0, "rgba(252, 211, 77, 0.95)");
        ringGrad.addColorStop(0.5, "rgba(217, 119, 6, 0.8)");
        ringGrad.addColorStop(1, "rgba(252, 211, 77, 0.0)");
        ctx.strokeStyle = ringGrad;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.6, r * 0.35, 0, 0, Math.PI);
        ctx.lineWidth = r * 0.05;
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.stroke();
        ctx.restore();
    }
}

// =========================================================================
// 事件处理与输入
// =========================================================================
function getEventX(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let x = (clientX - rect.left) * (GAME_WIDTH / rect.width);
    let radius = 20;
    if (isBlackHoleNext) radius = BLACK_HOLE_DEF.r;
    else if (isDebrisNext) radius = DEBRIS_DEFS[nextDebrisIndex].r;
    else if (isAsteroidNext) radius = ASTEROID_DEF.r;
    else if (isCometNext) radius = COMET_DEF.r;
    else radius = PLANETS[nextPlanetLevel].r;
    return Math.max(radius, Math.min(GAME_WIDTH - radius, x));
}

function handleMove(e) {
    if (isGameOver || !canDrop) return;
    currentMouseX = getEventX(e);
}

function handleDrop(e) {
    if (isGameOver || !canDrop) return;
    initAudio();
    if (e) { currentMouseX = getEventX(e); }
    canDrop = false;

    let newBody;
    const nowTime = Date.now();
    if (isBlackHoleNext) {
        newBody = Bodies.circle(currentMouseX, 50, BLACK_HOLE_DEF.r, { restitution: 0.1, friction: 0.2, density: 0.005, isBlackHole: true, createdAt: nowTime, render: { visible: false } });
    } else if (isDebrisNext) {
        const def = DEBRIS_DEFS[nextDebrisIndex];
        newBody = Bodies.circle(currentMouseX, 50, def.r, { restitution: 0.6, friction: 0.05, density: 0.008, debrisIndex: nextDebrisIndex, createdAt: nowTime, render: { visible: false } });
        playerStats.debrisDropped++;
        saveStats();
        if (playerStats.debrisDropped >= 10) {
            triggerMerit('sisyphus_rubble');
        }
        if (nextDebrisIndex === 2) playSound('imperial');
        else playSound('ohoh');
    } else if (isAsteroidNext) {
        newBody = Bodies.circle(currentMouseX, 50, ASTEROID_DEF.r, { restitution: 0.3, friction: 0.9, density: 0.004, isAsteroid: true, createdAt: nowTime, render: { visible: false } });
        playerStats.asteroidDropped++;
        saveStats();
        if (playerStats.asteroidDropped >= 6) {
            triggerMerit('david_goliath');
        }
    } else if (isCometNext) {
        newBody = Bodies.circle(currentMouseX, 50, COMET_DEF.r, { restitution: 0.1, friction: 0.1, density: 0.001, isComet: true, createdAt: nowTime, render: { visible: false } });
    } else {
        const p = PLANETS[nextPlanetLevel];
        newBody = Bodies.circle(currentMouseX, 50, p.r, { restitution: 0.2, friction: 0.1, density: 0.001 * (p.level + 1), planetLevel: p.level, createdAt: nowTime, render: { visible: false } });
    }

    playSound('drop');
    Composite.add(engine.world, newBody);
    generateNextPlanet();
    setTimeout(() => { if (!isGameOver) canDrop = true; }, 500);
}

canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    initAudio();
    handleMove(e);
});
canvas.addEventListener('pointermove', handleMove);
canvas.addEventListener('pointerup', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    handleDrop(e);
});

// =========================================================================
// Game Over / Restart
// =========================================================================
function triggerGameOver() {
    if (isGameOver) return;
    isGameOver = true;
    playSound('gameover');
    document.getElementById('finalScore').innerText = score;
    const modal = document.getElementById('gameOverModal');
    modal.classList.add('active');
    hideKnowledgeCard();
    hideThreatCard();
    hideBlackholeCard();
}

function restartGame() {
    const allBodies = Composite.allBodies(engine.world);
    const toRemove = allBodies.filter(b => !b.isStatic);
    for (let b of toRemove) { Composite.remove(engine.world, b); }

    particles = [];

    if (cardTimeout) { clearTimeout(cardTimeout); cardTimeout = null; }
    hideKnowledgeCard();
    if (threatTimeout) { clearTimeout(threatTimeout); threatTimeout = null; }
    hideThreatCard();
    threatWarningShown = false;
    threatIsFlipped = false;
    if (bhCardTimeout) { clearTimeout(bhCardTimeout); bhCardTimeout = null; }
    hideBlackholeCard();
    blackholeCardShown = false;
    bhCardIsFlipped = false;

    resetGameCounters();

    score = 0;
    updateScoreUI();
    isGameOver = false;
    canDrop = true;
    gameOverFrames = 0;
    synthesizedPlanets.clear();
    cardIsFlipped = false;

    document.getElementById('gameOverModal').classList.remove('active');
    generateNextPlanet();

    if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
    gameLoop();

    playerStats.restarts++;
    saveStats();

    if (galleryOpen) {
        renderMeritGallery();
    }
}

document.getElementById('restartBtn').addEventListener('click', restartGame);

// =========================================================================
// 主循环
// =========================================================================
function gameLoop() {
    if (!engine || isGameOver) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.beginPath();
    ctx.setLineDash([10, 10]);
    ctx.moveTo(0, DEAD_LINE);
    ctx.lineTo(GAME_WIDTH, DEAD_LINE);
    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    let isAboveLineAndSettled = false;
    const bodies = Composite.allBodies(engine.world);
    const currentTime = Date.now();
    let debrisCount = 0;
    let highLevelCount = 0;

    for (let body of bodies) {
        if (body.isStatic) continue;
        if (body.debrisIndex !== undefined) debrisCount++;
        if (body.isComet && (currentTime - body.createdAt > 15000)) {
            if (!body.isDissipating) {
                body.isDissipating = true;
                Composite.remove(engine.world, body);
                spawnParticles(body.position.x, body.position.y, "#22d3ee", 30);
                playSound('dissipate');

                playerStats.cometDissipates++;
                saveStats();
                if (playerStats.cometDissipates >= 8) {
                    triggerMerit('icarus_fall');
                }
                if (playerStats.cometDissipates >= 15) {
                    triggerMerit('perseus_pegasus');
                }
            }
            continue;
        }

        const isRecentSpawn = body.createdAt && (currentTime - body.createdAt < 1200);
        let planetDef = null;
        if (body.planetLevel !== undefined) {
            planetDef = PLANETS[body.planetLevel];
            if (body.planetLevel >= 8) highLevelCount++;
        } else if (body.isBlackHole) planetDef = BLACK_HOLE_DEF;
        else if (body.debrisIndex !== undefined) planetDef = DEBRIS_DEFS[body.debrisIndex];
        else if (body.isAsteroid) planetDef = ASTEROID_DEF;
        else if (body.isComet) planetDef = COMET_DEF;

        if (planetDef) drawPlanetGraphic(ctx, body.position.x, body.position.y, planetDef.r, planetDef);
        if (!isRecentSpawn && body.position.y - (planetDef ? planetDef.r : 20) < DEAD_LINE) isAboveLineAndSettled = true;
    }

    frameCounter++;
    if (frameCounter % 30 === 0) {
        if (highLevelCount >= 2) {
            triggerMerit('atlas');
        }
    }

    if (debrisCount > 4 && !threatWarningShown && !isGameOver) { threatWarningShown = true; showThreatCard(); }

    if (isAboveLineAndSettled) {
        gameOverFrames++;
        if (gameOverFrames > 180) triggerGameOver();
    } else {
        gameOverFrames = Math.max(0, gameOverFrames - 1);
    }

    let plutoCount = 0,
        sunCount = 0,
        lowLevelCount = 0;
    for (let body of bodies) {
        if (body.isStatic) continue;
        if (body.planetLevel !== undefined) {
            if (body.planetLevel === 0) plutoCount++;
            if (body.planetLevel === 10) sunCount++;
            if (body.planetLevel <= 1) lowLevelCount++;
        }
    }
    if (!achillesHeelTriggered && lowLevelCount >= 10) {
        achillesHeelTriggered = true;
        triggerMerit('achilles_heel');
    }
    if (!orpheusTriggered && plutoCount >= 12) {
        orpheusTriggered = true;
        triggerMerit('orpheus_lyre');
    }
    if (!achillesTortoiseTriggered && sunCount === 1 && plutoCount === 1) {
        achillesTortoiseTriggered = true;
        triggerMerit('achilles_tortoise');
    }

    if (canDrop && !isGameOver) {
        let currentDef = PLANETS[nextPlanetLevel];
        if (isBlackHoleNext) currentDef = BLACK_HOLE_DEF;
        else if (isDebrisNext) currentDef = DEBRIS_DEFS[nextDebrisIndex];
        else if (isAsteroidNext) currentDef = ASTEROID_DEF;
        else if (isCometNext) currentDef = COMET_DEF;

        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.setLineDash([6, 6]);
        ctx.moveTo(currentMouseX, 50);
        ctx.lineTo(currentMouseX, GAME_HEIGHT);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.stroke();
        ctx.restore();
        drawPlanetGraphic(ctx, currentMouseX, 50, currentDef.r, currentDef);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
    animationFrameId = requestAnimationFrame(gameLoop);
}

// =========================================================================
// 战功图鉴
// =========================================================================
const MERIT_IDS = Object.keys(MERITS);

function renderMeritGallery() {
    const grid = document.getElementById('meritGalleryGrid');
    grid.innerHTML = '';
    let unlockedCount = 0;

    MERIT_IDS.forEach(id => {
        const merit = MERITS[id];
        const isUnlocked = meritTriggeredThisGame.has(id);
        if (isUnlocked) unlockedCount++;

        const coin = document.createElement('div');
        coin.className = `merit-gallery-coin ${isUnlocked ? 'unlocked' : 'locked'}`;
        coin.dataset.meritId = id;

        if (isUnlocked && merit.image) {
            const rarityColor = RARITY_COLORS[merit.rarity] || '#9ca3af';
            coin.style.background = `url(${merit.image}) center / cover no-repeat, radial-gradient(circle at 30% 30%, ${rarityColor}33, transparent)`;
        }

        const rarityColor = RARITY_COLORS[merit.rarity] || '#9ca3af';

        const shine = document.createElement('div');
        shine.className = 'coin-shine';
        coin.appendChild(shine);

        const dot = document.createElement('div');
        dot.className = 'coin-rarity-dot';
        dot.style.background = rarityColor;
        dot.style.boxShadow = isUnlocked ? `0 0 12px ${rarityColor}` : 'none';
        coin.appendChild(dot);

        if (isUnlocked) {
            const label = document.createElement('div');
            label.className = 'coin-label';
            label.innerText = merit.title.length > 8 ? merit.title.slice(0, 7) + '…' : merit.title;
            coin.appendChild(label);
            coin.style.borderColor = rarityColor + '88';
            coin.addEventListener('click', () => {
                openGalleryDetail(id);
            });
        } else {
            const lock = document.createElement('div');
            lock.className = 'coin-lock';
            lock.innerText = '🔒';
            coin.appendChild(lock);
            const label = document.createElement('div');
            label.className = 'coin-label';
            label.innerText = '???';
            coin.appendChild(label);
            coin.style.background = '#1c1c2a';
        }

        grid.appendChild(coin);
    });

    document.getElementById('unlockCount').innerText = unlockedCount;
    document.getElementById('totalMeritCount').innerText = MERIT_IDS.length;
}

function openMeritGallery() {
    if (galleryOpen) return;
    initAudio();
    galleryOpen = true;
    const overlay = document.getElementById('meritGalleryOverlay');
    overlay.classList.add('open');
    renderMeritGallery();
    startGalleryMusic();
}

function closeMeritGallery() {
    if (!galleryOpen) return;
    galleryOpen = false;
    closeGalleryDetail();
    const overlay = document.getElementById('meritGalleryOverlay');
    overlay.classList.remove('open');
    stopGalleryMusic();
}

function startGalleryMusic() {
    if (!audioCtxStarted) return;
    if (galleryMusicStarted) return;
    if (synths.galleryMusic) {
        galleryMusicStarted = true;
        document.getElementById('musicIndicator').style.display = 'flex';
        startPlayer(synths.galleryMusic);
    }
}

function stopGalleryMusic() {
    if (synths.galleryMusic) {
        try {
            if (synths.galleryMusic.loaded) {
                synths.galleryMusic.stop();
            }
        } catch (e) { /* ignore */ }
    }
    galleryMusicStarted = false;
    document.getElementById('musicIndicator').style.display = 'none';
}

function openGalleryDetail(meritId) {
    if (galleryDetailOpen) return;
    const merit = MERITS[meritId];
    if (!merit) return;
    galleryDetailData = merit;
    galleryDetailOpen = true;
    galleryDetailFlipped = false;

    const overlay = document.getElementById('galleryDetailOverlay');
    const detail = document.getElementById('galleryDetail');
    const front = document.getElementById('detailFront');
    const back = document.getElementById('detailBack');

    detail.className = 'merit-gallery-detail ' + getRarityClass(merit.rarity);

    front.style.backgroundImage = `url(${merit.image || ''})`;
    document.getElementById('detailBackTitle').innerText = merit.title || '战功';
    document.getElementById('detailBackCondition').innerText = '🎯 ' + (merit.condition || '未知条件');
    document.getElementById('detailBackText').innerText = merit.backText || '';
    const rarityLabel = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' } [merit.rarity] || '普通';
    document.getElementById('detailBackRarity').innerText = '🕊稀有度 ：' + rarityLabel;

    detail.classList.remove('flipped');
    overlay.classList.add('open');
}

function closeGalleryDetail() {
    if (!galleryDetailOpen) return;
    galleryDetailOpen = false;
    galleryDetailData = null;
    galleryDetailFlipped = false;
    const overlay = document.getElementById('galleryDetailOverlay');
    overlay.classList.remove('open');
    const detail = document.getElementById('galleryDetail');
    detail.classList.remove('flipped');
}

function toggleGalleryDetailFlip() {
    if (!galleryDetailOpen) return;
    const detail = document.getElementById('galleryDetail');
    galleryDetailFlipped = !galleryDetailFlipped;
    if (galleryDetailFlipped) detail.classList.add('flipped');
    else detail.classList.remove('flipped');
}

// =========================================================================
// 事件绑定
// =========================================================================
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('meritGalleryBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        openMeritGallery();
    });

    document.getElementById('meritGalleryClose').addEventListener('click', closeMeritGallery);
    document.getElementById('meritGalleryOverlay').addEventListener('click', function(e) {
        if (e.target === this) closeMeritGallery();
    });

    document.getElementById('galleryDetailClose').addEventListener('click', function(e) {
        e.stopPropagation();
        closeGalleryDetail();
    });
    document.getElementById('galleryDetail').addEventListener('click', function(e) {
        if (e.target.closest('.detail-close-btn')) return;
        toggleGalleryDetailFlip();
    });

    document.getElementById('meritCoinInner').addEventListener('click', toggleMeritCoinFlip);
    document.getElementById('closeMeritBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        closeMeritManually();
    });

    document.getElementById('knowledgeCard').addEventListener('click', function(e) {
        if (!e.target.closest('.card-close-btn') && !this.classList.contains('hidden') && this.classList.contains('show')) toggleCardFlip();
    });
    document.getElementById('closeKcBtnFront').addEventListener('click', function(e) { e.stopPropagation(); hideKnowledgeCard(); });
    document.getElementById('closeKcBtnBack').addEventListener('click', function(e) { e.stopPropagation(); hideKnowledgeCard(); });

    document.getElementById('threatCard').addEventListener('click', function(e) {
        if (!e.target.closest('.card-close-btn') && !this.classList.contains('hidden') && this.classList.contains('show')) toggleThreatFlip();
    });
    document.getElementById('closeThreatBtnFront').addEventListener('click', function(e) { e.stopPropagation(); hideThreatCard(); });
    document.getElementById('closeThreatBtnBack').addEventListener('click', function(e) { e.stopPropagation(); hideThreatCard(); });

    document.getElementById('blackholeCard').addEventListener('click', function(e) {
        if (!e.target.closest('.card-close-btn') && !this.classList.contains('hidden') && this.classList.contains('show')) toggleBlackholeCardFlip();
    });
    document.getElementById('closeBhBtnFront').addEventListener('click', function(e) { e.stopPropagation(); hideBlackholeCard(); });
    document.getElementById('closeBhBtnBack').addEventListener('click', function(e) { e.stopPropagation(); hideBlackholeCard(); });

    document.getElementById('musicIndicator').style.display = 'none';
});

// =========================================================================
// 启动游戏
// =========================================================================
window.onload = function() {
    resetGameCounters();
    score = 0;
    updateScoreUI();
    synthesizedPlanets.clear();
    isGameOver = false;
    canDrop = true;
    gameOverFrames = 0;
    threatWarningShown = false;
    blackholeCardShown = false;
    initPhysics();
    generateNextPlanet();
    gameLoop();
};
