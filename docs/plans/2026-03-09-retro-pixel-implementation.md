# Retro Pixel Portfolio — HD-2D Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the crude 5-scene retro pixel MVP into a polished HD-2D 12-scene side-scroller portfolio with character evolution, ambient particles, parallax, and a dynamic HUD.

**Architecture:** Single-page vanilla HTML/CSS/JS. GSAP ScrollTrigger pins a horizontal zone and scrubs through 12 scenes. A CSS-only pixel character evolves visually across scenes. HD-2D effects (blur depth-of-field, radial spotlights, particles, CRT scanlines) layer on top. Below the horizontal scroll, a vertical zone shows achievements and contact.

**Tech Stack:** Vanilla HTML/CSS/JS, GSAP 3 + ScrollTrigger, Google Fonts (Press Start 2P + VT323), Lenis smooth scroll.

**Design Doc:** `docs/plans/2026-03-09-retro-pixel-portfolio-design.md`

**Current State:** 5 scenes (Intro, Ascertis, DC Advisory, Venwiz/Snapdeal, Origins) running right-to-left (present to past). Basic character with 3 states (waving, walking, sitting) and 1 costume variant (intern). Static HUD per scene. No HD-2D effects.

**Target State:** 12 scenes running left-to-right (past to present). Character with 6 evolution tiers and 8+ animation states. Dynamic HUD. HD-2D visual layer. Particles. Collectibles. Enhanced boot screen.

---

## Task 1: HTML Scaffold — 12 Scenes

**Files:**
- Modify: `index.html`

**Context:** The current HTML has 5 scenes in reverse chronological order (present to past). We need 12 scenes in chronological order (past to present). The `.scenes-wrapper` width must be `1200vw` (12 scenes x 100vw each).

**Step 1: Rewrite the scenes-wrapper in `index.html`**

Replace the entire `.scenes-wrapper` div (inside `<section class="horizontal-zone" id="timeline">`) with 12 scene divs in chronological order. Keep the player character div above the scenes-wrapper — it stays fixed.

Each scene follows this template:
```html
<div class="scene scene--{id}" id="scene-{id}" data-palette="{palette-name}">
    <!-- Background layer (blurred for HD-2D depth) -->
    <div class="scene-bg"></div>
    <!-- Midground: environment props -->
    <div class="environment"></div>
    <!-- Foreground: sharp props near camera -->
    <div class="scene-fg"></div>
</div>
```

The 12 scenes in order:
1. `scene--intro` data-palette="void"
2. `scene--iitkgp-arrival` data-palette="sunset"
3. `scene--panic` data-palette="dark"
4. `scene--iimb-research` data-palette="hacker"
5. `scene--snapdeal` data-palette="chaos"
6. `scene--venwiz` data-palette="clean"
7. `scene--dc-advisory` data-palette="corporate"
8. `scene--iitkgp-grad` data-palette="celebration"
9. `scene--iimc` data-palette="academic"
10. `scene--ascertis-intern` data-palette="professional"
11. `scene--iimc-grad` data-palette="celebration"
12. `scene--ascertis-ft` data-palette="cool-blue"

**Step 2: Add global HUD overlay**

Move the HUD outside individual scenes. Place it as a sibling to `.scenes-wrapper` inside `.horizontal-zone`:

```html
<div class="hud" id="game-hud">
    <div class="hud-row">
        <span class="hud-label">LVL</span>
        <span class="hud-value" id="hud-level">19</span>
        <span class="hud-label">CLASS</span>
        <span class="hud-value" id="hud-class">Student</span>
    </div>
    <div class="hud-row">
        <div class="xp-bar">
            <div class="xp-fill" id="hud-xp"></div>
        </div>
    </div>
    <div class="hud-row">
        <span class="hud-label">HP</span>
        <div class="hp-bar">
            <div class="hp-fill" id="hud-hp"></div>
        </div>
    </div>
    <div class="hud-quest" id="hud-quest">QUEST: Begin the journey.</div>
</div>
```

**Step 3: Add CRT scanline overlay**

Add a full-page CRT overlay div just inside `<body>`:
```html
<div class="crt-overlay"></div>
```

**Step 4: Add particles container**

Add a particles container inside `.horizontal-zone`:
```html
<div class="particles-layer" id="particles"></div>
```

**Step 5: Update the boot screen terminal lines**

Update the boot-content to include fake terminal output:
```html
<div class="boot-content">
    <h1 class="glitch-text" data-text="RANABIR_OS v1.0">RANABIR_OS v1.0</h1>
    <div class="terminal-lines" id="terminal-lines">
        <p>> Loading quest log...</p>
        <p>> Checking inventory...</p>
        <p>> Mounting timeline...</p>
        <p>> Calibrating pixel density...</p>
        <p>> SYSTEM READY.</p>
    </div>
    <div class="loading-bar">
        <div class="loading-fill"></div>
    </div>
    <p class="start-prompt blink">[ SCROLL ] TO START</p>
</div>
```

**Step 6: Scene 1 (Intro) content**

```html
<div class="scene scene--intro" id="scene-intro" data-palette="void">
    <div class="scene-bg">
        <div class="star-field"></div>
        <div class="spotlight"></div>
    </div>
    <div class="scene-content">
        <div class="dialogue-box">
            <p id="typewriter-text"></p>
            <span class="dialogue-cursor blink">_</span>
        </div>
        <div class="scroll-arrow blink">
            SCROLL RIGHT &rarr;
        </div>
    </div>
</div>
```

**Step 7: Verify and commit**

Open `index.html` in browser. You should see the boot screen, then after scroll, the intro scene with empty scene placeholders scrolling horizontally. The page will look broken (missing CSS/JS updates) — that is expected.

```bash
git add index.html
git commit -m "feat: scaffold 12-scene HTML structure with global HUD, CRT overlay, particles container"
```

---

## Task 2: CSS Foundation — Scene Palettes and HD-2D Base

**Files:**
- Modify: `css/style.css`

**Context:** The CSS needs scene-specific color palettes via custom properties, the CRT scanline overlay, base HD-2D blur/parallax structure, and the updated `.scenes-wrapper` width for 12 scenes.

**Step 1: Update root variables and add scene palettes**

Replace the `:root` block and add palette classes:

```css
:root {
    --bg-color: #0d0e15;
    --text-color: #e0e0e0;
    --pixel-green: #4ade80;
    --pixel-blue: #60a5fa;
    --pixel-yellow: #facc15;
    --pixel-red: #f87171;
    --pixel-orange: #fb923c;
    --pixel-purple: #a78bfa;
    --ui-bg: #1e1e2e;
    --ui-border: #4b5563;

    --font-heading: 'Press Start 2P', cursive;
    --font-body: 'VT323', monospace;

    /* Active scene palette (overridden per scene) */
    --scene-bg: #0d0e15;
    --scene-accent: #4ade80;
    --scene-glow: rgba(74, 222, 128, 0.3);
}
```

**Step 2: Add scene palette data-attribute styles**

```css
[data-palette="void"]     { --scene-bg: #000000; --scene-accent: #ffffff; --scene-glow: rgba(255,255,255,0.15); }
[data-palette="sunset"]   { --scene-bg: #1a0a00; --scene-accent: #f97316; --scene-glow: rgba(249,115,22,0.25); }
[data-palette="dark"]     { --scene-bg: #0a0a0f; --scene-accent: #ef4444; --scene-glow: rgba(239,68,68,0.2); }
[data-palette="hacker"]   { --scene-bg: #001a00; --scene-accent: #4ade80; --scene-glow: rgba(74,222,128,0.3); }
[data-palette="chaos"]    { --scene-bg: #1a1a00; --scene-accent: #facc15; --scene-glow: rgba(250,204,21,0.25); }
[data-palette="clean"]    { --scene-bg: #0a0f1a; --scene-accent: #38bdf8; --scene-glow: rgba(56,189,248,0.2); }
[data-palette="corporate"]{ --scene-bg: #1a0f00; --scene-accent: #d97706; --scene-glow: rgba(217,119,6,0.25); }
[data-palette="celebration"]{ --scene-bg: #0a001a; --scene-accent: #facc15; --scene-glow: rgba(250,204,21,0.3); }
[data-palette="academic"] { --scene-bg: #0f0a1a; --scene-accent: #a78bfa; --scene-glow: rgba(167,139,250,0.2); }
[data-palette="professional"]{ --scene-bg: #0a0f14; --scene-accent: #60a5fa; --scene-glow: rgba(96,165,250,0.2); }
[data-palette="cool-blue"]{ --scene-bg: #000a1a; --scene-accent: #3b82f6; --scene-glow: rgba(59,130,246,0.3); }
```

