/*  =============================================
    game.js — PixiJS v7 RPG Portfolio Engine
    Scroll-driven horizontal side-scroller
    ============================================= */

var GAME = window.GAME || {};

/* ------------------------------------------
   SCENE DATA
   ------------------------------------------ */
var SCENES = [
    { id: 'intro', lvl: '??', cls: '???', quest: 'Begin the journey.', hp: 100, xp: 0, tier: 'base', label: '' },
    { id: 'iitkgp-arrival', lvl: 19, cls: 'Student', quest: 'Survive first year at IIT Kharagpur.', hp: 90, xp: 5, tier: 'freshman', label: 'IIT KHARAGPUR // 2019' },
    { id: 'covid-lockdown', lvl: 20, cls: 'Remote Student', quest: 'Learn indoors while the virus spreads.', hp: 20, xp: 12, tier: 'freshman', label: 'COVID LOCKDOWN // 2020' },
    { id: 'campus-return', lvl: 21, cls: 'Junior', quest: 'Explore the scenic campus.', hp: 80, xp: 20, tier: 'mid', label: 'RETURN TO CAMPUS // 2021' },
    { id: 'iimb-intern', lvl: 21, cls: 'Research Intern', quest: 'Secure the first internship.', hp: 85, xp: 28, tier: 'mid', label: 'IIM BANGALORE // 2021-22' },
    { id: 'snapdeal', lvl: 22, cls: 'Intern', quest: 'Survive the Gurgaon heat & hustle.', hp: 75, xp: 38, tier: 'mid', label: 'SNAPDEAL // SUMMER 2022' },
    { id: 'dc-advisory', lvl: 23, cls: 'IB Intern', quest: 'Dress formal, navigate high-rises.', hp: 60, xp: 48, tier: 'formal', label: 'DC ADVISORY // SUMMER 2023' },
    { id: 'iitkgp-senior', lvl: 24, cls: 'Senior', quest: 'CFA Research Challenge & Inter IIT meets.', hp: 90, xp: 58, tier: 'formal', label: 'FINAL YEAR KGP // 2023-24' },
    { id: 'iitkgp-grad', lvl: 24, cls: 'Graduate', quest: 'Let go of the PPO and graduate.', hp: 100, xp: 65, tier: 'graduate', label: 'KGP GRADUATION // 2024' },
    { id: 'iimc-arrival', lvl: 24, cls: 'MBA Candidate', quest: 'Survive the rigorous academic burden.', hp: 40, xp: 72, tier: 'senior', label: 'IIM CALCUTTA // 2024' },
    { id: 'ascertis-intern', lvl: 25, cls: 'Credit Intern', quest: 'Two months in Mumbai. Earn the PPO.', hp: 85, xp: 82, tier: 'formal-coat', label: 'ASCERTIS INTERN // SUMMER 2025' },
    { id: 'iimc-senior', lvl: 26, cls: 'MBA Senior', quest: 'Enjoy the beautiful campus and have fun.', hp: 95, xp: 90, tier: 'senior', label: 'IIM CALCUTTA // 2025-26' },
    { id: 'iimc-grad', lvl: 26, cls: 'Master\'s Grad', quest: 'Degree in hand.', hp: 100, xp: 95, tier: 'final', label: 'MBA GRADUATION // APRIL 2026' },
    { id: 'ascertis-ft', lvl: 26, cls: 'Associate', quest: 'The current quest.', hp: 100, xp: 100, tier: 'formal-coat', label: 'ASCERTIS CREDIT // CURRENT' }
];

var LORE_ITEMS = [
    { sceneId: 'iitkgp-arrival', xOffset: -80, text: "The grand gates of IIT Kharagpur. The start of a grueling but rewarding engineering journey." },
    { sceneId: 'covid-lockdown', xOffset: 100, text: "Stuck indoors. The world changed overnight, but the learning didn't stop." },
    { sceneId: 'campus-return', xOffset: 120, text: "Biking around the scenic IIT campus. Trees, fresh air, and finally being back." },
    { sceneId: 'iimb-intern', xOffset: -200, text: "IIM Bangalore. My first real internship. Building research pipelines." },
    { sceneId: 'snapdeal', xOffset: 60, text: "Gurgaon summers and cold pizza from late-night A/B testing sprints." },
    { sceneId: 'dc-advisory', xOffset: 172, text: "Mumbai high-rises. Wearing formal attire for the first time. Secured the PPO." },
    { sceneId: 'iitkgp-senior', xOffset: -100, text: "Inter IIT meets and winning the CFA Research Challenge. Unforgettable memories." },
    { sceneId: 'iitkgp-grad', xOffset: 216, text: "Throwing the cap! Letting go of the PPO to pursue an MBA." },
    { sceneId: 'iimc-arrival', xOffset: -280, text: "IIM Calcutta. So many books. The academic rigor here is no joke." },
    { sceneId: 'ascertis-intern', xOffset: 288, text: "Back in Mumbai for Private Credit. Wearing a coat this time. Secured the PPO again." },
    { sceneId: 'iimc-senior', xOffset: 150, text: "Second year at IIMC. Enjoying the lakes and the beautiful campus layout." },
    { sceneId: 'iimc-grad', xOffset: 0, text: "The final graduation. Master's complete. Ready for the next adventure." },
    { sceneId: 'ascertis-ft', xOffset: 120, text: "Ascertis Credit full-time. Ready to structure complex deals." }
];

var SCENE_PALETTES = {
    'intro': { bg1: 0x0c0c28, bg2: 0x1a1a4a, ambient: 0x6666ff, floor: 'concrete' },
    'iitkgp-arrival': { bg1: 0x2a1540, bg2: 0x6a3080, ambient: 0xffaa66, floor: 'grass' },
    'covid-lockdown': { bg1: 0x101015, bg2: 0x1a1a20, ambient: 0x44ff44, floor: 'wood-floor' },
    'campus-return': { bg1: 0x1a4a2a, bg2: 0x2a6a3a, ambient: 0xffee88, floor: 'grass' },
    'iimb-intern': { bg1: 0x0e2a0e, bg2: 0x1a4a2a, ambient: 0x66ff66, floor: 'tile-white' },
    'snapdeal': { bg1: 0x3a2a14, bg2: 0x5a4020, ambient: 0xffcc66, floor: 'carpet-red' },
    'dc-advisory': { bg1: 0x1a1a30, bg2: 0x202040, ambient: 0xaaccff, floor: 'tile-dark' },
    'iitkgp-senior': { bg1: 0x201414, bg2: 0x402020, ambient: 0xffaa55, floor: 'wood-floor-dark' },
    'iitkgp-grad': { bg1: 0x2a2a5a, bg2: 0x3a3a7a, ambient: 0xffee66, floor: 'grass' },
    'iimc-arrival': { bg1: 0x2a1414, bg2: 0x4a2a2a, ambient: 0xff8866, floor: 'wood-floor' },
    'ascertis-intern': { bg1: 0x141430, bg2: 0x2a2a50, ambient: 0x66aaff, floor: 'tile-dark' },
    'iimc-senior': { bg1: 0x1a403a, bg2: 0x20504a, ambient: 0xbbffcc, floor: 'grass' },
    'iimc-grad': { bg1: 0x2a2a5a, bg2: 0x3a3a7a, ambient: 0xffee66, floor: 'grass' },
    'ascertis-ft': { bg1: 0x142030, bg2: 0x203040, ambient: 0x66aaff, floor: 'tile-dark' }
};

var SCENE_PARTICLES_CONFIG = {
    'intro': { type: 'star', count: 20 },
    'iitkgp-arrival': { type: 'dust', count: 12 },
    'covid-lockdown': { type: 'virus', count: 20 },
    'campus-return': { type: 'leaf', count: 15 },
    'iimb-intern': { type: 'code', count: 10 },
    'snapdeal': { type: 'code', count: 8 },
    'dc-advisory': { type: 'dust', count: 10 },
    'iitkgp-senior': { type: 'star', count: 12 },
    'iitkgp-grad': { type: 'confetti', count: 30 },
    'iimc-arrival': { type: 'dust', count: 15 },
    'ascertis-intern': { type: 'rupee', count: 10 },
    'iimc-senior': { type: 'leaf', count: 15 },
    'iimc-grad': { type: 'confetti', count: 30 },
    'ascertis-ft': { type: 'rupee', count: 14 }
};

/* ------------------------------------------
   GLOBALS
   ------------------------------------------ */
var app, world, camera, SCENE_WIDTH, charContainer, charSprite;
var currentSceneIndex = -1;
var currentTier = '';
var isWalking = false;
var totalBonusXP = 0;
var particles = [];
var charTextures = {};
var tileTextures = {};
var propTextures = {};
var sceneContainers = [];
var flickerOverlays = [];
var vignetteSprite;

/* ------------------------------------------
   SOUND ENGINE
   ------------------------------------------ */
var SOUNDS = {
    footstep: null,
    typing: null,
    levelup: null,
    boot: null
};

function initSounds() {
    // Generative Data URIs for retro sound effects to avoid 403 Forbidden errors

    // Low, short noise burst for footstep
    var stepSrc = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    // Sharp high pitch for typing
    var typeSrc = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

    SOUNDS.footstep = new Howl({ src: [stepSrc], volume: 0.1, loop: true, rate: 1.5 });
    SOUNDS.typing = new Howl({ src: [typeSrc], volume: 0.2, loop: true, rate: 2.0 });
    // Keep level up placeholder in case we ever bring it back
    SOUNDS.levelup = new Howl({ src: [typeSrc], volume: 0.5 });
}

function updateGameAudio(walking, sitting) {
    if (!SOUNDS.footstep) return;

    if (walking) {
        if (!SOUNDS.footstep.playing()) SOUNDS.footstep.play();
    } else {
        SOUNDS.footstep.stop();
    }

    if (sitting) {
        if (!SOUNDS.typing.playing()) SOUNDS.typing.play();
    } else {
        SOUNDS.typing.stop();
    }
}

/* ------------------------------------------
   HELPERS
   ------------------------------------------ */
