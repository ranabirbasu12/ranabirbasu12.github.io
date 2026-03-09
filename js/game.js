/*  =============================================
    game.js — PixiJS v7 RPG Portfolio Engine
    Scroll-driven horizontal side-scroller
    ============================================= */

var GAME = window.GAME || {};

/* ------------------------------------------
   SCENE DATA
   ------------------------------------------ */
var SCENES = [
    { id:'intro',          lvl:'??', cls:'???',       quest:'Begin the journey.',                         hp:100, xp:0,   tier:'base',      label:'' },
    { id:'iitkgp-arrival', lvl:19,   cls:'Student',   quest:'Survive first year at IIT Kharagpur.',       hp:90,  xp:8,   tier:'freshman',  label:'IIT KHARAGPUR // 2019' },
    { id:'panic',          lvl:21,   cls:'Student',   quest:'Find something for the CV.',                 hp:20,  xp:15,  tier:'freshman',  label:'THE PANIC // 2021' },
    { id:'iimb-research',  lvl:22,   cls:'Researcher',quest:'Build web crawlers. Get published.',         hp:60,  xp:30,  tier:'mid',       label:'IIM-B RESEARCH // 2022' },
    { id:'snapdeal',       lvl:22,   cls:'Intern',    quest:'A/B tests, ONDC scaling, startup chaos.',    hp:75,  xp:40,  tier:'mid',       label:'SNAPDEAL // SUMMER 2022' },
    { id:'venwiz',         lvl:22,   cls:'Intern',    quest:'Strategy and flowcharts. Earning composure.',hp:80,  xp:50,  tier:'mid',       label:'VENWIZ // DEC 2022' },
    { id:'dc-advisory',    lvl:23,   cls:'Analyst',   quest:'Sector scans and live deals.',               hp:55,  xp:60,  tier:'formal',    label:'DC ADVISORY // SUMMER 2023' },
    { id:'iitkgp-grad',    lvl:24,   cls:'Graduate',  quest:'Collect all trophies. Throw cap.',           hp:100, xp:70,  tier:'graduate',  label:'GRADUATION // 2024' },
    { id:'iimc',           lvl:24,   cls:'President', quest:'Lead Finance Club. Win CFA IRC.',            hp:95,  xp:80,  tier:'senior',    label:'IIM CALCUTTA // 2024' },
    { id:'ascertis-intern',lvl:25,   cls:'Intern',    quest:'Structure credit deals. Earn PPO.',          hp:85,  xp:88,  tier:'senior',    label:'ASCERTIS // 2025' },
    { id:'iimc-grad',      lvl:26,   cls:'Graduate',  quest:'MBA complete. Degree in hand.',              hp:100, xp:95,  tier:'final',     label:'MBA GRADUATION // 2026' },
    { id:'ascertis-ft',    lvl:26,   cls:'Associate', quest:'Structuring private credit deals.',          hp:100, xp:100, tier:'final',     label:'ASCERTIS // CURRENT QUEST' }
];

var SCENE_PALETTES = {
    'intro':          { bg1:0x0c0c28, bg2:0x1a1a4a, ambient:0x6666ff, floor:'concrete' },
    'iitkgp-arrival': { bg1:0x2a1540, bg2:0x6a3080, ambient:0xffaa66, floor:'grass' },
    'panic':          { bg1:0x14141e, bg2:0x1e1e2e, ambient:0xff5555, floor:'wood-floor' },
    'iimb-research':  { bg1:0x0e2a0e, bg2:0x1a4a2a, ambient:0x66ff66, floor:'tile-white' },
    'snapdeal':       { bg1:0x3a2a14, bg2:0x5a4020, ambient:0xffcc66, floor:'carpet-red' },
    'venwiz':         { bg1:0x142a3a, bg2:0x2a4a5a, ambient:0x66ccff, floor:'tile-white' },
    'dc-advisory':    { bg1:0x141420, bg2:0x2a2030, ambient:0xffdd66, floor:'wood-floor-dark' },
    'iitkgp-grad':    { bg1:0x2a2a5a, bg2:0x3a3a7a, ambient:0xffee66, floor:'grass' },
    'iimc':           { bg1:0x2a1414, bg2:0x4a2a2a, ambient:0xff8866, floor:'wood-floor' },
    'ascertis-intern':{ bg1:0x141430, bg2:0x2a2a50, ambient:0x66aaff, floor:'tile-dark' },
    'iimc-grad':      { bg1:0x2a2a5a, bg2:0x3a3a7a, ambient:0xffee66, floor:'grass' },
    'ascertis-ft':    { bg1:0x142030, bg2:0x203040, ambient:0x66aaff, floor:'tile-dark' }
};