**Step 3: Update scenes-wrapper width**

```css
.scenes-wrapper {
    display: flex;
    width: 1200vw; /* 12 scenes x 100vw */
    height: 100%;
    position: relative;
    z-index: 20;
}
```

**Step 4: Add CRT scanline overlay CSS**

```css
.crt-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.08) 0px,
        rgba(0, 0, 0, 0.08) 1px,
        transparent 1px,
        transparent 3px
    );
    mix-blend-mode: multiply;
}
```

**Step 5: Add scene background layer (blurred for depth)**

```css
.scene-bg {
    position: absolute;
    inset: 0;
    z-index: 1;
    filter: blur(1.5px);
    opacity: 0.7;
}

.scene-fg {
    position: absolute;
    inset: 0;
    z-index: 30;
    pointer-events: none;
}

.environment {
    position: absolute;
    bottom: 25vh;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
}
```

**Step 6: Add spotlight base**

```css
.spotlight {
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--scene-glow) 0%, transparent 70%);
    left: 50%;
    bottom: 20vh;
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 5;
}
```

**Step 7: Add star field for intro scene**

```css
.star-field {
    position: absolute;
    inset: 0;
    background: radial-gradient(1px 1px at 10% 20%, #fff 50%, transparent 100%),
                radial-gradient(1px 1px at 30% 60%, #fff 50%, transparent 100%),
                radial-gradient(1px 1px at 50% 10%, #fff 50%, transparent 100%),
                radial-gradient(1px 1px at 70% 80%, #fff 50%, transparent 100%),
                radial-gradient(1px 1px at 90% 40%, #fff 50%, transparent 100%),
                radial-gradient(2px 2px at 15% 75%, rgba(255,255,255,0.8) 50%, transparent 100%),
                radial-gradient(2px 2px at 55% 45%, rgba(255,255,255,0.8) 50%, transparent 100%),
                radial-gradient(2px 2px at 85% 15%, rgba(255,255,255,0.8) 50%, transparent 100%);
    animation: twinkle 4s ease-in-out infinite alternate;
}

@keyframes twinkle {
    0% { opacity: 0.6; }
    100% { opacity: 1; }
}
```

**Step 8: Verify and commit**

Open in browser. CRT scanlines should be visible as a subtle overlay. The intro scene should show stars and a spotlight effect. Other scenes should show their palette background color.

```bash
git add css/style.css
git commit -m "feat: add scene palettes, CRT overlay, HD-2D depth layers, star field"
```

---

## Task 3: Scroll Engine — 12-Scene GSAP Timeline

**Files:**
- Modify: `js/main.js`

**Context:** Currently the JS handles 5 scenes with xPercent moving in 20% steps. With 12 scenes, each step is 100/12 = 8.333%. The timeline needs 11 transitions with pauses at each scene. The character state machine needs to map to 12 scenes. Scene direction is now chronological (left-to-right = past-to-present).

**Step 1: Define scene data array**

At the top of `main.js`, define a data array that drives the HUD, character state, and scene behavior:

```js
const SCENES = [
    { id: 'intro',           lvl: '??', cls: '???',      quest: 'Begin the journey.',                        hp: 100, xp: 0,   char: 'waving',   tier: 'base' },
    { id: 'iitkgp-arrival',  lvl: 19,   cls: 'Student',  quest: 'Survive first year at IIT Kharagpur.',      hp: 90,  xp: 8,   char: 'walking',  tier: 'freshman' },
    { id: 'panic',           lvl: 21,   cls: 'Student',  quest: 'Find something for the CV.',                hp: 20,  xp: 15,  char: 'panicking', tier: 'freshman' },
    { id: 'iimb-research',   lvl: 22,   cls: 'Researcher', quest: 'Build web crawlers. Get published.',      hp: 60,  xp: 30,  char: 'typing',   tier: 'mid' },
    { id: 'snapdeal',        lvl: 22,   cls: 'Intern',   quest: 'A/B tests, ONDC scaling, startup chaos.',   hp: 75,  xp: 40,  char: 'juggling',  tier: 'mid' },
    { id: 'venwiz',          lvl: 22,   cls: 'Intern',   quest: 'Strategy and flowcharts. Earning composure.', hp: 80,  xp: 50,  char: 'pointing',  tier: 'mid' },
    { id: 'dc-advisory',     lvl: 23,   cls: 'Analyst',  quest: 'Sector scans and live deals. Earn PPO.',    hp: 55,  xp: 60,  char: 'grinding',  tier: 'formal' },
    { id: 'iitkgp-grad',     lvl: 24,   cls: 'Graduate', quest: 'Collect all trophies. Throw cap.',          hp: 100, xp: 70,  char: 'jumping',   tier: 'graduate' },
    { id: 'iimc',            lvl: 24,   cls: 'President', quest: 'Lead Finance Club. Win CFA IRC.',          hp: 95,  xp: 80,  char: 'confident', tier: 'senior' },
    { id: 'ascertis-intern', lvl: 25,   cls: 'Intern',   quest: 'Structure credit deals. Earn PPO.',         hp: 85,  xp: 88,  char: 'focused',   tier: 'senior' },
    { id: 'iimc-grad',       lvl: 26,   cls: 'Graduate', quest: 'MBA complete. Degree in hand.',             hp: 100, xp: 95,  char: 'celebrating', tier: 'final' },
    { id: 'ascertis-ft',     lvl: 26,   cls: 'Associate', quest: 'Structuring private credit deals.',        hp: 100, xp: 100, char: 'calm-typing', tier: 'final' },
];
```

**Step 2: Rewrite the scroll timeline**

```js
function initGame() {
    const scenesWrapper = document.querySelector('.scenes-wrapper');
    const player = document.querySelector('.sprite');
    const numScenes = SCENES.length; // 12

    player.classList.add('waving');

    // Each scene transition: 1 unit of movement + 0.4 units of pause
    // 11 transitions x 1.4 = 15.4 total timeline duration
    const moveDuration = 1;
    const pauseDuration = 0.4;

    let scrollTween = gsap.timeline({
        scrollTrigger: {
            trigger: "#timeline",
            pin: true,
            scrub: 1.5,
            start: "top top",
            end: "+=15000", // Long enough for 12 scenes
            onUpdate: (self) => {
                updateScene(self.progress);
            }
        }
    });

    // Build timeline: 11 transitions with pauses
    for (let i = 0; i < numScenes - 1; i++) {
        const targetPercent = -((i + 1) / numScenes) * 100;
        scrollTween.to(scenesWrapper, { xPercent: targetPercent, duration: moveDuration, ease: "none" });
        scrollTween.to({}, { duration: pauseDuration }); // pause at scene
    }

    function updateScene(progress) {
        // Total timeline units: 11 x (1 + 0.4) = 15.4
        const totalDuration = (numScenes - 1) * (moveDuration + pauseDuration);
        const currentTime = progress * totalDuration;

        // Determine which scene we are at
        let sceneIndex = 0;
        for (let i = 0; i < numScenes - 1; i++) {
            const sceneStart = i * (moveDuration + pauseDuration);
            const moveEnd = sceneStart + moveDuration;
            const pauseEnd = moveEnd + pauseDuration;

            if (currentTime >= pauseEnd) {
                sceneIndex = i + 1;
            } else if (currentTime > sceneStart && currentTime < moveEnd) {
                // Between scenes: walking
                sceneIndex = i;
                setCharacterState('walking', SCENES[i + 1].tier);
                updateHUD(SCENES[i], SCENES[i + 1], (currentTime - sceneStart) / moveDuration);
                return;
            } else {
                sceneIndex = i + 1;
                break;
            }
        }

        const scene = SCENES[sceneIndex];
        setCharacterState(scene.char, scene.tier);
        updateHUD(scene, scene, 1);
    }

    // Spawn particles and easter eggs
    spawnParticles();
    setupEasterEggs();

    // Typewriter for intro
    typeWriter('typewriter-text', "Hi, I'm Ranabir. Welcome to my timeline.", 60);
}
```