function showFloatingText(container, text, x, y, color) {
    var floatText = new PIXI.Text(text, {
        fontFamily: "'Press Start 2P', Courier",
        fontSize: 10,
        fill: color || 0xffcc00,
        align: 'center'
    });
    floatText.x = x;
    floatText.y = y;
    floatText.anchor.set(0.5);
    container.addChild(floatText);

    gsap.to(floatText, {
        y: y - 50,
        alpha: 0,
        duration: 1.5,
        ease: "power1.out",
        onComplete: function () {
            if (floatText.parent) floatText.parent.removeChild(floatText);
            floatText.destroy();
        }
    });

    // Play sound if available
    if (SOUNDS.levelup) {
        SOUNDS.levelup.rate(2.0 + Math.random());
        SOUNDS.levelup.play();
    }
}

function makeInteractive(obj, container, popupText, xpVal) {
    if (xpVal === undefined) xpVal = 10;

    obj.eventMode = 'static';
    obj.cursor = 'pointer';

    obj.hasBeenClicked = false;

    obj.on('pointerdown', function () {
        if (obj.hasBeenClicked) return;
        obj.hasBeenClicked = true;

        totalBonusXP += xpVal;
        showFloatingText(container, "+" + xpVal + " XP\n" + popupText, obj.x, obj.y - 40, 0x00ff00);

        // little bounce animation
        gsap.to(obj.scale, { x: 1.2, y: 1.2, duration: 0.1, yoyo: true, repeat: 1 });

        // Instantly update the inventory bag UI count
        if (typeof updateInventoryUI === 'function') {
            updateInventoryUI();
        }
    });
}

function hexToRGB(hex) {
    return {
        r: (hex >> 16) & 0xFF,
        g: (hex >> 8) & 0xFF,
        b: hex & 0xFF
    };
}

function lerpColor(a, b, t) {
    var ca = hexToRGB(a);
    var cb = hexToRGB(b);
    var r = Math.round(ca.r + (cb.r - ca.r) * t);
    var g = Math.round(ca.g + (cb.g - ca.g) * t);
    var bl = Math.round(ca.b + (cb.b - ca.b) * t);
    return (r << 16) | (g << 8) | bl;
}

function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
}

/* ------------------------------------------
   TYPEWRITER
   ------------------------------------------ */
var typingTimeouts = {};
function typeWriter(elementId, text, speed, callback) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = '';
    if (typingTimeouts[elementId]) {
        clearTimeout(typingTimeouts[elementId]);
    }

    var i = 0;
    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            typingTimeouts[elementId] = setTimeout(type, speed || 50);
        } else if (callback) {
            callback();
        }
    }
    type();
}

/* ------------------------------------------
   SCENE LABEL
   ------------------------------------------ */
var sceneLabelActive = false;
function showSceneLabel(text) {
    if (!text || sceneLabelActive) return;
    var label = document.getElementById('scene-label');
    if (!label) return;
    sceneLabelActive = true;
    label.textContent = text;
    gsap.fromTo(label,
        { opacity: 0 },
        {
            opacity: 1, duration: 0.5, yoyo: true, repeat: 1, repeatDelay: 1.5,
            onComplete: function () { sceneLabelActive = false; }
        }
    );
}

/* ------------------------------------------
   HUD UPDATE & INVENTORY
   ------------------------------------------ */
const SKILLS_DATA = [
    { id: 'math', name: 'Calculus Notes', icon: '📐', desc: 'Survived freshman math.', xpReq: 5 },
    { id: 'python', name: 'Python Scripts', icon: '🐍', desc: 'Learned to code.', xpReq: 15 },
    { id: 'bicycle', name: 'Campus Bicycle', icon: '🚲', desc: 'Navigated the huge campus.', xpReq: 25 },
    { id: 'sql', name: 'SQL Queries', icon: '🗄️', desc: 'Data extraction mastery.', xpReq: 40 },
    { id: 'abtest', name: 'A/B Spreadsheets', icon: '📊', desc: 'Analyzed user behavior.', xpReq: 55 },
    { id: 'pizza', name: 'Cold Pizza', icon: '🍕', desc: 'Fueled late nights.', xpReq: 70 },
    { id: 'finmod', name: 'Financial Models', icon: '📈', desc: 'Built DCF models.', xpReq: 85 },
    { id: 'coffee', name: 'Espresso', icon: '☕', desc: 'Liquid energy.', xpReq: 100 },
    { id: 'cfa', name: 'CFA Prep', icon: '📚', desc: 'Read 3000 pages.', xpReq: 115 },
    { id: 'memos', name: 'Credit Memos', icon: '📝', desc: 'Wrote investment thesis.', xpReq: 130 }
];

function calculateTotalXP() {
    var baseXP = 0;
    if (currentSceneIndex >= 0 && SCENES[currentSceneIndex]) {
        baseXP = SCENES[currentSceneIndex].xp;
    }
    return baseXP + totalBonusXP;
}

function updateInventoryUI() {
    var currentXP = calculateTotalXP();
    var bagXPElem = document.getElementById('bag-xp');
    var invBtn = document.getElementById('inventory-btn');
    if (bagXPElem) {
        bagXPElem.innerText = currentXP + ' XP';
    }
    if (invBtn && currentSceneIndex > 0) {
        invBtn.style.display = 'flex';
    }
}

function renderInventoryGrid() {
    var grid = document.getElementById('inventory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    var currentXP = calculateTotalXP();

    SKILLS_DATA.forEach(function (skill) {
        var isUnlocked = currentXP >= skill.xpReq;
        var el = document.createElement('div');
        el.className = 'inventory-item' + (isUnlocked ? '' : ' locked');

        var reqHtml = isUnlocked ? '' : '<span class="item-req">' + skill.xpReq + ' XP</span>';

        el.innerHTML =
            reqHtml +
            '<span class="item-icon">' + skill.icon + '</span>' +
            '<h3 class="item-name">' + (isUnlocked ? skill.name : '???') + '</h3>' +
            '<p class="item-desc">' + (isUnlocked ? skill.desc : 'Keep exploring to unlock.') + '</p>';

        grid.appendChild(el);
    });
}

function updateHUD(sceneIndex, sceneProgress) {
    var scene = SCENES[sceneIndex];
    if (!scene) return; // Guard against invalid sceneIndex during transitions
    var nextScene = SCENES[Math.min(sceneIndex + 1, SCENES.length - 1)];
    document.getElementById('hud-level').textContent = scene.lvl;
    document.getElementById('hud-class').textContent = scene.cls;
    document.getElementById('hud-quest').textContent = 'QUEST: ' + scene.quest;

    var xp = scene.xp + (nextScene.xp - scene.xp) * sceneProgress;
    var hp = scene.hp + (nextScene.hp - scene.hp) * sceneProgress;

    // Use regular progress bar for visual flow, but bag uses total calculated XP
    document.getElementById('hud-xp').style.width = xp + '%';
    var hpFill = document.getElementById('hud-hp');
    hpFill.style.width = hp + '%';
    hpFill.style.background = hp < 30 ? '#ef4444' : hp < 60 ? '#facc15' : '#22c55e';

    updateInventoryUI();
}

/* ------------------------------------------
   CREATE GRADIENT TEXTURE
   ------------------------------------------ */
function createGradientGraphics(w, h, colorTop, colorBottom) {
    var g = new PIXI.Graphics();
    var steps = 64;
    var stripH = Math.ceil(h / steps);
    for (var i = 0; i < steps; i++) {
        var t = i / (steps - 1);
        var c = lerpColor(colorTop, colorBottom, t);
        g.beginFill(c, 1);
        g.drawRect(0, i * stripH, w, stripH + 1);
        g.endFill();
    }
    return g;
}

/* ------------------------------------------
   CREATE SPOTLIGHT
   ------------------------------------------ */
function createSpotlight(w, h, color, cx, cy) {
    var g = new PIXI.Graphics();
    var radius = Math.min(w, h) * 0.7;
    var steps = 20;
    for (var i = steps; i > 0; i--) {
        var t = i / steps;
        var r = radius * t;
        var alpha = (1 - t) * 0.4;
        g.beginFill(color, alpha);
        g.drawCircle(cx, cy, r);
        g.endFill();
    }
    return g;
}

/* ------------------------------------------
   CREATE VIGNETTE
   ------------------------------------------ */
function createVignette(w, h) {
    var g = new PIXI.Graphics();
    var cx = w / 2;
    var cy = h / 2;
    var radius = Math.sqrt(cx * cx + cy * cy);
    // Very light vignette — just darken extreme edges
    var steps = 8;
    for (var i = 0; i < steps; i++) {
        var t = i / steps;
        var outerR = radius * (1 - t * 0.3);
        var alpha = t * t * 0.08;
        g.beginFill(0x000000, alpha);
        g.drawCircle(cx, cy, outerR);
        g.endFill();
    }
    return g;
}

/* ------------------------------------------
   TILE FLOOR
   ------------------------------------------ */
function createFloorLayer(sceneW, sceneH, floorType) {
    var container = new PIXI.Container();
    var floorTop = Math.floor(sceneH * 0.55);
    var floorH = sceneH - floorTop;

    var tex = tileTextures[floorType] || tileTextures['concrete'] || null;
    if (tex) {
        var tileSize = 32;
        var cols = Math.ceil(sceneW / tileSize);
        var rows = Math.ceil(floorH / tileSize);
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var s = new PIXI.Sprite(tex);
                s.x = c * tileSize;
                s.y = floorTop + r * tileSize;
                s.width = tileSize;
                s.height = tileSize;
                container.addChild(s);
            }
        }
    } else {
        var fallbackColors = {
            'concrete': 0x333344, 'grass': 0x2d5a27, 'wood-floor': 0x5a3a1a,
            'tile-white': 0x888899, 'carpet-red': 0x6a2222, 'wood-floor-dark': 0x3a2210,
            'tile-dark': 0x2a2a3a
        };
        var color = fallbackColors[floorType] || 0x333344;
        var g = new PIXI.Graphics();
        g.beginFill(color, 1);
        g.drawRect(0, floorTop, sceneW, floorH);
        g.endFill();
        // grid lines
        g.lineStyle(1, 0xffffff, 0.06);
        var ts = 32;
        for (var gx = 0; gx < sceneW; gx += ts) {
            g.moveTo(gx, floorTop);
            g.lineTo(gx, sceneH);
        }
        for (var gy = floorTop; gy < sceneH; gy += ts) {
            g.moveTo(0, gy);
            g.lineTo(sceneW, gy);
        }
        container.addChild(g);
    }
    return container;
}

