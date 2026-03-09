gsap.registerPlugin(ScrollTrigger);

// ==========================================
// SCENE DATA
// ==========================================
const SCENES = [
    { id: 'intro',           lvl: '??', cls: '???',       quest: 'Begin the journey.',                         hp: 100, xp: 0,   char: 'waving',      tier: 'base' },
    { id: 'iitkgp-arrival',  lvl: 19,   cls: 'Student',   quest: 'Survive first year at IIT Kharagpur.',       hp: 90,  xp: 8,   char: 'walking',     tier: 'freshman' },
    { id: 'panic',           lvl: 21,   cls: 'Student',   quest: 'Find something for the CV.',                 hp: 20,  xp: 15,  char: 'panicking',   tier: 'freshman' },
    { id: 'iimb-research',   lvl: 22,   cls: 'Researcher',quest: 'Build web crawlers. Get published.',         hp: 60,  xp: 30,  char: 'typing',      tier: 'mid' },
    { id: 'snapdeal',        lvl: 22,   cls: 'Intern',    quest: 'A/B tests, ONDC scaling, startup chaos.',    hp: 75,  xp: 40,  char: 'juggling',    tier: 'mid' },
    { id: 'venwiz',          lvl: 22,   cls: 'Intern',    quest: 'Strategy and flowcharts. Earning composure.',hp: 80,  xp: 50,  char: 'pointing',    tier: 'mid' },
    { id: 'dc-advisory',     lvl: 23,   cls: 'Analyst',   quest: 'Sector scans and live deals. Earn PPO.',     hp: 55,  xp: 60,  char: 'grinding',    tier: 'formal' },
    { id: 'iitkgp-grad',     lvl: 24,   cls: 'Graduate',  quest: 'Collect all trophies. Throw cap.',           hp: 100, xp: 70,  char: 'jumping',     tier: 'graduate' },
    { id: 'iimc',            lvl: 24,   cls: 'President',  quest: 'Lead Finance Club. Win CFA IRC.',           hp: 95,  xp: 80,  char: 'confident',   tier: 'senior' },
    { id: 'ascertis-intern', lvl: 25,   cls: 'Intern',    quest: 'Structure credit deals. Earn PPO.',          hp: 85,  xp: 88,  char: 'focused',     tier: 'senior' },
    { id: 'iimc-grad',       lvl: 26,   cls: 'Graduate',  quest: 'MBA complete. Degree in hand.',              hp: 100, xp: 95,  char: 'celebrating', tier: 'final' },
    { id: 'ascertis-ft',     lvl: 26,   cls: 'Associate', quest: 'Structuring private credit deals.',          hp: 100, xp: 100, char: 'calm-typing', tier: 'final' },
];

// Particle config per scene
const SCENE_PARTICLES = {
    'intro':           { type: 'dust', count: 15 },
    'iitkgp-arrival':  { type: 'dust', count: 10 },
    'panic':           { type: 'dust', count: 20 },
    'iimb-research':   { type: 'code', count: 8, chars: ['{', '}', '<', '/', '>', 'def', '>>'] },
    'snapdeal':        { type: 'code', count: 6, chars: ['A/B', '{}', 'API', 'npm'] },
    'venwiz':          { type: 'dust', count: 8 },
    'dc-advisory':     { type: 'dust', count: 10 },
    'iitkgp-grad':     { type: 'confetti', count: 25 },
    'iimc':            { type: 'book', count: 8, chars: ['\u{1F4DA}', '\u{1F4D6}', '\u{1F4C4}'] },
    'ascertis-intern': { type: 'rupee', count: 10 },
    'iimc-grad':       { type: 'confetti', count: 25 },
    'ascertis-ft':     { type: 'rupee', count: 12 },
};

// ==========================================
// BOOT SEQUENCE
// ==========================================
window.addEventListener('load', function() {
    var bootScreen = document.getElementById('boot-screen');
    var loadingFill = document.querySelector('.loading-fill');
    var terminalLines = document.querySelectorAll('#terminal-lines p');

    // Hide terminal lines initially
    terminalLines.forEach(function(p) { p.style.opacity = '0'; });

    var tl = gsap.timeline();

    // Type terminal lines one by one
    terminalLines.forEach(function(line) {
        tl.to(line, { opacity: 1, duration: 0.1, delay: 0.3 });
    });

    // Fill loading bar
    tl.to(loadingFill, { width: '100%', duration: 1.5, ease: 'steps(10)' });

    // Wait for user input to start
    tl.call(function() {
        function startHandler() {
            window.removeEventListener('wheel', startHandler);
            window.removeEventListener('click', startHandler);
            window.removeEventListener('touchstart', startHandler);

            gsap.to(bootScreen, {
                yPercent: -100,
                duration: 0.8,
                ease: 'power4.inOut',
                onComplete: function() {
                    window.scrollTo(0, 0);
                    if (typeof lenis !== 'undefined') lenis.scrollTo(0, { immediate: true });
                    initGame();
                }
            });
        }

        window.addEventListener('wheel', startHandler);
        window.addEventListener('click', startHandler);
        window.addEventListener('touchstart', startHandler);
    });
});