**Step 3: Create setCharacterState and updateHUD functions**

```js
function setCharacterState(state, tier) {
    const player = document.querySelector('.sprite');
    player.className = 'sprite'; // reset
    player.classList.add(state, tier);
}

function updateHUD(fromScene, toScene, t) {
    // t = 0..1 interpolation between scenes
    document.getElementById('hud-level').textContent = toScene.lvl;
    document.getElementById('hud-class').textContent = toScene.cls;
    document.getElementById('hud-quest').textContent = 'QUEST: ' + toScene.quest;

    const xp = fromScene.xp + (toScene.xp - fromScene.xp) * t;
    document.getElementById('hud-xp').style.width = xp + '%';

    const hp = fromScene.hp + (toScene.hp - fromScene.hp) * t;
    const hpFill = document.getElementById('hud-hp');
    hpFill.style.width = hp + '%';

    // Color the HP bar based on value
    if (hp < 30) hpFill.style.background = 'var(--pixel-red)';
    else if (hp < 60) hpFill.style.background = 'var(--pixel-yellow)';
    else hpFill.style.background = 'var(--pixel-green)';
}
```

**Step 4: Verify and commit**

Open browser. Scrolling should now move through 12 scenes left-to-right. The HUD values should update as you scroll. Character class names should change per scene.

```bash
git add js/main.js
git commit -m "feat: 12-scene scroll engine with SCENES data array, dynamic HUD, character state machine"
```

---

## Task 4: Character Evolution System

**Files:**
- Modify: `css/style.css`

**Context:** The character is built entirely from CSS divs (head, hair, glasses, torso, tie, arms, legs). We need 6 visual tiers that change the character's appearance, plus 8+ animation states. The current CSS has: waving, walking, sitting, intern. We need to expand dramatically.

**Step 1: Define character tier styles**

Each tier changes the character's clothing, hair, and proportions:

```css
/* === CHARACTER TIERS === */

/* Tier: freshman (Scenes 2-3) -- Messy hair, t-shirt, sneakers */
.sprite.freshman .torso { background: #3b82f6; } /* Blue t-shirt */
.sprite.freshman .tie { display: none; }
.sprite.freshman .hair { height: 40px; border-radius: 10px 10px 0 0; background: #1f2937; }
.sprite.freshman .glasses { display: none; }
.sprite.freshman .leg-left, .sprite.freshman .leg-right { background: #6b7280; } /* Jeans */

/* Tier: mid (Scenes 4-6) -- Neater, casual shirt */
.sprite.mid .torso { background: #e2e8f0; } /* Light casual shirt */
.sprite.mid .tie { display: none; }
.sprite.mid .hair { height: 30px; background: #1f2937; }
.sprite.mid .glasses { display: none; }

/* Tier: formal (Scene 7) -- First suit, crooked tie */
.sprite.formal .torso { background: #1e293b; } /* Dark suit */
.sprite.formal .tie { display: block; background: #dc2626; transform: rotate(8deg); }
.sprite.formal .hair { height: 25px; background: #1f2937; }
.sprite.formal .glasses { display: none; }
.sprite.formal .leg-left, .sprite.formal .leg-right { background: #1e293b; }

/* Tier: graduate (Scene 8) -- Graduation cap */
.sprite.graduate .torso { background: #1e293b; }
.sprite.graduate .tie { display: none; }
.sprite.graduate .hair { height: 25px; background: #1f2937; }
.sprite.graduate .head::after {
    content: '';
    position: absolute;
    top: -20px; left: -10px;
    width: 100px; height: 12px;
    background: #000;
    border: 4px solid #333;
}
.sprite.graduate .head::before {
    content: '';
    position: absolute;
    top: -30px; left: 35px;
    width: 4px; height: 20px;
    background: #facc15;
}

/* Tier: senior (Scenes 9-10) -- Confident, proper clothes, taller feel */
.sprite.senior .torso { background: #334155; } /* Smart blazer */
.sprite.senior .tie { display: block; background: #1e40af; transform: none; }
.sprite.senior .hair { height: 25px; background: #111827; }
.sprite.senior .glasses { display: block; border-color: #64748b; }
.sprite.senior .head { width: 80px; }

/* Tier: final (Scenes 11-12) -- Clean formal, glasses glint */
.sprite.final .torso { background: #0f172a; }
.sprite.final .tie { display: block; background: #1d4ed8; transform: none; }
.sprite.final .hair { height: 22px; background: #111827; }
.sprite.final .glasses { display: block; border-color: #94a3b8; box-shadow: 2px 0 8px rgba(148, 163, 184, 0.6); }
.sprite.final .leg-left, .sprite.final .leg-right { background: #0f172a; }
```

**Step 2: Define animation states**

```css
/* === CHARACTER ANIMATION STATES === */

/* Panicking (Scene 3: Panic) -- Head in hands, frantic */
.sprite.panicking .arm-left { animation: panicArm 0.3s alternate infinite; }
.sprite.panicking .arm-right { animation: panicArm 0.3s alternate infinite reverse; }
.sprite.panicking { animation: panicBounce 0.5s ease-in-out infinite; }

@keyframes panicArm { 0% { transform: rotate(-60deg); } 100% { transform: rotate(-90deg); } }
@keyframes panicBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

/* Typing (Scene 4: Research) -- Sitting + fast typing */
.sprite.typing { transform: translateY(20px); }
.sprite.typing .leg-left, .sprite.typing .leg-right { height: 32px; width: 60px; top: 140px; }
.sprite.typing .arm-right { animation: typeFast 0.15s alternate infinite; transform: rotate(-45deg); }
.sprite.typing .arm-left { animation: typeFast 0.15s alternate infinite reverse; transform: rotate(-45deg); }

@keyframes typeFast { 0% { transform: rotate(-45deg) translateY(0); } 100% { transform: rotate(-45deg) translateY(8px); } }

/* Juggling (Scene 5: Snapdeal) -- Arms flailing */
.sprite.juggling .arm-left { animation: juggleL 0.6s ease-in-out infinite; }
.sprite.juggling .arm-right { animation: juggleR 0.6s ease-in-out infinite; }

@keyframes juggleL { 0% { transform: rotate(-30deg); } 50% { transform: rotate(-120deg); } 100% { transform: rotate(-30deg); } }
@keyframes juggleR { 0% { transform: rotate(-120deg); } 50% { transform: rotate(-30deg); } 100% { transform: rotate(-120deg); } }

/* Pointing (Scene 6: Venwiz) -- One arm pointing out */
.sprite.pointing .arm-right { transform: rotate(-90deg); }

/* Grinding (Scene 7: DC Advisory) -- Sitting, exhausted bob */
.sprite.grinding { transform: translateY(20px); }
.sprite.grinding .leg-left, .sprite.grinding .leg-right { height: 32px; width: 60px; top: 140px; }
.sprite.grinding .arm-right { animation: type 0.2s alternate infinite; transform: rotate(-45deg); }
.sprite.grinding { animation: grindBob 2s ease-in-out infinite; }

@keyframes grindBob { 0%, 100% { transform: translateY(20px); } 50% { transform: translateY(24px); } }

/* Jumping (Scene 8: Graduation) -- Bouncing up and down */
.sprite.jumping { animation: jumpBounce 0.6s ease-out infinite; }
.sprite.jumping .arm-left, .sprite.jumping .arm-right { animation: jumpArms 0.6s ease-out infinite; }

@keyframes jumpBounce { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-40px); } }
@keyframes jumpArms { 0%, 100% { transform: rotate(0); } 40% { transform: rotate(-150deg); } }

/* Confident (Scene 9: IIM-C) -- Leaning back slightly */
.sprite.confident { transform: rotate(-3deg); }
.sprite.confident .arm-left { transform: rotate(10deg); }
.sprite.confident .arm-right { transform: rotate(-10deg); }

/* Focused (Scene 10: Ascertis Intern) -- Sitting, steady typing */
.sprite.focused { transform: translateY(20px); }
.sprite.focused .leg-left, .sprite.focused .leg-right { height: 32px; width: 60px; top: 140px; }
.sprite.focused .arm-right { animation: type 0.3s alternate infinite; transform: rotate(-45deg); }

/* Celebrating (Scene 11: IIM-C Grad) -- Calm cap throw */
.sprite.celebrating .arm-right { animation: capThrow 1.5s ease-in-out infinite; }
@keyframes capThrow { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(-160deg); } }

/* Calm-typing (Scene 12: Ascertis FT) -- Seated, slow steady */
.sprite.calm-typing { transform: translateY(20px); }
.sprite.calm-typing .leg-left, .sprite.calm-typing .leg-right { height: 32px; width: 60px; top: 140px; }
.sprite.calm-typing .arm-right { animation: type 0.4s alternate infinite; transform: rotate(-45deg); }
```