/* ------------------------------------------
   PROP HELPERS
   ------------------------------------------ */
function placeProp(container, texName, x, y, scale) {
    scale = scale || 1;
    var tex = propTextures[texName] || null;
    if (tex) {
        var s = new PIXI.Sprite(tex);
        s.anchor.set(0.5, 1);
        s.x = x;
        s.y = y;
        s.scale.set(scale);
        container.addChild(s);
        return s;
    }
    // fallback rectangle
    var g = new PIXI.Graphics();
    g.beginFill(0x555566, 1);
    g.drawRect(-16, -32, 32, 32);
    g.endFill();
    g.x = x;
    g.y = y;
    g.scale.set(scale);
    container.addChild(g);
    return g;
}

function drawRect(container, x, y, w, h, color, alpha) {
    var g = new PIXI.Graphics();
    g.beginFill(color, alpha !== undefined ? alpha : 1);
    g.drawRect(x, y, w, h);
    g.endFill();
    container.addChild(g);
    return g;
}

function drawText(container, text, x, y, fontSize, color) {
    var t = new PIXI.Text(text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: fontSize || 10,
        fill: color || 0xffffff,
        wordWrap: true,
        wordWrapWidth: SCENE_WIDTH * 0.6
    });
    t.anchor.set(0.5, 0.5);
    t.x = x;
    t.y = y;
    container.addChild(t);
    return t;
}

function drawMonitor(container, x, y, screenColor, lineColor, lineCount) {
    var g = new PIXI.Container();
    g.x = x; g.y = y;
    // We add pivot so it scales from the center instead of the bottom-left
    g.pivot.set(0, -40);
    g.y -= 40;

    // monitor stand top
    drawRect(g, -6, -22, 12, 4, 0x777788, 1);
    // stand front
    drawRect(g, -6, -18, 12, 6, 0x555566, 1);
    // stand base
    drawRect(g, -14, -14, 28, 6, 0x666677, 1);
    drawRect(g, -14, -8, 28, 4, 0x444455, 1);
    // monitor body
    drawRect(g, -44, -82, 88, 60, 0x222233, 1);
    // screen bezel
    drawRect(g, -40, -78, 80, 52, screenColor || 0x0a1a0a, 1);
    // screen glow
    drawRect(g, -38, -76, 76, 48, screenColor || 0x0a1a0a, 0.8);
    // lines on screen
    var lc = lineCount || 4;
    for (var i = 0; i < lc; i++) {
        drawText(g, '...', 0, -60 + (i * 8), 8, lineColor || 0x44ff44);
    }
    g.hitArea = new PIXI.Rectangle(-45, -85, 90, 80);
    container.addChild(g);
    return g;
}

function drawWindow(container, x, y, w, h) {
    drawRect(container, x, y, w, h, 0x1a2a4a, 1);
    // panes
    drawRect(container, x + 2, y + 2, w / 2 - 3, h / 2 - 3, 0x2a3a5a, 1);
    drawRect(container, x + w / 2 + 1, y + 2, w / 2 - 3, h / 2 - 3, 0x2a3a5a, 1);
    drawRect(container, x + 2, y + h / 2 + 1, w / 2 - 3, h / 2 - 3, 0x2a3a5a, 1);
    drawRect(container, x + w / 2 + 1, y + h / 2 + 1, w / 2 - 3, h / 2 - 3, 0x2a3a5a, 1);
}

function drawCitySkyline(container, x, y, w, h, color) {
    var g = new PIXI.Graphics();
    g.beginFill(color || 0x0a0a1e, 1);
    g.drawRect(x, y, w, h);
    g.endFill();
    // buildings
    var numBuildings = 12;
    for (var i = 0; i < numBuildings; i++) {
        var bw = 20 + Math.random() * 30;
        var bh = 30 + Math.random() * 80;
        var bx = x + (w / numBuildings) * i + 3;
        var by = y + h - bh;
        var bColor = lerpColor(0x1a1a3a, 0x2a2a5a, Math.random());
        g.beginFill(bColor, 1);
        g.drawRect(bx, by, bw, bh);
        g.endFill();
        // windows — lit up
        for (var wy = by + 5; wy < by + bh - 5; wy += 9) {
            for (var wx = bx + 3; wx < bx + bw - 3; wx += 8) {
                var lit = Math.random() > 0.35;
                g.beginFill(lit ? 0xffcc44 : 0x151525, lit ? 0.9 : 0.5);
                g.drawRect(wx, wy, 4, 4);
                g.endFill();
            }
        }
    }
    container.addChild(g);
    return g;
}

function drawTree(container, x, y) {
    var g = new PIXI.Graphics();
    // trunk
    g.beginFill(0x5a3a1a, 1);
    g.drawRect(x - 8, y - 60, 16, 60);
    g.endFill();
    g.beginFill(0x4a2a10, 1);
    g.drawRect(x - 6, y - 55, 4, 50);
    g.endFill();
    // canopy layers
    g.beginFill(0x1d6a17, 1);
    g.drawCircle(x, y - 80, 40);
    g.endFill();
    g.beginFill(0x2d7a27, 1);
    g.drawCircle(x - 15, y - 70, 28);
    g.drawCircle(x + 18, y - 75, 30);
    g.endFill();
    g.beginFill(0x3a8a32, 1);
    g.drawCircle(x, y - 90, 25);
    g.drawCircle(x - 20, y - 82, 18);
    g.drawCircle(x + 22, y - 85, 20);
    g.endFill();
    container.addChild(g);
    return g;
}

function drawBookshelf(container, x, y) {
    // shelf frame
    drawRect(container, x, y - 100, 80, 100, 0x5a3a1a, 1);
    drawRect(container, x + 2, y - 98, 76, 96, 0x4a2a10, 1);
    // shelves
    drawRect(container, x, y - 66, 80, 4, 0x7a5a2a, 1);
    drawRect(container, x, y - 33, 80, 4, 0x7a5a2a, 1);
    // books
    var colors = [0xef4444, 0x3b82f6, 0x22c55e, 0xfacc15, 0xa855f7, 0xff8844, 0x44ddaa];
    for (var shelf = 0; shelf < 3; shelf++) {
        var sy = y - 96 + shelf * 33;
        for (var b = 0; b < 7; b++) {
            var bw = 6 + Math.random() * 5;
            var bh = 22 + Math.random() * 6;
            drawRect(container, x + 5 + b * 10, sy + (28 - bh), bw, bh, colors[b % colors.length], 1);
        }
    }
}

function drawDesk(container, x, y, w) {
    w = w || 120;
    // desk top surface (3/4 perspective)
    drawRect(container, x - w / 2, y - 24, w, 18, 0x8a6a3a, 1);
    // desk front edge
    drawRect(container, x - w / 2, y - 6, w, 6, 0x4a2a10, 1);

    // legs (back and front)
    // back left leg
    drawRect(container, x - w / 2 + 8, y - 20, 6, 30, 0x3a1a00, 1);
    // back right leg
    drawRect(container, x + w / 2 - 14, y - 20, 6, 30, 0x3a1a00, 1);

    // front left leg
    drawRect(container, x - w / 2 + 8, y - 6, 6, 36, 0x5a3a10, 1);
    // front right leg
    drawRect(container, x + w / 2 - 14, y - 6, 6, 36, 0x5a3a10, 1);
}

function drawCoffeeCup(container, x, y) {
    var cont = new PIXI.Container();
    cont.x = x; cont.y = y;
    cont.pivot.set(0, -10);
    cont.y -= 10;

    var g = new PIXI.Graphics();
    g.beginFill(0xeeeeee, 1);
    g.drawRect(-7, -14, 14, 14);
    g.endFill();
    g.beginFill(0x6a3a1a, 1);
    g.drawRect(-5, -12, 10, 8);
    g.endFill();
    // steam
    g.beginFill(0xcccccc, 0.3);
    g.drawRect(-2, -20, 2, 5);
    g.drawRect(2, -22, 2, 6);
    g.endFill();
    // handle
    g.lineStyle(3, 0xeeeeee, 1);
    g.arc(9, -7, 5, -1.2, 1.2, false);

    cont.hitArea = new PIXI.Rectangle(-12, -25, 25, 25);
    cont.addChild(g);
    container.addChild(cont);
    return cont;
}

function drawStage(container, x, y, w) {
    w = w || 300;
    // main platform
    drawRect(container, x - w / 2, y - 18, w, 18, 0x7a5a2a, 1);
    drawRect(container, x - w / 2 + 3, y - 15, w - 6, 3, 0x9a7a4a, 1);
    // front face
    drawRect(container, x - w / 2, y, w, 12, 0x5a3a1a, 1);
    // podium
    drawRect(container, x - 20, y - 50, 40, 32, 0x6a4a2a, 1);
    drawRect(container, x - 18, y - 48, 36, 28, 0x7a5a3a, 1);
}

function drawTrophy(container, x, y, color) {
    var cont = new PIXI.Container();
    cont.x = x; cont.y = y;
    cont.pivot.set(0, -15);
    cont.y -= 15;

    var g = new PIXI.Graphics();
    g.beginFill(color || 0xfacc15, 1);
    // cup body
    g.drawRect(-10, -28, 20, 16);
    // cup rim
    g.drawRect(-12, -30, 24, 4);
    // handles
    g.drawRect(-15, -26, 5, 10);
    g.drawRect(10, -26, 5, 10);
    // stem
    g.drawRect(-3, -12, 6, 8);
    // base
    g.drawRect(-10, -4, 20, 5);
    g.endFill();
    // shine
    g.beginFill(0xffffff, 0.3);
    g.drawRect(-6, -26, 4, 10);
    g.endFill();

    cont.hitArea = new PIXI.Rectangle(-15, -30, 30, 30);
    cont.addChild(g);
    container.addChild(cont);
    return cont;
}