var SCENE_PARTICLES_CONFIG = {
    'intro':          { type:'star',     count:20 },
    'iitkgp-arrival': { type:'dust',     count:12 },
    'panic':          { type:'dust',     count:18 },
    'iimb-research':  { type:'code',     count:10 },
    'snapdeal':       { type:'code',     count:8 },
    'venwiz':         { type:'dust',     count:8 },
    'dc-advisory':    { type:'dust',     count:10 },
    'iitkgp-grad':    { type:'confetti', count:30 },
    'iimc':           { type:'dust',     count:10 },
    'ascertis-intern':{ type:'rupee',    count:10 },
    'iimc-grad':      { type:'confetti', count:30 },
    'ascertis-ft':    { type:'rupee',    count:14 }
};

/* ------------------------------------------
   GLOBALS
   ------------------------------------------ */
var app, world, camera, SCENE_WIDTH, charContainer, charSprite;
var currentSceneIndex = -1;
var currentTier = '';
var isWalking = false;
var particles = [];
var charTextures = {};
var tileTextures = {};
var propTextures = {};
var sceneContainers = [];
var flickerOverlays = [];
var vignetteSprite;

/* ------------------------------------------
   HELPERS
   ------------------------------------------ */
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
function typeWriter(elementId, text, speed, callback) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = '';
    var i = 0;
    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed || 50);
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
        { opacity: 1, duration: 0.5, yoyo: true, repeat: 1, repeatDelay: 1.5,
          onComplete: function() { sceneLabelActive = false; }
        }
    );
}

/* ------------------------------------------
   HUD UPDATE
   ------------------------------------------ */
function updateHUD(sceneIndex, sceneProgress) {
    var scene = SCENES[sceneIndex];
    var nextScene = SCENES[Math.min(sceneIndex + 1, SCENES.length - 1)];
    document.getElementById('hud-level').textContent = scene.lvl;
    document.getElementById('hud-class').textContent = scene.cls;
    document.getElementById('hud-quest').textContent = 'QUEST: ' + scene.quest;

    var xp = scene.xp + (nextScene.xp - scene.xp) * sceneProgress;
    var hp = scene.hp + (nextScene.hp - scene.hp) * sceneProgress;

    document.getElementById('hud-xp').style.width = xp + '%';
    var hpFill = document.getElementById('hud-hp');
    hpFill.style.width = hp + '%';
    hpFill.style.background = hp < 30 ? '#ef4444' : hp < 60 ? '#facc15' : '#22c55e';
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
    // desk surface
    drawRect(container, x - 60, y - 14, 120, 14, 0x4a3220, 1);
    drawRect(container, x - 58, y - 12, 116, 3, 0x6a5030, 1);
    // monitor body
    drawRect(container, x - 44, y - 82, 88, 60, 0x222233, 1);
    // screen bezel
    drawRect(container, x - 40, y - 78, 80, 52, screenColor || 0x0a1a0a, 1);
    // screen glow
    drawRect(container, x - 38, y - 76, 76, 48, screenColor || 0x0a1a0a, 0.8);
    // lines on screen
    var lc = lineCount || 4;
    for (var i = 0; i < lc; i++) {
        var lw = 30 + Math.random() * 35;
        drawRect(container, x - 32, y - 72 + i * 10, lw, 4, lineColor || 0x44ff44, 0.9);
    }
    // stand
    drawRect(container, x - 6, y - 22, 12, 10, 0x555566, 1);
    // stand base
    drawRect(container, x - 14, y - 14, 28, 4, 0x555566, 1);
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
    // desk top
    drawRect(container, x - w / 2, y - 12, w, 12, 0x6a4a2a, 1);
    drawRect(container, x - w / 2 + 2, y - 10, w - 4, 3, 0x8a6a3a, 1);
    // legs
    drawRect(container, x - w / 2 + 8, y, 8, 30, 0x4a2a10, 1);
    drawRect(container, x + w / 2 - 16, y, 8, 30, 0x4a2a10, 1);
}