**Step 3: Verify and commit**

Scroll through all 12 scenes in browser. The character should change appearance at each tier boundary and play different animations per scene.

```bash
git add css/style.css
git commit -m "feat: character evolution system -- 6 tiers + 10 animation states"
```

---

## Task 5: Scene Environments -- Scenes 1-4

**Files:**
- Modify: `index.html` (add scene-specific environment HTML)
- Modify: `css/style.css` (add scene-specific environment CSS)

**Context:** Each scene needs unique environment props built from CSS divs. This task covers: Intro (stars/spotlight), IIT KGP Arrival (campus gate/trees), The Panic (dorm room/messy desk), IIM-B Research (academic office/terminal).

**Step 1: Scene 1 -- Intro**

Already scaffolded in Task 1. Just needs the typewriter JS hook (handled in Task 3). Visually: dark void + stars + spotlight + dialogue box.

**Step 2: Scene 2 -- IIT KGP Arrival (HTML)**

```html
<div class="scene scene--iitkgp-arrival" id="scene-iitkgp-arrival" data-palette="sunset">
    <div class="scene-bg">
        <div class="sunset-sky"></div>
        <div class="spotlight"></div>
    </div>
    <div class="environment">
        <div class="campus-gate">
            <div class="gate-pillar"></div>
            <div class="gate-arch">IIT KGP</div>
            <div class="gate-pillar"></div>
        </div>
        <div class="pixel-tree tree-1"></div>
        <div class="pixel-tree tree-2"></div>
        <div class="hostel-silhouette"></div>
    </div>
</div>
```

**Step 3: Scene 2 -- IIT KGP Arrival (CSS)**

```css
/* Scene 2: IIT KGP Arrival */
.sunset-sky {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, #1a0a00 0%, #4a1500 40%, #f97316 70%, #fbbf24 90%, #fde68a 100%);
}

.campus-gate {
    display: flex; align-items: flex-end; gap: 0;
    position: relative;
}
.gate-pillar {
    width: 24px; height: 120px;
    background: #78350f; border: 4px solid #000;
}
.gate-arch {
    width: 120px; height: 30px;
    background: #78350f; border: 4px solid #000;
    font-family: var(--font-heading); font-size: 0.5rem;
    color: #fde68a; display: flex; align-items: center; justify-content: center;
    margin-bottom: 90px;
}

.pixel-tree {
    width: 40px; height: 80px; position: absolute; bottom: 0;
}
.pixel-tree::before { /* Canopy */
    content: ''; position: absolute; top: 0; left: -10px;
    width: 60px; height: 50px; background: #166534; border: 4px solid #000;
}
.pixel-tree::after { /* Trunk */
    content: ''; position: absolute; bottom: 0; left: 12px;
    width: 16px; height: 40px; background: #78350f; border: 4px solid #000;
}
.tree-1 { left: -180px; }
.tree-2 { right: -140px; }

.hostel-silhouette {
    position: absolute; right: -250px; bottom: 0;
    width: 160px; height: 100px;
    background: #1e1e2e; border: 4px solid #000;
}
.hostel-silhouette::before { /* Windows */
    content: '';
    position: absolute; top: 10px; left: 10px;
    width: 12px; height: 12px;
    background: #fbbf24;
    box-shadow: 20px 0 0 #fbbf24, 40px 0 0 #fbbf24, 60px 0 0 #fbbf24,
                0 24px 0 #fbbf24, 20px 24px 0 #fbbf24, 60px 24px 0 transparent,
                0 48px 0 #fbbf24, 40px 48px 0 #fbbf24;
}
```

**Step 4: Scene 3 -- The Panic (HTML)**

```html
<div class="scene scene--panic" id="scene-panic" data-palette="dark">
    <div class="scene-bg">
        <div class="dark-room"></div>
        <div class="flickering-light"></div>
        <div class="spotlight"></div>
    </div>
    <div class="environment">
        <div class="dorm-room">
            <div class="messy-bed"></div>
            <div class="desk study">
                <div class="laptop messy">
                    <div class="laptop-screen">CV.pdf -- 0 items</div>
                </div>
            </div>
            <div class="clothes-pile"></div>
        </div>
    </div>
</div>
```

**Step 5: Scene 3 -- The Panic (CSS)**

```css
/* Scene 3: The Panic */
.dark-room {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, #0a0a0f 0%, #111 100%);
}
.flickering-light {
    position: absolute; top: 5vh; left: 50%;
    width: 4px; height: 20px;
    background: #fef3c7;
    box-shadow: 0 0 40px 20px rgba(254, 243, 199, 0.3);
    animation: flicker 0.15s infinite alternate;
}
@keyframes flicker {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 0.9; }
}

.messy-bed {
    position: absolute; left: -200px; bottom: 0;
    width: 120px; height: 40px;
    background: #475569; border: 4px solid #000;
}
.messy-bed::before { /* Pillow */
    content: ''; position: absolute; top: -16px; left: 0;
    width: 40px; height: 16px; background: #e2e8f0; border: 4px solid #000;
}
.messy-bed::after { /* Crumpled blanket */
    content: ''; position: absolute; top: -8px; left: 30px;
    width: 80px; height: 20px; background: #64748b; border: 4px solid #000;
    transform: rotate(-5deg);
}

.laptop-screen {
    font-family: var(--font-heading); font-size: 0.35rem;
    color: var(--pixel-red); padding: 8px;
    text-align: center; line-height: 2;
}

.clothes-pile {
    position: absolute; right: -100px; bottom: 0;
    width: 60px; height: 30px;
    background: #6b7280; border: 4px solid #000;
    border-radius: 30px 30px 0 0;
}
```

**Step 6: Scene 4 -- IIM-B Research (HTML)**

```html
<div class="scene scene--iimb-research" id="scene-iimb-research" data-palette="hacker">
    <div class="scene-bg">
        <div class="dark-room"></div>
        <div class="spotlight"></div>
    </div>
    <div class="environment">
        <div class="desk professional">
            <div class="terminal-monitor">
                <div class="terminal-text">
                    <span class="code-line">> crawl_data.py</span>
                    <span class="code-line green">SUCCESS: 2,847 records</span>
                </div>
            </div>
            <div class="paper-stack tall"></div>
        </div>
        <div class="professor-npc"></div>
    </div>
</div>
```

**Step 7: Scene 4 -- IIM-B Research (CSS)**

```css
/* Scene 4: IIM-B Research */
.terminal-monitor {
    width: 100px; height: 70px;
    background: #000; border: 4px solid #4ade80;
    position: absolute; bottom: 100%; left: 10px;
    box-shadow: 0 0 20px rgba(74, 222, 128, 0.4);
    overflow: hidden;
}
.terminal-text {
    padding: 6px; font-family: var(--font-body);
    font-size: 0.7rem; color: var(--pixel-green);
    display: flex; flex-direction: column; gap: 4px;
}
.code-line { display: block; }
.code-line.green { color: #86efac; }

.paper-stack {
    position: absolute; bottom: 100%; right: 20px;
    width: 40px; height: 20px;
    background: #f1f5f9; border: 2px solid #000;
}
.paper-stack.tall { height: 50px; }
.paper-stack.tall::before, .paper-stack.tall::after {
    content: ''; position: absolute; left: 2px; right: 2px;
    height: 2px; background: #94a3b8;
}
.paper-stack.tall::before { top: 10px; }
.paper-stack.tall::after { top: 22px; }

.professor-npc {
    position: absolute; right: -160px; bottom: 0;
    width: 60px; height: 120px;
}
.professor-npc::before { /* Head */
    content: ''; position: absolute; top: 0; left: 10px;
    width: 40px; height: 40px;
    background: #fcd34d; border: 4px solid #000;
}
.professor-npc::after { /* Body */
    content: ''; position: absolute; top: 40px; left: 5px;
    width: 50px; height: 80px;
    background: #78350f; border: 4px solid #000;
}
```