function drawBed(container, x, y) {
    // bed frame
    drawRect(container, x - 50, y - 25, 100, 25, 0x4a3a2a, 1);
    // mattress
    drawRect(container, x - 48, y - 22, 96, 18, 0x3a3a5a, 1);
    // pillow
    drawRect(container, x - 46, y - 30, 30, 12, 0xccccdd, 1);
    // blanket (messy)
    drawRect(container, x - 20, y - 20, 64, 14, 0x5a5a8a, 1);
    drawRect(container, x - 10, y - 24, 40, 6, 0x5a5a8a, 0.7);
    // headboard
    drawRect(container, x - 50, y - 40, 6, 40, 0x5a3a1a, 1);
}

function drawWhiteboard(container, x, y, lines) {
    // frame
    drawRect(container, x - 55, y - 80, 110, 70, 0xdddddd, 1);
    // board
    drawRect(container, x - 52, y - 77, 104, 64, 0xf0f0f0, 1);
    // top bar
    drawRect(container, x - 55, y - 80, 110, 4, 0x999999, 1);
    // marker tray
    drawRect(container, x - 40, y - 12, 80, 6, 0xaaaaaa, 1);
    // markers
    drawRect(container, x - 30, y - 14, 16, 4, 0xef4444, 1);
    drawRect(container, x - 10, y - 14, 16, 4, 0x3b82f6, 1);
    drawRect(container, x + 10, y - 14, 16, 4, 0x22c55e, 1);
    if (lines) {
        for (var i = 0; i < lines; i++) {
            var lw = 25 + Math.random() * 50;
            var lcolor = i % 2 === 0 ? 0x333333 : 0xef4444;
            drawRect(container, x - 42, y - 70 + i * 12, lw, 3, lcolor, 0.6);
        }
    }
}

function drawBeanBag(container, x, y) {
    var g = new PIXI.Graphics();
    g.beginFill(0xff6644, 1);
    g.drawEllipse(x, y - 15, 30, 20);
    g.endFill();
    g.beginFill(0xee5533, 1);
    g.drawEllipse(x - 5, y - 18, 20, 14);
    g.endFill();
    container.addChild(g);
}

function drawPizzaBox(container, x, y) {
    var g = new PIXI.Container();
    g.x = x; g.y = y;
    g.pivot.set(0, -4);
    g.y -= 4;

    drawRect(g, -18, -8, 36, 8, 0xd4a037, 1);
    drawRect(g, -16, -6, 32, 4, 0xe8c060, 1);
    // grease stain
    drawRect(g, -5, -5, 10, 2, 0xc49030, 0.5);

    g.hitArea = new PIXI.Rectangle(-20, -10, 40, 12);
    container.addChild(g);
    return g;
}

function createBicycleGraphics() {
    var bike = new PIXI.Graphics();
    bike.lineStyle(3, 0xaaaaaa); // thicker lines
    bike.drawCircle(-30, -15, 15); // back wheel
    bike.drawCircle(30, -15, 15);  // front wheel

    // frame
    bike.moveTo(-30, -15);
    bike.lineTo(-15, -35);
    bike.lineTo(15, -35);
    bike.lineTo(30, -15);
    // center support
    bike.moveTo(-15, -35);
    bike.lineTo(0, -15);

    // seat post
    bike.moveTo(-15, -35);
    bike.lineTo(-20, -50);
    // handle post
    bike.moveTo(15, -35);
    bike.lineTo(15, -55);

    bike.lineStyle(0);
    bike.beginFill(0x222222);
    bike.drawRect(-25, -53, 12, 4); // seat
    bike.endFill();

    bike.beginFill(0x992222);
    bike.drawRect(8, -58, 14, 4); // handle bars
    bike.endFill();

    // Scale it up a bit more overall
    bike.scale.set(1.5);
    return bike;
}

/* ------------------------------------------
   BUILD INDIVIDUAL SCENES
   ------------------------------------------ */