// ==========================================
// SMOOTH SCROLL (Lenis)
// ==========================================
var lenis = new Lenis({
    duration: 1.2,
    easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ==========================================
// CHARACTER STATE
// ==========================================
function setCharacterState(state, tier) {
    var player = document.querySelector('.sprite');
    player.className = 'sprite';
    player.classList.add(state, tier);
}

// ==========================================
// HUD UPDATE
// ==========================================
function updateHUD(fromScene, toScene, t) {
    document.getElementById('hud-level').textContent = toScene.lvl;
    document.getElementById('hud-class').textContent = toScene.cls;
    document.getElementById('hud-quest').textContent = 'QUEST: ' + toScene.quest;

    var xp = fromScene.xp + (toScene.xp - fromScene.xp) * t;
    document.getElementById('hud-xp').style.width = xp + '%';

    var hp = fromScene.hp + (toScene.hp - fromScene.hp) * t;
    var hpFill = document.getElementById('hud-hp');
    hpFill.style.width = hp + '%';

    if (hp < 30) hpFill.style.background = 'var(--pixel-red)';
    else if (hp < 60) hpFill.style.background = 'var(--pixel-yellow)';
    else hpFill.style.background = 'var(--pixel-green)';
}

// ==========================================
// TYPEWRITER
// ==========================================
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

// ==========================================
// PARTICLES
// ==========================================
function spawnParticles() {
    var container = document.getElementById('particles');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    SCENES.forEach(function(scene, i) {
        var config = SCENE_PARTICLES[scene.id];
        if (!config) return;

        for (var j = 0; j < config.count; j++) {
            var el = document.createElement('div');
            el.className = 'particle particle--' + config.type;

            var sceneLeft = i * 100;
            el.style.left = (sceneLeft + Math.random() * 100) + 'vw';
            el.style.top = (10 + Math.random() * 70) + 'vh';
            el.style.animationDelay = (Math.random() * 4) + 's';
            el.style.animationDuration = (3 + Math.random() * 3) + 's';

            if (config.type === 'confetti') {
                var colors = ['#facc15', '#ef4444', '#3b82f6', '#22c55e', '#a855f7'];
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

// ==========================================
// EASTER EGGS
// ==========================================
function setupEasterEggs() {
    // Coffee cup click
    document.querySelectorAll('.coffee-cup').forEach(function(cup) {
        cup.style.cursor = 'pointer';
        cup.addEventListener('click', function() {
            var player = document.querySelector('.sprite');
            cup.style.transition = 'transform 0.3s, opacity 0.3s';
            cup.style.transform = 'translateY(-20px) rotate(45deg)';
            cup.style.opacity = '0';
            player.classList.add('jumping');
            setTimeout(function() {
                player.classList.remove('jumping');
                cup.style.transform = '';
                cup.style.opacity = '';
            }, 1500);
        });
    });

    // Panic CV click
    var laptopScreen = document.querySelector('.scene--panic .laptop-screen');
    if (laptopScreen) {
        laptopScreen.style.cursor = 'pointer';
        laptopScreen.addEventListener('click', function() {
            var original = laptopScreen.textContent;
            laptopScreen.textContent = '\u{1F622}';
            laptopScreen.style.fontSize = '1.5rem';
            setTimeout(function() {
                laptopScreen.textContent = original;
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

// ==========================================
// GAME ENGINE
// ==========================================
function initGame() {
    var scenesWrapper = document.querySelector('.scenes-wrapper');
    var player = document.querySelector('.sprite');
    var numScenes = SCENES.length;

    player.classList.add('waving');

    var moveDuration = 1;
    var pauseDuration = 0.4;

    var scrollTween = gsap.timeline({
        scrollTrigger: {
            trigger: '#timeline',
            pin: true,
            scrub: 1.5,
            start: 'top top',
            end: '+=15000',
            onUpdate: function(self) {
                updateScene(self.progress);
            }
        }
    });

    // Build timeline: 11 transitions with pauses
    for (var i = 0; i < numScenes - 1; i++) {
        var targetPercent = -((i + 1) / numScenes) * 100;
        scrollTween.to(scenesWrapper, { xPercent: targetPercent, duration: moveDuration, ease: 'none' });
        scrollTween.to({}, { duration: pauseDuration });
    }

    function updateScene(progress) {
        var totalDuration = (numScenes - 1) * (moveDuration + pauseDuration);
        var currentTime = progress * totalDuration;

        var sceneIndex = 0;
        for (var i = 0; i < numScenes - 1; i++) {
            var sceneStart = i * (moveDuration + pauseDuration);
            var moveEnd = sceneStart + moveDuration;
            var pauseEnd = moveEnd + pauseDuration;

            if (currentTime >= pauseEnd) {
                sceneIndex = i + 1;
            } else if (currentTime > sceneStart && currentTime < moveEnd) {
                sceneIndex = i;
                setCharacterState('walking', SCENES[i + 1].tier);
                updateHUD(SCENES[i], SCENES[i + 1], (currentTime - sceneStart) / moveDuration);
                return;
            } else {
                sceneIndex = i + 1;
                break;
            }
        }

        var scene = SCENES[sceneIndex];
        setCharacterState(scene.char, scene.tier);
        updateHUD(scene, scene, 1);
    }

    // Init subsystems
    spawnParticles();
    setupEasterEggs();
    typeWriter('typewriter-text', "Hi, I'm Ranabir. Welcome to my timeline.", 60);
}