**Step 8: Verify and commit**

Scroll through scenes 1-4. Each should have distinct environments with the correct palette colors. Character should change tiers and animations correctly.

```bash
git add index.html css/style.css
git commit -m "feat: scene environments 1-4 -- intro starfield, IIT KGP campus, panic dorm, IIM-B research lab"
```

---

## Task 6: Scene Environments -- Scenes 5-8

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

**Step 1: Scene 5 -- Snapdeal (HTML)**

```html
<div class="scene scene--snapdeal" id="scene-snapdeal" data-palette="chaos">
    <div class="scene-bg"><div class="bright-office"></div><div class="spotlight"></div></div>
    <div class="environment">
        <div class="desk startup">
            <div class="laptop messy"></div>
            <div class="laptop" style="left:auto;right:20px;transform:rotate(10deg);"></div>
            <div class="pizza-box"></div>
            <div class="energy-drink"></div>
        </div>
        <div class="bean-bag"></div>
        <div class="messy-whiteboard"></div>
    </div>
</div>
```

**Step 2: Scene 5 -- Snapdeal (CSS)**

```css
.bright-office { position: absolute; inset: 0; background: linear-gradient(to bottom, #1a1a00, #2a2a10); }

.energy-drink {
    width: 10px; height: 24px; background: #22c55e; border: 3px solid #000;
    position: absolute; bottom: 100%; right: 40px;
    border-radius: 2px 2px 0 0;
}

.bean-bag {
    position: absolute; left: -140px; bottom: 0;
    width: 80px; height: 50px;
    background: #f97316; border: 4px solid #000;
    border-radius: 50% 50% 10px 10px;
}

.messy-whiteboard {
    position: absolute; right: -180px; bottom: 40px;
    width: 120px; height: 80px;
    background: #f8fafc; border: 6px solid #94a3b8;
}
.messy-whiteboard::before {
    content: ''; position: absolute; top: 10px; left: 10px;
    width: 40px; height: 3px; background: #ef4444;
    box-shadow: 0 12px 0 #3b82f6, 20px 24px 0 #22c55e, -5px 36px 0 #ef4444;
}
```

**Step 3: Scene 6 -- Venwiz (HTML)**

```html
<div class="scene scene--venwiz" id="scene-venwiz" data-palette="clean">
    <div class="scene-bg"><div class="clean-office"></div><div class="spotlight"></div></div>
    <div class="environment">
        <div class="standing-desk">
            <div class="monitor">
                <div class="flowchart-lines"></div>
            </div>
        </div>
        <div class="clean-whiteboard"></div>
    </div>
</div>
```

**Step 4: Scene 6 -- Venwiz (CSS)**

```css
.clean-office { position: absolute; inset: 0; background: linear-gradient(to bottom, #0a0f1a, #0f1525); }

.standing-desk {
    width: 160px; height: 120px;
    background: #e2e8f0; border: 8px solid #000;
    position: relative;
}
.standing-desk::after {
    content: ''; position: absolute; bottom: -120px; left: 20px;
    width: 12px; height: 120px; background: #94a3b8; border: 4px solid #000;
    box-shadow: 108px 0 0 #94a3b8;
}

.flowchart-lines {
    width: 50px; height: 40px;
    margin: 10px auto;
    border: 2px solid #38bdf8;
    position: relative;
}
.flowchart-lines::before {
    content: ''; position: absolute;
    top: 50%; left: 100%;
    width: 15px; height: 2px; background: #38bdf8;
}
.flowchart-lines::after {
    content: ''; position: absolute;
    top: -15px; left: 50%; transform: translateX(-50%);
    width: 2px; height: 15px; background: #38bdf8;
}

.clean-whiteboard {
    position: absolute; right: -200px; bottom: 60px;
    width: 140px; height: 90px;
    background: #fff; border: 6px solid #475569;
}
.clean-whiteboard::before {
    content: ''; position: absolute; top: 15px; left: 15px;
    width: 60px; height: 3px; background: #3b82f6;
    box-shadow: 0 15px 0 #10b981, 20px 30px 0 #f59e0b, -10px 45px 0 #3b82f6;
}
```

**Step 5: Scene 7 -- DC Advisory (HTML)**

```html
<div class="scene scene--dc" id="scene-dc" data-palette="corporate">
    <div class="scene-bg">
        <div class="night-office"></div>
        <div class="window-skyline"></div>
        <div class="spotlight"></div>
    </div>
    <div class="environment">
        <div class="desk banking">
            <div class="bloomberg-terminal">
                <div class="chart-line"></div>
                <div class="chart-line red"></div>
            </div>
            <div class="coffee-cup"></div>
            <div class="coffee-cup extra" style="right:40px;height:24px;"></div>
            <div class="coffee-cup extra" style="right:55px;height:28px;"></div>
        </div>
    </div>
</div>
```

**Step 6: Scene 7 -- DC Advisory (CSS)**

```css
.night-office { position: absolute; inset: 0; background: linear-gradient(to bottom, #1a0f00, #0d0a05); }

.window-skyline {
    position: absolute; right: 10vw; top: 10vh;
    width: 200px; height: 150px;
    border: 6px solid #475569; background: #0a0a1a;
    overflow: hidden;
}
.window-skyline::before { /* Buildings */
    content: '';
    position: absolute; bottom: 0; left: 10px;
    width: 20px; height: 60px; background: #1e293b;
    box-shadow: 30px 0 0 #1e293b, 30px -20px 0 #1e293b,
                60px 10px 0 #1e293b, 90px -10px 0 #1e293b,
                120px 0 0 #1e293b, 150px -30px 0 #1e293b;
}
.window-skyline::after { /* Stars/lights */
    content: '';
    position: absolute; top: 10px; left: 20px;
    width: 2px; height: 2px; background: #fbbf24;
    box-shadow: 30px 5px 0 #fbbf24, 60px 15px 0 #fbbf24, 100px 8px 0 #fbbf24;
}

.bloomberg-terminal {
    width: 100px; height: 70px;
    background: #000; border: 4px solid #d97706;
    position: absolute; bottom: 100%; left: 10px;
    box-shadow: 0 0 15px rgba(217, 119, 6, 0.3);
}
.chart-line.red { background: var(--pixel-red); transform: rotate(20deg); }
```

**Step 7: Scene 8 -- IIT KGP Graduation (HTML)**

```html
<div class="scene scene--iitkgp-grad" id="scene-iitkgp-grad" data-palette="celebration">
    <div class="scene-bg"><div class="celebration-bg"></div><div class="spotlight"></div></div>
    <div class="environment">
        <div class="stage-platform"></div>
        <div class="trophy-shelf">
            <div class="trophy" data-label="CFA IRC"></div>
            <div class="trophy gold" data-label="Inter IIT"></div>
            <div class="trophy" data-label="Hult Prize"></div>
            <div class="trophy small" data-label="Paper"></div>
        </div>
    </div>
</div>
```

**Step 8: Scene 8 -- IIT KGP Graduation (CSS)**

```css
.celebration-bg {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, #1a0033, #2d004d, #0a001a);
}

.stage-platform {
    width: 300px; height: 20px;
    background: #78350f; border: 4px solid #000;
    position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
}

.trophy-shelf {
    position: absolute; right: -200px; bottom: 0;
    display: flex; gap: 12px; align-items: flex-end;
}
.trophy {
    width: 24px; height: 40px; background: #facc15;
    border: 4px solid #000; position: relative;
}
.trophy::after { /* Base */
    content: ''; position: absolute; bottom: -8px; left: -4px;
    width: 32px; height: 8px; background: #78350f; border: 3px solid #000;
}
.trophy::before { /* Label */
    content: attr(data-label);
    position: absolute; bottom: -28px; left: 50%; transform: translateX(-50%);
    font-family: var(--font-heading); font-size: 0.3rem; color: #facc15;
    white-space: nowrap;
}
.trophy.gold { background: #fbbf24; box-shadow: 0 0 10px rgba(251, 191, 36, 0.5); }
.trophy.small { height: 30px; width: 20px; }
```