function buildScene(index) {
    var sceneData = SCENES[index];
    var palette = SCENE_PALETTES[sceneData.id];
    var sw = SCENE_WIDTH;
    var sh = app.screen.height;
    var floorTop = Math.floor(sh * 0.55);
    var charY = Math.floor(sh * 0.55) + 30;

    var container = new PIXI.Container();
    container.x = index * sw;

    // Layers
    var backgroundLayer = new PIXI.Container();
    var parallaxLayer = new PIXI.Container();
    var floorLayer = new PIXI.Container();
    var propsBackLayer = new PIXI.Container();
    var characterLayer = new PIXI.Container();
    var propsFrontLayer = new PIXI.Container();
    var effectsLayer = new PIXI.Container();

    container.addChild(backgroundLayer);
    container.addChild(parallaxLayer);
    container.addChild(floorLayer);
    container.addChild(propsBackLayer);
    container.addChild(characterLayer);
    container.addChild(propsFrontLayer);
    container.addChild(effectsLayer);

    // Background gradient — extend to full height and extra width to avoid seams on resize
    var bg = createGradientGraphics(sw + 2000, sh, palette.bg1, palette.bg2);
    backgroundLayer.addChild(bg);

    // Ambient color wash for scene mood
    var ambientWash = new PIXI.Graphics();
    ambientWash.beginFill(palette.ambient, 0.06);
    ambientWash.drawRect(0, 0, sw + 2000, sh);
    ambientWash.endFill();
    backgroundLayer.addChild(ambientWash);

    // Subtle blur on far background for HD-2D depth
    backgroundLayer.filters = [new PIXI.BlurFilter(1.5)];
    // Parallax layer gets a slight blur too for distance
    parallaxLayer.filters = [new PIXI.BlurFilter(0.8)];

    // Floor
    var floor = createFloorLayer(sw + 2000, sh, palette.floor);
    floorLayer.addChild(floor);

    // Spotlight — behind the floor so glow doesn't cover the ground
    var spot = createSpotlight(sw, sh, palette.ambient, sw / 2, charY - 40);
    backgroundLayer.addChild(spot);

    // Scene-specific props
    var cx = sw / 2; // center x

    switch (sceneData.id) {

        case 'intro':
            // Instead of putting text in effectsLayer (which is below vignette), we put it directly on the HUD overlay later, 
            // but for now we can just draw dummy text here and handle the real text in the onSceneEnter overlay.
            break;

        case 'iitkgp-arrival':
            drawTree(parallaxLayer, cx - sw * 0.3, floorTop);
            drawTree(parallaxLayer, cx - sw * 0.2, floorTop);
            drawTree(parallaxLayer, cx + sw * 0.25, floorTop);
            drawTree(parallaxLayer, cx + sw * 0.35, floorTop);
            // Main Building Silhouette 
            drawRect(propsBackLayer, cx - 150, floorTop - 150, 300, 150, 0x3a2a1a, 1); // Main block
            drawRect(propsBackLayer, cx - 40, floorTop - 220, 80, 70, 0x4a3a2a, 1); // Tower
            drawRect(propsBackLayer, cx - 20, floorTop - 250, 40, 30, 0x5a4a3a, 1); // Dome base
            var dome = new PIXI.Graphics();
            dome.beginFill(0x5a4a3a); dome.drawCircle(cx, floorTop - 250, 20); dome.endFill();
            propsBackLayer.addChild(dome);
            // Campus gate arch — large and prominent
            drawRect(propsBackLayer, cx - 80, floorTop - 120, 16, 120, 0x7a5a3a, 1);
            drawRect(propsBackLayer, cx + 64, floorTop - 120, 16, 120, 0x7a5a3a, 1);
            drawRect(propsBackLayer, cx - 80, floorTop - 135, 160, 20, 0x9a7a5a, 1);
            drawRect(propsBackLayer, cx - 76, floorTop - 132, 152, 3, 0xaa8a6a, 1);
            drawText(propsBackLayer, 'IIT KHARAGPUR', cx, floorTop - 124, 9, 0xffffff);
            // Bicycle
            var bike2 = createBicycleGraphics();
            bike2.x = cx + 100;
            bike2.y = floorTop + 25;
            propsFrontLayer.addChild(bike2);
            sceneData._bike = bike2;
            // lamp posts
            drawRect(propsBackLayer, cx - 100, floorTop - 50, 4, 50, 0x555555, 1);
            drawRect(propsBackLayer, cx + 96, floorTop - 50, 4, 50, 0x555555, 1);
            var lamp1 = new PIXI.Graphics();
            lamp1.beginFill(0xffcc44, 0.8);
            lamp1.drawCircle(cx - 98, floorTop - 55, 6);
            lamp1.endFill();
            lamp1.beginFill(0xffcc44, 0.2);
            lamp1.drawCircle(cx - 98, floorTop - 55, 20);
            lamp1.endFill();
            effectsLayer.addChild(lamp1);
            break;

        case 'covid-lockdown':
            // 2020 layout
            drawBed(propsBackLayer, sw * 0.25, floorTop + 20);
            var desk0 = drawDesk(propsBackLayer, sw * 0.75, floorTop - 10);
            var mon0 = drawMonitor(propsFrontLayer, sw * 0.75, floorTop - 10);
            makeInteractive(mon0, effectsLayer, "Zoom Lectures", 15);
            // window with green virus particles outside (simulated by drawRects or actual particles)
            drawWindow(propsBackLayer, cx - sw * 0.3, floorTop - 120, 80, 100);
            drawText(effectsLayer, "LOCKDOWN", cx - sw * 0.3 + 40, floorTop - 130, 8, 0x44ff44);
            var flickerG = drawRect(effectsLayer, 0, 0, sw + 2000, sh, 0x000000, 0.15);
            flickerG.visible = false;
            flickerOverlays.push({ graphics: flickerG, sceneIndex: index });
            break;

        case 'campus-return':
            // 2021 return
            var bike = createBicycleGraphics();
            bike.x = sw * 0.2;
            bike.y = floorTop + 25;
            propsFrontLayer.addChild(bike);
            makeInteractive(bike, effectsLayer, "Fresh Air", 20);

            var desk1 = drawDesk(propsBackLayer, sw * 0.8, floorTop - 10);
            var mon1 = drawMonitor(propsFrontLayer, sw * 0.8, floorTop - 10);
            makeInteractive(mon1, effectsLayer, "Python Scripts", 15);
            break;

        case 'iimb-intern':
            drawDesk(propsBackLayer, cx + sw * 0.15, floorTop - 10, 120);
            var mon1 = drawMonitor(propsBackLayer, cx + sw * 0.15, floorTop - 10, 0x0a1a0a, 0x44ff44, 6);
            makeInteractive(mon1, effectsLayer, "Python Scripts", 15);
            drawBookshelf(propsBackLayer, cx - sw * 0.2, floorTop);
            // professor NPC hint
            var profG = new PIXI.Graphics();
            profG.beginFill(0x8888cc, 1);
            profG.drawRect(-8, -24, 16, 24);
            profG.endFill();
            profG.beginFill(0xffccaa, 1);
            profG.drawCircle(0, -28, 6);
            profG.endFill();
            profG.x = cx - sw * 0.2;
            profG.y = floorTop + 8;
            propsBackLayer.addChild(profG);
            break;

        case 'snapdeal':
            var desk2 = drawDesk(propsBackLayer, sw * 0.3, floorTop - 10);
            var mon2 = drawMonitor(propsFrontLayer, sw * 0.3, floorTop - 10);
            var desk3 = drawDesk(propsBackLayer, sw * 0.7, floorTop - 10);
            var mon3 = drawMonitor(propsFrontLayer, sw * 0.7, floorTop - 10);
            makeInteractive(mon2, effectsLayer, "A/B Spreadsheets", 15);
            makeInteractive(mon3, effectsLayer, "SQL Queries", 15);
            var pizza = drawPizzaBox(propsFrontLayer, sw * 0.5, floorTop + 20);
            makeInteractive(pizza, effectsLayer, "Cold Pizza", 20);
            drawBeanBag(propsBackLayer, cx + sw * 0.25, floorTop + 20);
            drawWhiteboard(propsBackLayer, cx + sw * 0.15, floorTop, 5);
            // energy drink
            drawRect(propsFrontLayer, cx + 30, floorTop + 15, 6, 12, 0x22dd44, 1);
            break;

        case 'dc-advisory':
            // Large window with city skyline
            drawCitySkyline(parallaxLayer, cx - sw * 0.35, floorTop - 200, sw * 0.7, 150, 0x0a0a1e);
            // Window frame
            drawRect(propsBackLayer, cx - sw * 0.3, floorTop - 180, sw * 0.6, 4, 0x444466, 1);
            drawRect(propsBackLayer, cx - sw * 0.3, floorTop - 60, sw * 0.6, 4, 0x444466, 1);
            drawRect(propsBackLayer, cx, floorTop - 180, 4, 124, 0x444466, 1);
            var desk4 = drawDesk(propsBackLayer, sw * 0.8, floorTop - 10);
            var mon4 = drawMonitor(propsFrontLayer, sw * 0.8, floorTop - 10);
            makeInteractive(mon4, effectsLayer, "Financial Models", 25);

            var cup1 = drawCoffeeCup(propsFrontLayer, sw * 0.4, floorTop - 10);
            var cup2 = drawCoffeeCup(propsFrontLayer, sw * 0.5, floorTop - 10);
            var cup3 = drawCoffeeCup(propsFrontLayer, sw * 0.6, floorTop - 10);
            makeInteractive(cup1, effectsLayer, "Espresso", 10);
            makeInteractive(cup2, effectsLayer, "Espresso", 10);
            makeInteractive(cup3, effectsLayer, "Espresso", 10);
            break;

        case 'iitkgp-senior':
            // CFAs and Meets
            var desk5 = drawDesk(propsBackLayer, sw * 0.2, floorTop - 10);
            var mon5 = drawMonitor(propsFrontLayer, sw * 0.2, floorTop - 10);
            makeInteractive(mon5, effectsLayer, "CFA Prep", 15);
            var tro1 = drawTrophy(propsFrontLayer, sw * 0.35, floorTop - 10);
            makeInteractive(tro1, effectsLayer, "CFA Trophy!", 30);

            // Bunch of medals
            var tro2 = drawTrophy(propsFrontLayer, sw * 0.5, floorTop - 10);
            var tro3 = drawTrophy(propsFrontLayer, sw * 0.65, floorTop - 10);
            var tro4 = drawTrophy(propsFrontLayer, sw * 0.8, floorTop - 10);
            var tro5 = drawTrophy(propsFrontLayer, sw * 0.95, floorTop - 10);
            tro3.scale.set(0.8);
            tro4.scale.set(0.6);
            makeInteractive(tro2, effectsLayer, "Gold Medal", 20);
            makeInteractive(tro3, effectsLayer, "Silver Medal", 15);
            makeInteractive(tro4, effectsLayer, "Bronze Medal", 10);
            makeInteractive(tro5, effectsLayer, "Gold Medal", 20);
            drawText(effectsLayer, 'CFA RESEARCH CHALLENGE', cx - sw * 0.15, floorTop - 80, 6, 0xfacc15);
            break;

        case 'iitkgp-grad':
            drawStage(propsBackLayer, cx, floorTop, 300);
            // trophy shelf — wide and prominent
            drawRect(propsBackLayer, cx + sw * 0.15 - 10, floorTop - 80, 120, 8, 0x7a5a2a, 1);
            drawRect(propsBackLayer, cx + sw * 0.15 - 8, floorTop - 72, 116, 3, 0x9a7a4a, 1);
            var tro2 = drawTrophy(propsBackLayer, cx + sw * 0.15 + 5, floorTop - 82, 0xfacc15);
            var tro3 = drawTrophy(propsBackLayer, cx + sw * 0.15 + 30, floorTop - 82, 0xc0c0c0);
            var tro4 = drawTrophy(propsBackLayer, cx + sw * 0.15 + 55, floorTop - 82, 0xcd7f32);
            var tro5 = drawTrophy(propsBackLayer, cx + sw * 0.15 + 80, floorTop - 82, 0xfacc15);
            makeInteractive(tro2, effectsLayer, "Gold Medal", 20);
            makeInteractive(tro3, effectsLayer, "Silver Medal", 15);
            makeInteractive(tro4, effectsLayer, "Bronze Medal", 10);
            makeInteractive(tro5, effectsLayer, "Gold Medal", 20);
            // banner
            drawText(effectsLayer, 'IIT KGP GRADUATION', cx, floorTop - 200, 11, 0xfacc15);
            break;

        case 'iimc-arrival':
            drawDesk(propsBackLayer, cx + sw * 0.12, floorTop - 10, 140);
            // Falling books animation hook
            var bookPile = new PIXI.Graphics();
            bookPile.beginFill(0x8b4513); bookPile.drawRect(-20, -10, 40, 10); bookPile.endFill();
            bookPile.beginFill(0x228b22); bookPile.drawRect(-18, -20, 36, 10); bookPile.endFill();
            bookPile.beginFill(0x4682b4); bookPile.drawRect(-22, -30, 44, 10); bookPile.endFill();
            bookPile.x = cx - sw * 0.2; bookPile.y = -400;
            propsFrontLayer.addChild(bookPile);
            // We'll create falling properties
            sceneData._bookPile = bookPile;
            sceneData._deskY = floorTop - 10;
            drawText(effectsLayer, 'IIM CALCUTTA', cx, floorTop - 180, 10, 0xffffff);
            break;

        case 'ascertis-intern':
            var desk6 = drawDesk(propsBackLayer, sw * 0.8, floorTop - 10);
            var mon6 = drawMonitor(propsFrontLayer, sw * 0.8, floorTop - 10);
            makeInteractive(mon6, effectsLayer, "Credit Memos", 25);
            var cup4 = drawCoffeeCup(propsFrontLayer, sw * 0.65, floorTop - 10);
            makeInteractive(cup4, effectsLayer, "Espresso", 10);
            // PPO badge glow
            var badge = new PIXI.Graphics();
            badge.beginFill(0xfacc15, 0.9);
            badge.drawRoundedRect(-12, -8, 24, 16, 3);
            badge.endFill();
            badge.x = cx + sw * 0.2;
            badge.y = floorTop - 40;
            propsFrontLayer.addChild(badge);
            drawText(propsFrontLayer, 'PPO', cx + sw * 0.2, floorTop - 40, 6, 0x1a0a0a);
            // glow behind badge
            var badgeGlow = new PIXI.Graphics();
            badgeGlow.beginFill(0xfacc15, 0.15);
            badgeGlow.drawCircle(0, 0, 25);
            badgeGlow.endFill();
            badgeGlow.x = cx + sw * 0.2;
            badgeGlow.y = floorTop - 40;
            effectsLayer.addChild(badgeGlow);
            break;

        case 'iimc-senior':
            drawTree(parallaxLayer, cx - sw * 0.3, floorTop);
            drawTree(parallaxLayer, cx + sw * 0.3, floorTop);
            // Lake reflection
            drawRect(floorLayer, cx - 100, floorTop + 20, 200, 40, 0x4488cc, 0.6);
            drawText(effectsLayer, 'BEAUTIFUL CAMPUS', cx, floorTop - 100, 9, 0xaaffcc);
            break;

        case 'iimc-grad':
            drawStage(propsBackLayer, cx, floorTop, 280);
            // diploma frame — large
            drawRect(propsBackLayer, cx + sw * 0.18 - 25, floorTop - 110, 50, 65, 0x7a5a2a, 1);
            drawRect(propsBackLayer, cx + sw * 0.18 - 21, floorTop - 106, 42, 57, 0xffffee, 1);
            drawText(propsBackLayer, 'MBA', cx + sw * 0.18, floorTop - 85, 8, 0x333333);
            drawText(propsBackLayer, 'IIM CALCUTTA', cx + sw * 0.18, floorTop - 72, 5, 0x666666);
            // celebration text
            drawText(effectsLayer, 'CLASS OF 2026', cx, floorTop - 200, 11, 0xfacc15);
            break;

        case 'ascertis-ft':
            // Large panoramic window with city skyline
            drawCitySkyline(parallaxLayer, cx - sw * 0.4, floorTop - 220, sw * 0.8, 170, 0x0a1020);
            drawRect(propsBackLayer, cx - sw * 0.35, floorTop - 200, sw * 0.7, 4, 0x444466, 1);
            drawRect(propsBackLayer, cx - sw * 0.35, floorTop - 60, sw * 0.7, 4, 0x444466, 1);
            drawDesk(propsBackLayer, cx, floorTop - 10, 160);
            // dual monitors
            drawMonitor(propsBackLayer, cx - 60, floorTop - 10, 0x0a0a1e, 0x4488ff, 5);
            drawMonitor(propsBackLayer, cx + 60, floorTop - 10, 0x0a0a1e, 0x44ff44, 4);
            drawCoffeeCup(propsFrontLayer, cx + 120, floorTop - 22);
            drawText(effectsLayer, 'CURRENT QUEST', cx, sh * 0.15, 12, 0x4488ff);
            drawText(effectsLayer, 'Structuring private credit deals.', cx, sh * 0.22, 9, 0x88aacc);
            break;
    }

    // No blur on foreground props — keep them crisp and visible

    container.addChild(effectsLayer);

    // Store reference
    sceneContainers.push({
        container: container,
        parallaxLayer: parallaxLayer,
        effectsLayer: effectsLayer,
        propsBackLayer: propsBackLayer,
        characterLayer: characterLayer
    });

    return container;
}