function drawCoffeeCup(container, x, y) {
    var g = new PIXI.Graphics();
    g.beginFill(0xeeeeee, 1);
    g.drawRect(x - 7, y - 14, 14, 14);
    g.endFill();
    g.beginFill(0x6a3a1a, 1);
    g.drawRect(x - 5, y - 12, 10, 8);
    g.endFill();
    // steam
    g.beginFill(0xcccccc, 0.3);
    g.drawRect(x - 2, y - 20, 2, 5);
    g.drawRect(x + 2, y - 22, 2, 6);
    g.endFill();
    // handle
    g.lineStyle(3, 0xeeeeee, 1);
    g.arc(x + 9, y - 7, 5, -1.2, 1.2, false);
    container.addChild(g);
    return g;
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
    var g = new PIXI.Graphics();
    g.beginFill(color || 0xfacc15, 1);
    // cup body
    g.drawRect(x - 10, y - 28, 20, 16);
    // cup rim
    g.drawRect(x - 12, y - 30, 24, 4);
    // handles
    g.drawRect(x - 15, y - 26, 5, 10);
    g.drawRect(x + 10, y - 26, 5, 10);
    // stem
    g.drawRect(x - 3, y - 12, 6, 8);
    // base
    g.drawRect(x - 10, y - 4, 20, 5);
    g.endFill();
    // shine
    g.beginFill(0xffffff, 0.3);
    g.drawRect(x - 6, y - 26, 4, 10);
    g.endFill();
    container.addChild(g);
    return g;
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
    drawRect(container, x - 18, y - 8, 36, 8, 0xd4a037, 1);
    drawRect(container, x - 16, y - 6, 32, 4, 0xe8c060, 1);
    // grease stain
    drawRect(container, x - 5, y - 5, 10, 2, 0xc49030, 0.5);
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
    var floorLayer = new PIXI.Container();
    var propsBackLayer = new PIXI.Container();
    var characterLayer = new PIXI.Container();
    var propsFrontLayer = new PIXI.Container();
    var effectsLayer = new PIXI.Container();

    container.addChild(backgroundLayer);
    container.addChild(floorLayer);
    container.addChild(propsBackLayer);
    container.addChild(characterLayer);
    container.addChild(propsFrontLayer);
    container.addChild(effectsLayer);

    // Background gradient — extend to full height
    var bg = createGradientGraphics(sw, sh, palette.bg1, palette.bg2);
    backgroundLayer.addChild(bg);

    // Ambient color wash for scene mood
    var ambientWash = new PIXI.Graphics();
    ambientWash.beginFill(palette.ambient, 0.06);
    ambientWash.drawRect(0, 0, sw, sh);
    ambientWash.endFill();
    backgroundLayer.addChild(ambientWash);

    // Subtle blur on far background for HD-2D depth
    backgroundLayer.filters = [new PIXI.BlurFilter(1.5)];

    // Floor
    var floor = createFloorLayer(sw, sh, palette.floor);
    floorLayer.addChild(floor);

    // Spotlight — behind the floor so glow doesn't cover the ground
    var spot = createSpotlight(sw, sh, palette.ambient, sw / 2, charY - 40);
    backgroundLayer.addChild(spot);

    // Scene-specific props
    var cx = sw / 2; // center x

    switch (sceneData.id) {

        case 'intro':
            // Dark void with floating text hint
            drawText(effectsLayer, "Hi, I'm Ranabir.", cx, sh * 0.35, 14, 0xaaaaff);
            drawText(effectsLayer, "Scroll to begin.", cx, sh * 0.42, 9, 0x666688);
            break;

        case 'iitkgp-arrival':
            drawTree(propsBackLayer, cx - sw * 0.3, floorTop);
            drawTree(propsBackLayer, cx - sw * 0.2, floorTop);
            drawTree(propsBackLayer, cx + sw * 0.25, floorTop);
            drawTree(propsBackLayer, cx + sw * 0.35, floorTop);
            // Campus gate arch — large and prominent
            drawRect(propsBackLayer, cx - 80, floorTop - 120, 16, 120, 0x7a5a3a, 1);
            drawRect(propsBackLayer, cx + 64, floorTop - 120, 16, 120, 0x7a5a3a, 1);
            drawRect(propsBackLayer, cx - 80, floorTop - 135, 160, 20, 0x9a7a5a, 1);
            drawRect(propsBackLayer, cx - 76, floorTop - 132, 152, 3, 0xaa8a6a, 1);
            drawText(propsBackLayer, 'IIT KHARAGPUR', cx, floorTop - 124, 9, 0xffffff);
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

        case 'panic':
            drawBed(propsBackLayer, cx - sw * 0.2, floorTop + 20);
            drawDesk(propsBackLayer, cx + sw * 0.15, floorTop);
            drawMonitor(propsBackLayer, cx + sw * 0.15, floorTop, 0x0a0a14, 0xff4444, 2);
            // flickering tube light
            var tubeLight = new PIXI.Graphics();
            tubeLight.beginFill(0xffffee, 0.6);
            tubeLight.drawRect(cx - 30, floorTop - 170, 60, 4);
            tubeLight.endFill();
            tubeLight.beginFill(0xffffee, 0.1);
            tubeLight.drawRect(cx - 50, floorTop - 170, 100, 120);
            tubeLight.endFill();
            effectsLayer.addChild(tubeLight);
            // scattered clothes
            drawRect(propsFrontLayer, cx - 80, floorTop + 30, 24, 8, 0x4444aa, 0.7);
            drawRect(propsFrontLayer, cx + 100, floorTop + 40, 20, 7, 0xaa4444, 0.7);
            drawRect(propsFrontLayer, cx + 40, floorTop + 45, 18, 7, 0x44aa44, 0.7);
            // flicker overlay for this scene
            var flickerG = drawRect(effectsLayer, 0, 0, sw, sh, 0x000000, 0.15);
            flickerG.visible = false;
            flickerOverlays.push({ graphics: flickerG, sceneIndex: index });
            break;

        case 'iimb-research':
            drawDesk(propsBackLayer, cx + sw * 0.15, floorTop, 120);
            drawMonitor(propsBackLayer, cx + sw * 0.15, floorTop, 0x0a1a0a, 0x44ff44, 6);
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
            drawDesk(propsBackLayer, cx - 40, floorTop, 90);
            drawMonitor(propsBackLayer, cx - 60, floorTop, 0x1a1a2a, 0xffaa44, 3);
            drawMonitor(propsBackLayer, cx - 20, floorTop, 0x1a1a2a, 0xffaa44, 3);
            drawPizzaBox(propsFrontLayer, cx + 60, floorTop + 30);
            drawBeanBag(propsBackLayer, cx + sw * 0.25, floorTop + 20);
            drawWhiteboard(propsBackLayer, cx + sw * 0.15, floorTop, 5);
            // energy drink
            drawRect(propsFrontLayer, cx + 30, floorTop + 25, 6, 12, 0x22dd44, 1);
            break;

        case 'venwiz':
            drawDesk(propsBackLayer, cx + sw * 0.15, floorTop, 120);
            drawMonitor(propsBackLayer, cx + sw * 0.15, floorTop, 0x0a1a2a, 0x44aaff, 4);
            drawWhiteboard(propsBackLayer, cx - sw * 0.2, floorTop, 4);
            break;

        case 'dc-advisory':
            // Large window with city skyline
            drawCitySkyline(backgroundLayer, cx - sw * 0.35, floorTop - 200, sw * 0.7, 150, 0x0a0a1e);
            // Window frame
            drawRect(propsBackLayer, cx - sw * 0.3, floorTop - 180, sw * 0.6, 4, 0x444466, 1);
            drawRect(propsBackLayer, cx - sw * 0.3, floorTop - 60, sw * 0.6, 4, 0x444466, 1);
            drawRect(propsBackLayer, cx, floorTop - 180, 4, 124, 0x444466, 1);
            drawDesk(propsBackLayer, cx + sw * 0.12, floorTop, 140);
            // Bloomberg terminal
            drawMonitor(propsBackLayer, cx + sw * 0.12, floorTop, 0x0a0a14, 0x44ff44, 5);
            drawCoffeeCup(propsFrontLayer, cx + sw * 0.12 + 55, floorTop - 12);
            drawCoffeeCup(propsFrontLayer, cx + sw * 0.12 - 55, floorTop - 12);
            drawCoffeeCup(propsFrontLayer, cx - sw * 0.15, floorTop - 12);
            break;

        case 'iitkgp-grad':
            drawStage(propsBackLayer, cx, floorTop, 300);
            // trophy shelf — wide and prominent
            drawRect(propsBackLayer, cx + sw * 0.15 - 10, floorTop - 80, 120, 8, 0x7a5a2a, 1);
            drawRect(propsBackLayer, cx + sw * 0.15 - 8, floorTop - 72, 116, 3, 0x9a7a4a, 1);
            drawTrophy(propsBackLayer, cx + sw * 0.15 + 5, floorTop - 82, 0xfacc15);
            drawTrophy(propsBackLayer, cx + sw * 0.15 + 30, floorTop - 82, 0xc0c0c0);
            drawTrophy(propsBackLayer, cx + sw * 0.15 + 55, floorTop - 82, 0xcd7f32);
            drawTrophy(propsBackLayer, cx + sw * 0.15 + 80, floorTop - 82, 0xfacc15);
            // banner
            drawText(effectsLayer, 'CONGRATULATIONS', cx, floorTop - 160, 11, 0xfacc15);
            break;

        case 'iimc':
            drawDesk(propsBackLayer, cx + sw * 0.12, floorTop, 140);
            drawMonitor(propsBackLayer, cx + sw * 0.12, floorTop, 0x1a0a0a, 0xff6644, 4);
            // nameplate
            drawRect(propsBackLayer, cx - 30, floorTop - 6, 60, 10, 0xfacc15, 1);
            drawText(propsBackLayer, 'PRESIDENT', cx, floorTop - 1, 5, 0x1a0a0a);
            // banner — large and visible
            drawRect(effectsLayer, cx - sw * 0.25, floorTop - 160, sw * 0.5, 30, 0x8a1a1a, 0.9);
            drawText(effectsLayer, 'FINANCE & INVESTMENTS CLUB', cx, floorTop - 145, 8, 0xffffff);
            drawBookshelf(propsBackLayer, cx + sw * 0.2, floorTop);
            drawBookshelf(propsBackLayer, cx - sw * 0.25, floorTop);
            break;

        case 'ascertis-intern':
            drawDesk(propsBackLayer, cx + sw * 0.15, floorTop, 120);
            drawMonitor(propsBackLayer, cx + sw * 0.15, floorTop, 0x0a0a1e, 0x4488ff, 5);
            drawCoffeeCup(propsFrontLayer, cx + sw * 0.15 + 50, floorTop - 12);
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

        case 'iimc-grad':
            drawStage(propsBackLayer, cx, floorTop, 280);
            // diploma frame — large
            drawRect(propsBackLayer, cx + sw * 0.18 - 25, floorTop - 90, 50, 65, 0x7a5a2a, 1);
            drawRect(propsBackLayer, cx + sw * 0.18 - 21, floorTop - 86, 42, 57, 0xffffee, 1);
            drawText(propsBackLayer, 'MBA', cx + sw * 0.18, floorTop - 65, 8, 0x333333);
            drawText(propsBackLayer, 'IIM CALCUTTA', cx + sw * 0.18, floorTop - 52, 5, 0x666666);
            // celebration text
            drawText(effectsLayer, 'CLASS OF 2026', cx, floorTop - 160, 11, 0xfacc15);
            break;

        case 'ascertis-ft':
            // Large panoramic window with city skyline
            drawCitySkyline(backgroundLayer, cx - sw * 0.4, floorTop - 220, sw * 0.8, 170, 0x0a1020);
            drawRect(propsBackLayer, cx - sw * 0.35, floorTop - 200, sw * 0.7, 4, 0x444466, 1);
            drawRect(propsBackLayer, cx - sw * 0.35, floorTop - 50, sw * 0.7, 4, 0x444466, 1);
            drawDesk(propsBackLayer, cx, floorTop, 160);
            // dual monitors
            drawMonitor(propsBackLayer, cx - 60, floorTop, 0x0a0a1e, 0x4488ff, 5);
            drawMonitor(propsBackLayer, cx + 60, floorTop, 0x0a0a1e, 0x44ff44, 4);
            drawCoffeeCup(propsFrontLayer, cx + 120, floorTop - 12);
            drawText(effectsLayer, 'CURRENT QUEST', cx, sh * 0.18, 12, 0x4488ff);
            drawText(effectsLayer, 'Structuring private credit deals.', cx, sh * 0.25, 9, 0x88aacc);
            break;
    }

    // No blur on foreground props — keep them crisp and visible

    container.addChild(effectsLayer);

    // Store reference
    sceneContainers.push({
        container: container,
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

    if (type === 'confetti') {
        p.vy = 0.3 + Math.random() * 0.6;
        p.vx = (Math.random() - 0.5) * 0.8;
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
        if (config.type === 'confetti') {
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

        // Fade as aging
        var lifeRatio = 1 - (p.age / p.life);
        p.gfx.alpha = Math.max(0, lifeRatio);

        if (p.age >= p.life) {
            // Reset particle
            p.age = 0;
            p.gfx.alpha = 1;
            p.gfx.x = Math.random() * p.sceneW;
            if (p.type === 'confetti') {
                p.gfx.y = -10 - Math.random() * 30;
            } else {
                p.gfx.y = p.sceneH * 0.1 + Math.random() * p.sceneH * 0.5;
            }
        }
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

    // Camera: move through scenes
    var moveThreshold = 0.7;

    var targetCameraX;
    var sceneCenterX = sceneIndex * SCENE_WIDTH + SCENE_WIDTH * 0.5;
    var prevSceneCenterX = Math.max((sceneIndex - 1) * SCENE_WIDTH + SCENE_WIDTH * 0.5, SCENE_WIDTH * 0.5);

    if (sceneProgress < moveThreshold && sceneIndex > 0) {
        // Moving phase: interpolate from previous scene center to current scene center
        var moveProgress = sceneProgress / moveThreshold;
        targetCameraX = prevSceneCenterX + moveProgress * (sceneCenterX - prevSceneCenterX);
        setCharacterWalking(true);
    } else {
        // Idle at current scene center (or scene 0 start)
        targetCameraX = sceneCenterX;
        setCharacterWalking(false);
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

    // Update tier
    updateCharacterTier(SCENES[sceneIndex].tier);

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

    // Show scene label
    if (scene.label) {
        showSceneLabel(scene.label);
    }

    // Dialogue for intro scene
    if (index === 0 && !dialogueShown) {
        dialogueShown = true;
        var dOverlay = document.getElementById('dialogue-overlay');
        dOverlay.style.display = 'block';
        typeWriter('dialogue-text', "Hi, I'm Ranabir. Welcome to my timeline.", 50, function() {
            setTimeout(function() {
                gsap.to(dOverlay, { opacity: 0, duration: 0.5, onComplete: function() {
                    dOverlay.style.display = 'none';
                    dOverlay.style.opacity = 1;
                }});
            }, 2000);
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

    // Vignette overlay (on stage, above world)
    vignetteSprite = createVignette(app.screen.width, app.screen.height);
    app.stage.addChild(vignetteSprite);

    // Show HUD
    document.getElementById('game-hud').style.display = 'block';

    // Spawn initial particles for intro scene
    SCENES[0]._particlesSpawned = true;
    spawnSceneParticles(0);

    // Ticker: update particles + flicker
    app.ticker.add(function() {
        updateParticles();
    });

    // GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
        trigger: '#scroll-spacer',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        onUpdate: function(self) {
            updateGameProgress(self.progress);
        }
    });

    // Initial state
    updateGameProgress(0);
    lastSceneIndex = 0;
    onSceneEnter(0);

    // Resize handler
    window.addEventListener('resize', onResize);
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
    tl.call(function() {
        prompt.style.display = 'block';

        function startGame() {
            window.removeEventListener('wheel', startGame);
            window.removeEventListener('click', startGame);
            window.removeEventListener('touchstart', startGame);

            gsap.to('#boot-screen', {
                yPercent: -100,
                duration: 0.8,
                ease: 'power4.inOut',
                onComplete: function() {
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
window.addEventListener('load', function() {
    bootSequence();
});