**Step 9: Verify and commit**

Scroll through scenes 5-8. Snapdeal should feel chaotic (bright, messy). Venwiz should feel clean. DC Advisory should feel dim corporate with night skyline. IIT KGP Graduation should feel celebratory with trophies.

```bash
git add index.html css/style.css
git commit -m "feat: scene environments 5-8 -- Snapdeal chaos, Venwiz clean, DC Advisory corporate, KGP graduation"
```

---

## Task 7: Scene Environments -- Scenes 9-12

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

**Step 1: Scene 9 -- IIM Calcutta (HTML)**

```html
<div class="scene scene--iimc" id="scene-iimc" data-palette="academic">
    <div class="scene-bg"><div class="academic-bg"></div><div class="spotlight"></div></div>
    <div class="environment">
        <div class="desk professional">
            <div class="nameplate">PRESIDENT</div>
            <div class="monitor"><div class="chart-line"></div></div>
        </div>
        <div class="club-banner">FINANCE &amp; INVESTMENTS CLUB</div>
        <div class="book-pile"></div>
    </div>
</div>
```

**Step 2: Scene 9 -- IIM Calcutta (CSS)**

```css
.academic-bg { position: absolute; inset: 0; background: linear-gradient(to bottom, #0f0a1a, #1a1030); }

.nameplate {
    position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
    padding: 4px 12px; background: #78350f; border: 3px solid #000;
    font-family: var(--font-heading); font-size: 0.4rem; color: #fde68a;
    white-space: nowrap;
}

.club-banner {
    position: absolute; top: -60px; right: -180px;
    padding: 8px 16px;
    background: #1e1b4b; border: 4px solid #a78bfa;
    font-family: var(--font-heading); font-size: 0.4rem; color: #c4b5fd;
    white-space: nowrap;
}

.book-pile {
    position: absolute; left: -120px; bottom: 0;
    width: 50px; height: 80px;
    background: #3b82f6; border: 4px solid #000;
}
.book-pile::before {
    content: ''; position: absolute; top: -20px; left: -5px;
    width: 60px; height: 20px; background: #ef4444; border: 4px solid #000;
    transform: rotate(-5deg);
}
.book-pile::after {
    content: ''; position: absolute; top: -35px; left: 5px;
    width: 40px; height: 15px; background: #10b981; border: 3px solid #000;
    transform: rotate(3deg);
}
```

**Step 3: Scene 10 -- Ascertis Internship (HTML)**

```html
<div class="scene scene--ascertis-intern" id="scene-ascertis-intern" data-palette="professional">
    <div class="scene-bg"><div class="pro-office"></div><div class="spotlight"></div></div>
    <div class="environment">
        <div class="desk professional">
            <div class="monitor">
                <div class="spreadsheet-lines"></div>
            </div>
            <div class="coffee-cup"></div>
        </div>
        <div class="ppo-badge">PPO</div>
    </div>
</div>
```

**Step 4: Scene 10 -- Ascertis Internship (CSS)**

```css
.pro-office { position: absolute; inset: 0; background: linear-gradient(to bottom, #0a0f14, #0f1520); }

.spreadsheet-lines {
    display: flex; flex-direction: column; gap: 3px; padding: 8px;
}
.spreadsheet-lines::before, .spreadsheet-lines::after {
    content: ''; display: block;
    height: 2px; background: #60a5fa;
}
.spreadsheet-lines::after { width: 60%; background: #4ade80; }

.ppo-badge {
    position: absolute; top: -40px; right: -100px;
    padding: 8px 16px;
    background: #facc15; border: 4px solid #000;
    font-family: var(--font-heading); font-size: 0.6rem; color: #000;
    animation: badgePulse 1.5s ease-in-out infinite;
}
@keyframes badgePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
```

**Step 5: Scene 11 -- IIM-C Graduation (HTML)**

```html
<div class="scene scene--iimc-grad" id="scene-iimc-grad" data-palette="celebration">
    <div class="scene-bg"><div class="celebration-bg"></div><div class="spotlight"></div></div>
    <div class="environment">
        <div class="stage-platform"></div>
        <div class="degree-frame">MBA</div>
    </div>
</div>
```

**Step 6: Scene 11 -- IIM-C Graduation (CSS)**

```css
.degree-frame {
    position: absolute; right: -140px; bottom: 20px;
    width: 60px; height: 80px;
    background: #fef3c7; border: 6px solid #78350f;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-heading); font-size: 0.5rem; color: #78350f;
    box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
}
```

**Step 7: Scene 12 -- Ascertis Full-Time (HTML)**

```html
<div class="scene scene--ascertis-ft" id="scene-ascertis-ft" data-palette="cool-blue">
    <div class="scene-bg">
        <div class="modern-office"></div>
        <div class="city-skyline-bg"></div>
        <div class="spotlight"></div>
    </div>
    <div class="environment">
        <div class="modern-desk">
            <div class="dual-monitors">
                <div class="monitor"><div class="chart-line"></div></div>
                <div class="monitor"><div class="spreadsheet-lines"></div></div>
            </div>
            <div class="coffee-cup"></div>
        </div>
    </div>
    <div class="scene-fg">
        <div class="floating-rupee">&#8377;</div>
        <div class="floating-rupee delay">&#8377;</div>
        <div class="floating-rupee delay-2">&#8377;</div>
    </div>
    <div class="final-hud-text">CURRENT QUEST: Structuring private credit deals.</div>
    <div class="scroll-arrow blink down-arrow" style="position:absolute;bottom:5vh;left:50%;transform:translateX(-50%);">
        SCROLL DOWN &#x25BC;
    </div>
</div>
```

**Step 8: Scene 12 -- Ascertis Full-Time (CSS)**

```css
.modern-office { position: absolute; inset: 0; background: linear-gradient(to bottom, #000a1a, #001030); }

.city-skyline-bg {
    position: absolute; bottom: 30vh; left: 0; right: 0; height: 200px;
    opacity: 0.3; filter: blur(2px);
}
.city-skyline-bg::before {
    content: ''; position: absolute; bottom: 0; left: 10%;
    width: 30px; height: 120px; background: #1e3a5f;
    box-shadow: 50px 20px 0 #1e3a5f, 100px -10px 0 #1e3a5f,
                150px 40px 0 #1e3a5f, 200px -20px 0 #1e3a5f,
                250px 10px 0 #1e3a5f, 300px -30px 0 #1e3a5f;
}

.modern-desk {
    width: 250px; height: 80px;
    background: #334155; border: 8px solid #000;
    position: relative;
}
.modern-desk::after {
    content: ''; position: absolute; bottom: -80px; left: 30px;
    width: 12px; height: 80px; background: #64748b; border: 4px solid #000;
    box-shadow: 170px 0 0 #64748b;
}

.dual-monitors {
    display: flex; gap: 8px;
    position: absolute; bottom: 100%; left: 10px;
}

.floating-rupee {
    position: absolute; font-family: var(--font-body);
    font-size: 2rem; color: #facc15; opacity: 0.6;
    animation: floatUp 3s ease-in-out infinite;
}
.floating-rupee:nth-child(1) { bottom: 40vh; left: 30%; }
.floating-rupee:nth-child(2) { bottom: 50vh; right: 30%; animation-delay: 1s; }
.floating-rupee:nth-child(3) { bottom: 35vh; left: 60%; animation-delay: 2s; }

@keyframes floatUp {
    0%, 100% { transform: translateY(0); opacity: 0.6; }
    50% { transform: translateY(-20px); opacity: 1; }
}

.final-hud-text {
    position: absolute; bottom: 10vh; left: 50%; transform: translateX(-50%);
    font-family: var(--font-heading); font-size: 0.8rem;
    color: var(--pixel-blue); text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    white-space: nowrap;
}
```

**Step 9: Verify and commit**

```bash
git add index.html css/style.css
git commit -m "feat: scene environments 9-12 -- IIM-C campus, Ascertis intern, IIM-C grad, Ascertis full-time"
```

---

## Task 8: HUD System CSS

**Files:**
- Modify: `css/style.css`