/* ------------------------------------------
   PARTICLE SYSTEM
   ------------------------------------------ */
function createParticle(container, x, y, type, sceneW, sceneH) {
    var g = new PIXI.Graphics();
    var color, size;

    switch (type) {
        case 'star':
            size = 2 + Math.random() * 3;
            g.beginFill(0xffffff, 0.6 + Math.random() * 0.4);
            g.drawRect(-size / 2, -size / 2, size, size);
            g.endFill();
            // glow
            g.beginFill(0xffffff, 0.15);
            g.drawCircle(0, 0, size * 2);
            g.endFill();
            break;
        case 'dust':
            size = 2 + Math.random() * 3;
            g.beginFill(0xddddbb, 0.4 + Math.random() * 0.3);
            g.drawCircle(0, 0, size);
            g.endFill();
            break;
        case 'virus':
            size = 5 + Math.random() * 6; // Make them larger and scarier
            g.beginFill(0x15803d, 0.4); // dark green aura
            g.drawCircle(0, 0, size * 1.5);
            g.beginFill(0x22c55e, 0.9); // green core
            g.drawCircle(0, 0, size);
            g.beginFill(0xef4444, 0.9); // red spikes for a more menacing look
            g.drawCircle(-size, 0, 2);
            g.drawCircle(size, 0, 2);
            g.drawCircle(0, -size, 2);
            g.drawCircle(0, size, 2);
            g.drawCircle(-size * 0.7, -size * 0.7, 1.5);
            g.drawCircle(size * 0.7, size * 0.7, 1.5);
            g.drawCircle(size * 0.7, -size * 0.7, 1.5);
            g.drawCircle(-size * 0.7, size * 0.7, 1.5);
            g.endFill();
            break;
        case 'leaf':
            g.beginFill(0x4ade80, 0.8);
            g.drawEllipse(0, 0, 4, 2);
            g.endFill();
            break;
        case 'confetti':
            var colors = [0xfacc15, 0xef4444, 0x3b82f6, 0x22c55e, 0xa855f7, 0xff6644];
            color = colors[Math.floor(Math.random() * colors.length)];
            g.beginFill(color, 0.95);
            g.drawRect(-3, -4, 6, 8);
            g.endFill();
            break;
        case 'code':
            g.beginFill(0x44ff44, 0.5 + Math.random() * 0.3);
            g.drawRect(-2, -2, 4, 4);
            g.endFill();
            break;
        case 'rupee':
            g.beginFill(0xfacc15, 0.7);
            g.drawCircle(0, 0, 5);
            g.endFill();
            g.beginFill(0xfacc15, 0.2);
            g.drawCircle(0, 0, 9);
            g.endFill();
            break;
        default:
            g.beginFill(0xffffff, 0.4);
            g.drawCircle(0, 0, 2);
            g.endFill();
    }

    g.x = x;
    g.y = y;
    container.addChild(g);

    var speed = 0.3 + Math.random() * 0.5;
    var drift = (Math.random() - 0.5) * 0.3;
    var rotSpeed = (Math.random() - 0.5) * 0.04;

    var p = {
        gfx: g,
        vx: drift,
        vy: -speed,
        rotSpeed: rotSpeed,
        life: 200 + Math.random() * 200,
        age: 0,
        originX: x,
        originY: y,
        type: type,
        sceneW: sceneW,
        sceneH: sceneH,
        container: container
    };

    if (type === 'confetti' || type === 'leaf') {
        p.vy = 0.3 + Math.random() * 0.6;
        p.vx = (Math.random() - 0.5) * 0.8;
    } else if (type === 'virus') {
        p.vy = (Math.random() - 0.5) * 0.2;
        p.vx = (Math.random() - 0.5) * 0.4;
    }

    particles.push(p);
    return p;
}

function spawnSceneParticles(sceneIndex) {
    var sceneData = SCENES[sceneIndex];
    var config = SCENE_PARTICLES_CONFIG[sceneData.id];
    if (!config) return;

    var sc = sceneContainers[sceneIndex];
    if (!sc) return;

    var sw = SCENE_WIDTH;
    var sh = app.screen.height;

    for (var i = 0; i < config.count; i++) {
        var px = Math.random() * sw;
        var py;
        if (config.type === 'confetti' || config.type === 'leaf') {
            py = -10 - Math.random() * 50;
        } else {
            py = sh * 0.1 + Math.random() * sh * 0.5;
        }
        createParticle(sc.effectsLayer, px, py, config.type, sw, sh);
    }
}

function updateParticles() {
    for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.age++;
        p.gfx.x += p.vx;
        p.gfx.y += p.vy;
        p.gfx.rotation += p.rotSpeed;

        if (p.type === 'leaf') {
            p.gfx.x += Math.sin(p.age * 0.05) * 1.5;
        } else if (p.type === 'virus') {
            p.gfx.x += Math.sin(p.age * 0.02) * 0.5;
        }

        // Fade as aging
        var lifeRatio = 1 - (p.age / p.life);
        p.gfx.alpha = Math.max(0, lifeRatio);

        if (p.age >= p.life) {
            // Reset particle
            p.age = 0;
            p.gfx.alpha = 1;
            p.gfx.x = Math.random() * p.sceneW;
            if (p.type === 'confetti' || p.type === 'leaf') {
                p.gfx.y = -10 - Math.random() * 30;
            } else {
                p.gfx.y = p.sceneH * 0.1 + Math.random() * p.sceneH * 0.5;
            }
        }
    }
}

/* ------------------------------------------
   SPECIAL ANIMATIONS
   ------------------------------------------ */
var fallTimer = 0;
function updateSpecialAnimations() {
    var iimcSceneIdx = SCENES.findIndex(function (s) { return s.id === 'iimc-arrival'; });
    if (iimcSceneIdx !== -1 && currentSceneIndex === iimcSceneIdx) {
        fallTimer++;
        if (fallTimer > 5) {
            fallTimer = 0;
            // Drop a huge pile of books to cover the character
            for (var i = 0; i < 4; i++) {
                var book = new PIXI.Graphics();
                var colors = [0x8b4513, 0x228b22, 0x4682b4, 0xcd5c5c, 0xdaa520, 0x483d8b];
                var bw = 24 + Math.random() * 20;
                var bh = 6 + Math.random() * 8;
                book.beginFill(colors[Math.floor(Math.random() * colors.length)]);
                book.drawRect(-bw / 2, -bh / 2, bw, bh);
                book.endFill();

                // Fall exactly where character is standing
                book.x = charContainer.x + (Math.random() - 0.5) * 80;
                book.y = -50;
                book.rotation = (Math.random() - 0.5);

                console.log("Spawning book at", book.x, book.y, "Target Y:", charContainer.y - (Math.random() * 150), "Scene:", currentSceneIndex);

                // Add to world so they cover character
                world.addChild(book);

                // Stack from floor upwards
                var targetY = charContainer.y - (Math.random() * 150);

                gsap.to(book, {
                    y: targetY,
                    rotation: (Math.random() - 0.5) * 0.4,
                    duration: 0.8 + Math.random() * 0.6,
                    ease: "bounce.out",
                    onComplete: function (b) {
                        // Let them sit and bury the character longer
                        gsap.to(b, {
                            alpha: 0, duration: 2, delay: 10, onComplete: function () {
                                if (b.parent) b.parent.removeChild(b);
                                b.destroy();
                            }
                        });
                    },
                    onCompleteParams: [book]
                });
            }
        }
    }

    var campusIdx = SCENES.findIndex(function (s) { return s.id === 'campus-return'; });
    if (campusIdx !== -1 && SCENES[campusIdx]._bike) {
        var bike = SCENES[campusIdx]._bike;
        if (!SCENES[campusIdx]._bikeStartX) SCENES[campusIdx]._bikeStartX = bike.x;

        bike.y = Math.floor(app.screen.height * 0.55) + 20 + Math.sin(Date.now() / 200) * 2;
        if (currentSceneIndex === campusIdx && isWalking) {
            bike.x += 1;
            if (bike.x > SCENES[campusIdx]._bikeStartX + 100) {
                bike.x = SCENES[campusIdx]._bikeStartX;
            }
        }
    }
}

/* ------------------------------------------
   LORE INTERACTION SYSTEM
   ------------------------------------------ */
var activeLore = null;
var currentLoreText = "";