**Context:** The global HUD (added in Task 1) needs to be styled. It should look like a classic RPG status bar -- fixed in the top-left during horizontal scroll.

**Step 1: Style the HUD**

```css
/* === GLOBAL HUD === */
.hud {
    position: absolute;
    top: 3vh; left: 3vw;
    background: rgba(0, 0, 0, 0.85);
    border: 4px solid var(--ui-border);
    padding: 1rem 1.5rem;
    font-family: var(--font-body);
    z-index: 100;
    min-width: 280px;
    box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
}

.hud-row {
    display: flex; align-items: center; gap: 0.8rem;
    margin-bottom: 0.5rem;
}

.hud-label {
    font-family: var(--font-heading);
    font-size: 0.6rem;
    color: #6b7280;
    min-width: 40px;
}

.hud-value {
    font-size: 1.3rem;
    color: var(--pixel-yellow);
}

.hud-value#hud-class {
    color: var(--pixel-green);
    font-size: 1.1rem;
}

.xp-bar, .hp-bar {
    flex: 1;
    height: 14px;
    background: #1f2937;
    border: 3px solid #4b5563;
    padding: 1px;
}

.xp-fill {
    height: 100%;
    width: 0%;
    background: var(--pixel-blue);
    transition: width 0.5s steps(8);
}

.hp-fill {
    height: 100%;
    width: 100%;
    background: var(--pixel-green);
    transition: width 0.5s steps(8), background 0.3s;
}

.hud-quest {
    font-family: var(--font-heading);
    font-size: 0.55rem;
    color: #9ca3af;
    margin-top: 0.5rem;
    line-height: 1.8;
}
```

**Step 2: Verify and commit**

The HUD should appear as a dark semi-transparent box in the top-left corner. XP and HP bars should animate in stepped increments as you scroll.

```bash
git add css/style.css
git commit -m "feat: RPG-style HUD with XP bar, HP bar, level, class, and quest display"
```

---

## Task 9: Particle System

**Files:**
- Modify: `js/main.js`
- Modify: `css/style.css`

**Context:** Each scene should have ambient floating particles appropriate to its theme. Particles are created dynamically via JS and animated with CSS.

**Step 1: Add particle CSS**

```css
/* === PARTICLES === */
.particles-layer {
    position: absolute;
    inset: 0;
    z-index: 25;
    pointer-events: none;
    overflow: hidden;
}

.particle {
    position: absolute;
    animation: particleFloat 4s ease-in-out infinite;
    opacity: 0.6;
    font-family: var(--font-body);
    pointer-events: none;
}

@keyframes particleFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
    50% { transform: translateY(-30px) rotate(10deg); opacity: 0.8; }
}

.particle--dust {
    width: 3px; height: 3px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
}

.particle--confetti {
    width: 6px; height: 6px;
    border-radius: 0;
}

.particle--code {
    font-size: 1rem;
    color: var(--pixel-green);
    opacity: 0.3;
}

.particle--rupee {
    font-size: 1.2rem;
    color: #facc15;
    opacity: 0.4;
}

.particle--book {
    font-size: 1rem;
    opacity: 0.3;
}
```

**Step 2: Add particle spawner in JS**

Add this function to `main.js`:

```js
// Particle types per scene
const SCENE_PARTICLES = {
    'intro': { type: 'dust', count: 15 },
    'iitkgp-arrival': { type: 'dust', count: 10 },
    'panic': { type: 'dust', count: 20 },
    'iimb-research': { type: 'code', count: 8, chars: ['{', '}', '<', '/', '>',  'def', '>>'] },
    'snapdeal': { type: 'code', count: 6, chars: ['A/B', '{}', 'API', 'npm'] },
    'venwiz': { type: 'dust', count: 8 },
    'dc-advisory': { type: 'dust', count: 10 },
    'iitkgp-grad': { type: 'confetti', count: 25 },
    'iimc': { type: 'book', count: 8, chars: ['\u{1F4DA}', '\u{1F4D6}', '\u{1F4C4}'] },
    'ascertis-intern': { type: 'rupee', count: 10 },
    'iimc-grad': { type: 'confetti', count: 25 },
    'ascertis-ft': { type: 'rupee', count: 12 },
};

function spawnParticles() {
    const container = document.getElementById('particles');
    // Clear existing particles safely
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    SCENES.forEach((scene, i) => {
        const config = SCENE_PARTICLES[scene.id];
        if (!config) return;

        for (let j = 0; j < config.count; j++) {
            const el = document.createElement('div');
            el.className = 'particle particle--' + config.type;

            // Position within scene's horizontal region
            const sceneLeft = i * 100; // in vw
            el.style.left = (sceneLeft + Math.random() * 100) + 'vw';
            el.style.top = (10 + Math.random() * 70) + 'vh';
            el.style.animationDelay = (Math.random() * 4) + 's';
            el.style.animationDuration = (3 + Math.random() * 3) + 's';

            if (config.type === 'confetti') {
                const colors = ['#facc15', '#ef4444', '#3b82f6', '#22c55e', '#a855f7'];
                el.style.background = colors[Math.floor(Math.random() * colors.length)];
            } else if (config.type === 'code' || config.type === 'book') {
                el.textContent = config.chars[Math.floor(Math.random() * config.chars.length)];
            } else if (config.type === 'rupee') {
                el.textContent = '\u20B9';
            }

            container.appendChild(el);
        }
    });
}
```

Call `spawnParticles()` inside `initGame()` after the scroll timeline setup.

**Step 3: Verify and commit**

Particles should float in each scene -- confetti at graduations, code brackets at tech scenes, rupees at finance scenes, dust at moody scenes.

```bash
git add js/main.js css/style.css
git commit -m "feat: ambient particle system -- confetti, code chars, rupees, dust per scene"
```

---

## Task 10: Boot Screen Enhancement and Typewriter

**Files:**
- Modify: `js/main.js`

**Context:** The boot screen needs a fake terminal output that types lines one by one before the loading bar fills. The intro scene needs a typewriter effect for the dialogue box.

**Step 1: Enhanced boot sequence**

Replace the current boot sequence in `main.js`:

```js
window.addEventListener('load', () => {
    const bootScreen = document.getElementById('boot-screen');
    const loadingFill = document.querySelector('.loading-fill');
    const terminalLines = document.querySelectorAll('#terminal-lines p');

    // Hide all terminal lines initially
    terminalLines.forEach(function(p) { p.style.opacity = '0'; });

    // Type out terminal lines one by one
    const tl = gsap.timeline();

    terminalLines.forEach(function(line, i) {
        tl.to(line, { opacity: 1, duration: 0.1, delay: 0.3 });
    });

    // Then fill loading bar
    tl.to(loadingFill, {
        width: '100%',
        duration: 1.5,
        ease: "steps(10)",
    });

    // Then show start prompt and wait
    tl.call(function() {
        var startHandler = function() {
            window.removeEventListener('wheel', startHandler);
            window.removeEventListener('click', startHandler);
            window.removeEventListener('touchstart', startHandler);

            gsap.to(bootScreen, {
                yPercent: -100,
                duration: 0.8,
                ease: "power4.inOut",
                onComplete: function() {
                    window.scrollTo(0, 0);
                    if (typeof lenis !== 'undefined') lenis.scrollTo(0, { immediate: true });
                    initGame();
                }
            });
        };

        window.addEventListener('wheel', startHandler);
        window.addEventListener('click', startHandler);
        window.addEventListener('touchstart', startHandler);
    });
});
```

**Step 2: Typewriter effect for intro dialogue**

Add this function and call it from inside `initGame()`:

```js
function typeWriter(elementId, text, speed) {
    speed = speed || 50;
    var el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = '';
    var i = 0;
    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Inside initGame():
typeWriter('typewriter-text', "Hi, I'm Ranabir. Welcome to my timeline.", 60);
```

**Step 3: Add terminal line CSS tweaks**

```css
#terminal-lines p {
    font-size: 0.7rem;
    margin-bottom: 0.5rem;
    text-align: left;
}
```

**Step 4: Verify and commit**

Boot screen should: show title, type terminal lines one by one, fill loading bar, blink "SCROLL TO START", on scroll slide away and start the game with typewriter text in intro scene.

```bash
git add js/main.js css/style.css
git commit -m "feat: enhanced boot screen with terminal output + typewriter effect on intro dialogue"
```

---

## Task 11: Collectibles and Easter Eggs

**Files:**
- Modify: `index.html` (add collectible elements)
- Modify: `css/style.css`
- Modify: `js/main.js`

**Step 1: Add floating collectibles to relevant scenes**

In HTML, add collectible divs inside `.scene-fg` layers of relevant scenes:

```html
<!-- In tech scenes (4, 5): -->
<div class="scene-fg">
    <div class="collectible code-bracket" style="top:30vh;left:20%;">{}</div>
    <div class="collectible code-bracket" style="top:50vh;right:25%;">&lt;/&gt;</div>
</div>

<!-- In campus scenes (2, 9): -->
<div class="scene-fg">
    <div class="collectible book-icon" style="top:35vh;left:30%;">&#x1F4D6;</div>
</div>

<!-- In finance scenes (7, 10): -->
<div class="scene-fg">
    <div class="collectible coin" style="top:40vh;left:25%;">&#8377;</div>
    <div class="collectible coin" style="top:55vh;right:20%;">&#8377;</div>
</div>

<!-- In achievement scenes (8, 11): -->
<div class="scene-fg">
    <div class="collectible trophy-icon" style="top:30vh;right:30%;">&#x1F3C6;</div>
</div>
```

**Step 2: Collectible CSS**

```css
.collectible {
    position: absolute;
    font-family: var(--font-body);
    font-size: 1.5rem;
    animation: bob 2s ease-in-out infinite;
    cursor: pointer;
    z-index: 35;
    transition: transform 0.2s, opacity 0.3s;
    pointer-events: auto;
}

.collectible:hover { transform: scale(1.3); }

.collectible.collected {
    animation: collectPop 0.4s forwards;
    pointer-events: none;
}

@keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

@keyframes collectPop {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
    100% { transform: scale(0); opacity: 0; }
}

.code-bracket { color: var(--pixel-green); font-size: 1.8rem; }
.coin { color: #facc15; text-shadow: 0 0 8px rgba(250, 204, 21, 0.5); }
.trophy-icon { font-size: 1.5rem; }
.book-icon { font-size: 1.3rem; }
```

**Step 3: Easter eggs -- click coffee cup and CV**

In `js/main.js`, add click handlers:

```js
function setupEasterEggs() {
    // Click coffee cup: character chugs it
    document.querySelectorAll('.coffee-cup').forEach(function(cup) {
        cup.style.cursor = 'pointer';
        cup.addEventListener('click', function() {
            var player = document.querySelector('.sprite');
            cup.style.transition = 'transform 0.3s, opacity 0.3s';
            cup.style.transform = 'translateY(-20px) rotate(45deg)';
            cup.style.opacity = '0';

            // Character jumps briefly
            player.classList.add('jumping');
            setTimeout(function() {
                player.classList.remove('jumping');
                cup.style.transform = '';
                cup.style.opacity = '';
            }, 1500);
        });
    });

    // Click CV in panic scene: sad face
    var laptopScreen = document.querySelector('.scene--panic .laptop-screen');
    if (laptopScreen) {
        laptopScreen.style.cursor = 'pointer';
        laptopScreen.addEventListener('click', function() {
            laptopScreen.textContent = '\u{1F622}';
            laptopScreen.style.fontSize = '1.5rem';
            setTimeout(function() {
                laptopScreen.textContent = 'CV.pdf -- 0 items';
                laptopScreen.style.fontSize = '';
            }, 2000);
        });
    }

    // Collectibles
    document.querySelectorAll('.collectible').forEach(function(item) {
        item.addEventListener('click', function() {
            item.classList.add('collected');
        });
    });
}
```

Call `setupEasterEggs()` at the end of `initGame()`.

**Step 4: Verify and commit**

Click a coffee cup -- it should fly up and disappear briefly while character jumps. Click the CV text in panic scene -- sad face appears. Click collectibles -- they pop and disappear.

```bash
git add index.html css/style.css js/main.js
git commit -m "feat: floating collectibles + easter eggs (coffee chug, CV sad face, clickable items)"
```

---

## Task 12: Responsive Layout and Final Polish

**Files:**
- Modify: `css/style.css` (responsive + polish)

**Step 1: Responsive CSS for mobile**

```css
@media (max-width: 768px) {
    .scenes-wrapper {
        width: 1200vw;
    }

    .hud {
        top: auto; bottom: 2vh;
        left: 2vw; right: 2vw;
        padding: 0.6rem 1rem;
        min-width: auto;
    }
    .hud-label { font-size: 0.5rem; }
    .hud-value { font-size: 1rem; }
    .hud-quest { font-size: 0.45rem; }

    .dialogue-box {
        font-size: 0.7rem;
        padding: 1rem;
        margin: 0 1rem;
        max-width: 90vw;
    }

    .sprite {
        width: 80px; height: 140px;
        transform: scale(0.7);
    }

    .player-character {
        bottom: 30vh;
    }

    .environment { transform: translateX(-50%) scale(0.7); }

    .btn-pixel {
        width: 90%;
        font-size: 0.7rem;
        padding: 1rem 2rem;
    }

    .pixel-heading {
        font-size: 1rem;
    }

    .crt-overlay {
        background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.05) 0px,
            rgba(0, 0, 0, 0.05) 1px,
            transparent 1px,
            transparent 2px
        );
    }
}
```

**Step 2: Add glitch text effect for boot screen title**

```css
.glitch-text {
    position: relative;
}
.glitch-text::before,
.glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
}
.glitch-text::before {
    animation: glitch1 2s infinite;
    color: #ff00ff;
    z-index: -1;
}
.glitch-text::after {
    animation: glitch2 2s infinite;
    color: #00ffff;
    z-index: -2;
}
@keyframes glitch1 {
    0%, 90%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
    92% { clip-path: inset(20% 0 60% 0); transform: translate(-3px, 1px); }
    94% { clip-path: inset(60% 0 10% 0); transform: translate(3px, -1px); }
}
@keyframes glitch2 {
    0%, 90%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
    93% { clip-path: inset(30% 0 50% 0); transform: translate(3px, 1px); }
    95% { clip-path: inset(50% 0 20% 0); transform: translate(-3px, -1px); }
}
```

**Step 3: Scene vignette effect**

```css
.scene {
    width: 100vw;
    height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

/* Subtle vignette per scene */
.scene::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%);
    z-index: 15;
    pointer-events: none;
}
```

**Step 4: Verify everything end-to-end**

1. Boot screen: glitch title, terminal lines type out, loading bar fills, "SCROLL TO START" blinks
2. Scroll right through 12 scenes chronologically
3. Character evolves visually through 6 tiers
4. Character animates differently at each scene
5. HUD updates: LVL, Class, Quest text, XP bar fills, HP bar changes color
6. Scene-specific palettes change ambient lighting/color
7. Particles float per scene (dust, confetti, code chars, rupees)
8. CRT scanlines visible as subtle overlay
9. Easter eggs work (coffee cup click, CV click, collectible click)
10. Scene 12 shows "SCROLL DOWN" arrow
11. Vertical zone: achievement cards + contact buttons
12. Mobile: everything scales down, HUD moves to bottom

```bash
git add css/style.css
git commit -m "feat: responsive layout, glitch text effect, scene vignettes, final polish"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | HTML scaffold -- 12 scenes, global HUD, CRT, particles container | `index.html` |
| 2 | CSS foundation -- palettes, CRT overlay, depth layers, stars | `css/style.css` |
| 3 | Scroll engine -- 12-scene GSAP timeline + character state machine | `js/main.js` |
| 4 | Character evolution -- 6 tiers + 10 animation states | `css/style.css` |
| 5 | Scene environments 1-4 | `index.html`, `css/style.css` |
| 6 | Scene environments 5-8 | `index.html`, `css/style.css` |
| 7 | Scene environments 9-12 | `index.html`, `css/style.css` |
| 8 | HUD system CSS | `css/style.css` |
| 9 | Particle system | `js/main.js`, `css/style.css` |
| 10 | Boot screen + typewriter | `js/main.js`, `css/style.css` |
| 11 | Collectibles + easter eggs | `index.html`, `css/style.css`, `js/main.js` |
| 12 | Responsive + final polish | `css/style.css` |