function showLoreDialogue(text) {
    if (dialogueShown) return;
    dialogueShown = true;

    var dOverlay = document.getElementById('dialogue-overlay');
    var promptEl = document.getElementById('inspect-prompt');
    if (promptEl) promptEl.style.display = 'none';

    dOverlay.style.display = 'flex';
    dOverlay.style.opacity = 0;

    gsap.to(dOverlay, {
        opacity: 1, duration: 0.3, onComplete: function () {
            typeWriter('dialogue-text', text, 30, function () { });
        }
    });
}

function hideLoreDialogue() {
    var dOverlay = document.getElementById('dialogue-overlay');
    if (dOverlay.style.display !== 'none' && dialogueShown) {
        gsap.to(dOverlay, {
            opacity: 0, duration: 0.3, onComplete: function () {
                dOverlay.style.display = 'none';
                document.getElementById('dialogue-text').innerHTML = '';
                dialogueShown = false;
            }
        });
    }
}

function checkLoreInteractions() {
    var charX = camera.x + app.screen.width / 2;
    var activeItem = null;

    for (var i = 0; i < LORE_ITEMS.length; i++) {
        var item = LORE_ITEMS[i];
        var sceneIdx = SCENES.findIndex(function (s) { return s.id === item.sceneId; });
        if (sceneIdx === -1) continue;

        var itemX = sceneIdx * SCENE_WIDTH + SCENE_WIDTH / 2 + item.xOffset;
        var dist = Math.abs(charX - itemX);

        if (dist < 150) { // Automatically trigger if close
            activeItem = item;
            break;
        }
    }

    if (activeItem) {
        if (!dialogueShown || currentLoreText !== activeItem.text) {
            currentLoreText = activeItem.text;
            dialogueShown = false; // Reset to force reshowing new text
            showLoreDialogue(activeItem.text);
        }
    } else {
        hideLoreDialogue();
        currentLoreText = "";
    }
}

/* ------------------------------------------
   CHARACTER
   ------------------------------------------ */
function createCharacter() {
    charContainer = new PIXI.Container();

    // Use character textures from art.js if available
    var hasTextures = charTextures && charTextures.base && charTextures.base.idle;

    if (hasTextures) {
        charSprite = new PIXI.AnimatedSprite(charTextures.base.idle);
        charSprite.animationSpeed = 0.1;
        charSprite.play();
    } else {
        // Fallback: draw a simple pixel character
        charSprite = new PIXI.Container();

        var body = new PIXI.Graphics();
        // feet
        body.beginFill(0x4a3520, 1);
        body.drawRect(-6, 30, 5, 6);
        body.drawRect(1, 30, 5, 6);
        body.endFill();
        // legs
        body.beginFill(0x2a4a7a, 1);
        body.drawRect(-6, 18, 12, 14);
        body.endFill();
        // torso
        body.beginFill(0x4488cc, 1);
        body.drawRect(-7, 2, 14, 18);
        body.endFill();
        // arms
        body.beginFill(0x4488cc, 1);
        body.drawRect(-11, 4, 4, 12);
        body.drawRect(7, 4, 4, 12);
        body.endFill();
        // hands
        body.beginFill(0xffccaa, 1);
        body.drawRect(-11, 16, 4, 3);
        body.drawRect(7, 16, 4, 3);
        body.endFill();
        // head
        body.beginFill(0xffccaa, 1);
        body.drawRect(-6, -12, 12, 14);
        body.endFill();
        // hair
        body.beginFill(0x1a1a2a, 1);
        body.drawRect(-7, -14, 14, 6);
        body.endFill();
        // eyes
        body.beginFill(0x1a1a2a, 1);
        body.drawRect(-4, -6, 3, 3);
        body.drawRect(1, -6, 3, 3);
        body.endFill();

        charSprite.addChild(body);
    }

    charSprite.anchor && charSprite.anchor.set(0.5, 1);
    charContainer.addChild(charSprite);
    charContainer.scale.set(4);

    return charContainer;
}

function updateCharacterTier(tier) {
    if (tier === currentTier) return;
    currentTier = tier;

    var hasTextures = charTextures && charTextures[tier] && charTextures[tier].idle;
    if (!hasTextures) {
        // Update fallback character colors based on tier
        updateFallbackCharacterColors(tier);
        return;
    }

    var oldSprite = charSprite;
    if (isWalking && charTextures[tier] && charTextures[tier].walk) {
        charSprite = new PIXI.AnimatedSprite(charTextures[tier].walk);
    } else {
        charSprite = new PIXI.AnimatedSprite(charTextures[tier].idle);
    }
    charSprite.animationSpeed = 0.1;
    charSprite.anchor.set(0.5, 1);
    charSprite.play();

    charContainer.removeChild(oldSprite);
    if (oldSprite.destroy) oldSprite.destroy();
    charContainer.addChild(charSprite);
}

function updateFallbackCharacterColors(tier) {
    var torsoColors = {
        'base': 0x4488cc, 'freshman': 0x44aa66, 'mid': 0x7744aa,
        'formal': 0x2a2a4a, 'graduate': 0xaa8844, 'senior': 0x884444, 'final': 0x2244aa
    };
    // For fallback, we just keep the sprite as-is — the color is baked in
    // A full implementation would rebuild the graphics, but the art.js textures handle this
}

function setCharacterWalking(walking) {
    if (walking === isWalking) return;
    isWalking = walking;

    var hasTextures = charTextures && charTextures[currentTier] && charTextures[currentTier].walk;
    if (!hasTextures) {
        // Bob the fallback character
        if (walking) {
            gsap.to(charContainer, { y: charContainer.y - 2, duration: 0.15, yoyo: true, repeat: -1, ease: 'steps(2)' });
        } else {
            gsap.killTweensOf(charContainer);
        }
        return;
    }

    var texArr;
    if (walking && charTextures[currentTier].walk) {
        texArr = charTextures[currentTier].walk;
    } else if (charTextures[currentTier].idle) {
        texArr = charTextures[currentTier].idle;
    } else {
        return;
    }

    var oldSprite = charSprite;
    charSprite = new PIXI.AnimatedSprite(texArr);
    charSprite.animationSpeed = walking ? 0.15 : 0.1;
    charSprite.anchor.set(0.5, 1);
    charSprite.play();

    charContainer.removeChild(oldSprite);
    if (oldSprite.destroy) oldSprite.destroy();
    charContainer.addChild(charSprite);
}

/* ------------------------------------------
   SCROLL-DRIVEN PROGRESS
   ------------------------------------------ */
var lastSceneIndex = -1;
var dialogueShown = false;

function updateGameProgress(progress) {
    progress = clamp(progress, 0, 1);

    var totalScenes = SCENES.length;
    var rawIndex = progress * totalScenes;
    var sceneIndex = Math.floor(rawIndex);
    sceneIndex = clamp(sceneIndex, 0, totalScenes - 1);
    var sceneProgress = rawIndex - sceneIndex;
    sceneProgress = clamp(sceneProgress, 0, 1);

    currentSceneIndex = sceneIndex;

    // Camera: move through scenes
    var idlePhaseEnd = 0.5; // 50% of the scene's scroll is spent idling at the start (generous delay)

    var targetCameraX;
    var currentSceneCenterX = sceneIndex * SCENE_WIDTH + SCENE_WIDTH * 0.5;
    var nextSceneCenterX = Math.min((sceneIndex + 1) * SCENE_WIDTH + SCENE_WIDTH * 0.5, (totalScenes - 1) * SCENE_WIDTH + SCENE_WIDTH * 0.5);

    if (sceneProgress < idlePhaseEnd || sceneIndex === totalScenes - 1) {
        // Idle at current scene center
        targetCameraX = currentSceneCenterX;
        setCharacterWalking(false);
    } else {
        var moveProgress = (sceneProgress - idlePhaseEnd) / (1.0 - idlePhaseEnd);
        targetCameraX = currentSceneCenterX + moveProgress * (nextSceneCenterX - currentSceneCenterX);
        setCharacterWalking(true);
    }

    // Prop Animations
    var activeSceneData = SCENES[sceneIndex];
    if (activeSceneData) {
        if (activeSceneData.id === 'iimc-arrival' && activeSceneData._bookPile) {
            // Animate books falling in IIMC (drop from sky to desk during first 25% of scene)
            var fallProg = clamp(sceneProgress * 4, 0, 1);
            // Add a little basic bounce math:
            var bounceProg = fallProg < 1 ? fallProg : 1 - Math.sin((sceneProgress - 0.25) * Math.PI * 4) * 0.1 * Math.exp(-(sceneProgress - 0.25) * 10);

            var startY = -400;
            activeSceneData._bookPile.y = startY + (activeSceneData._deskY - startY) * bounceProg;
        }
    }

    // Center camera so character is at viewport center
    camera.x = targetCameraX - app.screen.width / 2;

    // Clamp camera
    var maxCameraX = (totalScenes * SCENE_WIDTH) - app.screen.width;
    camera.x = clamp(camera.x, 0, maxCameraX);

    updateCamera();

    // Position character in the world
    var charWorldX = targetCameraX;
    var charWorldY = Math.floor(app.screen.height * 0.55) + 30;
    charContainer.x = charWorldX;
    charContainer.y = charWorldY;

    // Character facing direction: always face right (journey moves right)
    charContainer.scale.set(4, 4);

    // Update Tier
    updateCharacterTier(SCENES[sceneIndex].tier);

    // Update Audio: walking if isWalking, sitting if not walking and in a work/study scene
    updateGameAudio(isWalking, !isWalking && sceneIndex > 0);

    // Update HUD
    updateHUD(sceneIndex, sceneProgress);

    // Scene transition events
    if (sceneIndex !== lastSceneIndex) {
        onSceneEnter(sceneIndex);
        lastSceneIndex = sceneIndex;
    }

    // Flicker effect for panic scene
    for (var fi = 0; fi < flickerOverlays.length; fi++) {
        var fo = flickerOverlays[fi];
        if (fo.sceneIndex === sceneIndex) {
            fo.graphics.visible = Math.random() > 0.92;
        } else {
            fo.graphics.visible = false;
        }
    }
}

function onSceneEnter(index) {
    var scene = SCENES[index];

    // Show scene label (small floating text)
    if (scene.label) {
        showSceneLabel(scene.label);
    }

    // Modal logic for actual phases (skip intro)
    if (index > 0 && scene.id !== 'intro') {
        var infoBox = document.getElementById('phase-info-box');
        var title = document.getElementById('info-title');
        var desc = document.getElementById('info-desc');
        var role = document.getElementById('info-role');
        var xp = document.getElementById('info-xp');

        if (infoBox && title && desc && role && xp) {
            // Find the lore item for this scene to use as description
            var loreObj = LORE_ITEMS.find(function (l) { return l.sceneId === scene.id; });
            var descText = loreObj ? loreObj.text : scene.quest;

            title.innerText = scene.label || scene.id.toUpperCase().replace('-', ' ');
            role.innerText = scene.cls;
            xp.innerText = '+' + scene.xp + ' XP';

            infoBox.classList.add('active');

            // Clear prior text and stop any ongoing typing
            desc.innerHTML = '';
            gsap.killTweensOf(desc);

            // Re-type the text for the new phase
            typeWriter('info-desc', descText, 25);
        }
    }

    // Dialogue for intro scene
    if (index === 0 && !dialogueShown) {
        dialogueShown = true;
        var dOverlay = document.getElementById('dialogue-overlay');
        dOverlay.style.display = 'block';
        dOverlay.style.opacity = 1; // Explicitly set to 1 here since it's the intro
        document.getElementById('dialogue-text').style.color = '#ffffff'; // Ensure it's bright
        typeWriter('dialogue-text', "Hi, I'm Ranabir. Scroll down to begin.", 50, function () {
            setTimeout(function () {
                gsap.to(dOverlay, {
                    opacity: 0, duration: 0.5, onComplete: function () {
                        dOverlay.style.display = 'none';
                        dOverlay.style.opacity = 1;
                        dialogueShown = false;
                        document.getElementById('dialogue-text').style.color = 'var(--pixel-text)'; // reset
                    }
                });
            }, 3000); // Give user more time to read it
        });
    }

    // Spawn particles fresh for this scene (throttled — only once)
    if (!scene._particlesSpawned) {
        scene._particlesSpawned = true;
        spawnSceneParticles(index);
    }
}

function updateCamera() {
    world.x = -camera.x;

    // Apply parallax scrolling to background layers
    for (var i = 0; i < sceneContainers.length; i++) {
        var sc = sceneContainers[i];
        if (sc.parallaxLayer) {
            // Move parallax layer slower than the camera
            // 0.4 means it moves 40% with the camera, appearing further away
            sc.parallaxLayer.x = (camera.x - sc.container.x) * 0.4;
        }
    }
}

/* ------------------------------------------
   RESIZE HANDLER
   ------------------------------------------ */
function onResize() {
    if (!app) return;
    SCENE_WIDTH = app.screen.width;

    // Reposition scene containers
    for (var i = 0; i < sceneContainers.length; i++) {
        sceneContainers[i].container.x = i * SCENE_WIDTH;
    }

    // Update vignette
    if (vignetteSprite && vignetteSprite.parent) {
        vignetteSprite.parent.removeChild(vignetteSprite);
    }
    vignetteSprite = createVignette(app.screen.width, app.screen.height);
    app.stage.addChild(vignetteSprite);
}

/* ------------------------------------------
   INIT GAME (called after boot)
   ------------------------------------------ */
function initGame() {
    // Create PixiJS Application
    var canvasContainer = document.getElementById('game-canvas');

    app = new PIXI.Application({
        resizeTo: canvasContainer,
        backgroundColor: 0x0a0a1e,
        antialias: false,
        roundPixels: true
    });
    canvasContainer.appendChild(app.view);

    SCENE_WIDTH = app.screen.width;

    // Load textures from art.js
    if (GAME.generateCharacterTextures) {
        try { charTextures = GAME.generateCharacterTextures(app.renderer); } catch (e) { charTextures = {}; }
    }
    if (GAME.generateTileTextures) {
        try { tileTextures = GAME.generateTileTextures(); } catch (e) { tileTextures = {}; }
    }
    if (GAME.generatePropTextures) {
        try { propTextures = GAME.generatePropTextures(); } catch (e) { propTextures = {}; }
    }

    // Create world container
    world = new PIXI.Container();
    app.stage.addChild(world);

    camera = { x: 0 };

    // Build all 12 scenes
    for (var i = 0; i < SCENES.length; i++) {
        var sc = buildScene(i);
        world.addChild(sc);
    }

    // Create character and add to world (on top of everything)
    var character = createCharacter();
    world.addChild(character);

    // Position character initially
    charContainer.x = SCENE_WIDTH / 2;
    charContainer.y = Math.floor(app.screen.height * 0.55) + 30;

    // Vignette overlay (on stage, above world, but we need text to be EVEN higher)
    vignetteSprite = createVignette(app.screen.width, app.screen.height);
    app.stage.addChild(vignetteSprite);

    // The dialogue overlay in HTML is naturally above the canvas, which is perfect.

    // Show HUD
    document.getElementById('game-hud').style.display = 'block';

    // Inventory setup
    var invBtn = document.getElementById('inventory-btn');
    var invModal = document.getElementById('inventory-modal');
    var closeInv = document.getElementById('close-inventory');
    if (invBtn && invModal && closeInv) {
        invBtn.addEventListener('click', function () {
            renderInventoryGrid();
            invModal.classList.remove('hidden');
        });
        closeInv.addEventListener('click', function () {
            invModal.classList.add('hidden');
        });
        // Click outside to close
        invModal.addEventListener('click', function (e) {
            if (e.target === invModal) {
                invModal.classList.add('hidden');
            }
        });
    }

    // Spawn initial particles for intro scene
    SCENES[0]._particlesSpawned = true;
    spawnSceneParticles(0);

    // Ticker: update particles + animations
    app.ticker.add(function () {
        updateParticles();
        // checkLoreInteractions(); // Removed legacy proximity triggers
        updateSpecialAnimations();
    });

    // Init Sounds
    initSounds();

    // GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
        trigger: '#scroll-spacer',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        onUpdate: function (self) {
            updateGameProgress(self.progress);
        },
        onLeave: function () {
            var infoBox = document.getElementById('phase-info-box');
            if (infoBox) gsap.to(infoBox, { opacity: 0, duration: 0.2, onComplete: () => infoBox.style.display = 'none' });
        },
        onEnterBack: function () {
            var infoBox = document.getElementById('phase-info-box');
            if (infoBox) {
                infoBox.style.display = 'block';
                gsap.to(infoBox, { opacity: 1, duration: 0.2 });
            }
        }
    });

    // Initial state
    updateGameProgress(0);
    lastSceneIndex = 0;
    onSceneEnter(0);

    // Apply CRT Filter
    applyRetroShaders();

    // Resize handler
    window.addEventListener('resize', onResize);
}

/* ------------------------------------------
   RETRO SHADERS
   ------------------------------------------ */
function applyRetroShaders() {
    // Custom CRT Distortion & Chromatic Aberration Shader
    var vertexSrc = `
        attribute vec2 aVertexPosition;
        attribute vec2 aTextureCoord;
        uniform mat3 projectionMatrix;
        varying vec2 vTextureCoord;
        void main(void) {
            gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
            vTextureCoord = aTextureCoord;
        }
    `;

    var fragmentSrc = `
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform vec2 uResolution;

        vec2 curve(vec2 uv) {
            uv = (uv - 0.5) * 2.0;
            uv *= 1.1; // scale down
            uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
            uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
            uv = (uv / 2.0) + 0.5;
            uv = uv * 0.92 + 0.05;
            return uv;
        }

        void main(void) {
            vec2 uv = curve(vTextureCoord);
            
            // RGB Split
            float amount = 0.0015;
            vec4 col;
            col.r = texture2D(uSampler, vec2(uv.x + amount, uv.y)).r;
            col.g = texture2D(uSampler, uv).g;
            col.b = texture2D(uSampler, vec2(uv.x - amount, uv.y)).b;
            col.a = texture2D(uSampler, uv).a;

            // Simple vignette
            float vig = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
            vig = pow(vig * 15.0, 0.25);
            col.rgb *= vig;

            // Clamp edges to black
            if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                col = vec4(0.0, 0.0, 0.0, 1.0);
            }

            gl_FragColor = col;
        }
    `;

    var crtFilter = new PIXI.Filter(vertexSrc, fragmentSrc, {
        uResolution: [app.screen.width, app.screen.height]
    });

    app.stage.filters = [crtFilter];
}

/* ------------------------------------------
   BOOT SEQUENCE
   ------------------------------------------ */
function bootSequence() {
    var lines = document.querySelectorAll('#terminal-lines p');
    var fill = document.getElementById('loading-fill');
    var prompt = document.getElementById('start-prompt');

    // Hide terminal lines initially
    for (var i = 0; i < lines.length; i++) {
        lines[i].style.opacity = '0';
    }

    var tl = gsap.timeline();

    // Animate terminal lines appearing one by one
    for (var j = 0; j < lines.length; j++) {
        tl.to(lines[j], { opacity: 1, duration: 0.1, delay: 0.3 });
    }

    // Fill loading bar
    tl.to(fill, { width: '100%', duration: 1.5, ease: 'steps(10)' });

    // Show start prompt
    tl.call(function () {
        prompt.style.display = 'block';

        function startGame() {
            window.removeEventListener('wheel', startGame);
            window.removeEventListener('click', startGame);
            window.removeEventListener('touchstart', startGame);

            gsap.to('#boot-screen', {
                yPercent: -100,
                duration: 0.8,
                ease: 'power4.inOut',
                onComplete: function () {
                    document.getElementById('boot-screen').style.display = 'none';
                    window.scrollTo(0, 0);
                    initGame();
                }
            });
        }

        window.addEventListener('wheel', startGame);
        window.addEventListener('click', startGame);
        window.addEventListener('touchstart', startGame);
    });
}

/* ------------------------------------------
   ENTRY POINT
   ------------------------------------------ */
window.addEventListener('load', function () {
    bootSequence();
});
