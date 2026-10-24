/* KGP: the engine.
   A top-down world built from the real campus map. Story content lives in story.js
   and talks to the engine through window.GAME. */

(function () {
  'use strict';

  var A = window.ART, T = A.T, S = A.S;
  var MAP = window.KGP_MAP;
  var W = MAP.w, H = MAP.h;
  var METRES = MAP.metresPerTile;

  /* ---------- World data ---------- */

  var tiles = new Uint8Array(W * H);
  for (var ty = 0; ty < H; ty++) {
    var row = MAP.tiles[ty];
    for (var tx = 0; tx < W; tx++) tiles[ty * W + tx] = A.CHARS.indexOf(row[tx]);
  }
  var bids = new Uint16Array(W * H);
  (function () {
    var p = 0, r = MAP.bids;
    for (var i = 0; i < r.length; i += 2) { bids.fill(r[i], p, p + r[i + 1]); p += r[i + 1]; }
  })();

  function tileAt(x, y) { return x < 0 || y < 0 || x >= W || y >= H ? T.TREE : tiles[y * W + x]; }
  function bidAt(x, y) { return x < 0 || y < 0 || x >= W || y >= H ? 0 : bids[y * W + x]; }
  function solidTile(t) { return t === T.TREE || t === T.BUILDING || t === T.WATER || t === T.RAIL; }
  function solidAt(x, y) { return solidTile(tileAt(x, y)) || blocked[y * W + x] === 1; }
  var blocked = new Uint8Array(W * H);

  var looks = {};        // bid -> 'brick'
  var doors = {};        // "x,y" of building tile that shows a door
  var lamps = [];        // {x, y} tile coords
  var lampGrid = {};

  Object.keys(MAP.landmarks).forEach(function (k) {
    var l = MAP.landmarks[k];
    if (l.bid) doors[l.bx + ',' + l.by] = true;
  });

  // Street lamps on the verge beside roads.
  (function () {
    for (var y = 1; y < H - 1; y++) for (var x = 1; x < W - 1; x++) {
      if (tiles[y * W + x] !== T.ROAD) continue;
      if (A.hash(x, y, 777) > 0.07) continue;
      var opts = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (var i = 0; i < 4; i++) {
        var lx = x + opts[i][0], ly = y + opts[i][1];
        var t = tiles[ly * W + lx];
        if ((t === T.GRASS || t === T.PARK) && !lampGrid[(lx >> 2) + ',' + (ly >> 2)]) {
          lamps.push({ x: lx, y: ly });
          lampGrid[(lx >> 2) + ',' + (ly >> 2)] = true;
          break;
        }
      }
    }
  })();

  /* ---------- Canvas ---------- */

  var canvas = document.getElementById('world');
  var ctx = canvas.getContext('2d');
  var light = document.createElement('canvas');
  var lctx = light.getContext('2d');
  var dpr = 1, zoom = 4, viewW = 0, viewH = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    var target = window.innerWidth < 700 ? 12 : 27;     // tiles across
    zoom = Math.max(2, Math.round(canvas.width / (S * target)));
    viewW = canvas.width / zoom;
    viewH = canvas.height / zoom;
    light.width = Math.ceil(viewW / 4) + 2;
    light.height = Math.ceil(viewH / 4) + 2;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---------- Map chunks ---------- */

  var CH = 16, chunks = {}, chunkOrder = [];

  function nbOf(x, y) {
    var t = function (a, b) { var v = tileAt(a, b); return v === T.TREE ? T.GRASS : v; };
    return {
      n: t(x, y - 1), s: t(x, y + 1), w: t(x - 1, y), e: t(x + 1, y),
      nB: bidAt(x, y - 1), sB: bidAt(x, y + 1), wB: bidAt(x - 1, y), eB: bidAt(x + 1, y)
    };
  }

  function drawGround(g, x, y, tx, ty) {
    var t = tileAt(tx, ty), nb = nbOf(tx, ty);
    switch (t) {
      case T.ROAD: A.road(g, x, y, tx, ty, nb); break;
      case T.PATH: A.path(g, x, y, tx, ty, nb); break;
      case T.WATER: A.water(g, x, y, tx, ty, nb, 0); break;
      case T.PITCH: A.pitch(g, x, y, tx, ty, nb); break;
      case T.PARK: A.grass(g, x, y, tx, ty, A.P.park, A.P.parkDark, A.P.grassLight); break;
      case T.RAIL: A.rail(g, x, y, tx, ty, nb); break;
      case T.FARM: A.farm(g, x, y, tx, ty); break;
      case T.PLAZA: A.plaza(g, x, y, tx, ty); break;
      case T.SAND: A.px(g, x, y, S, S, A.P.sand); break;
      case T.BUILDING: {
        var b = bidAt(tx, ty);
        A.building(g, x, y, tx, ty, nb, b, looks[b], !!doors[tx + ',' + ty], false);
        break;
      }
      default: A.grass(g, x, y, tx, ty, A.P.grass, A.P.grassDark, A.P.grassLight);
    }
  }

  function getChunk(cx, cy) {
    var key = cx + ',' + cy;
    var c = chunks[key];
    if (c) return c;
    c = document.createElement('canvas');
    c.width = c.height = CH * S;
    var g = c.getContext('2d');
    for (var y = 0; y < CH; y++) for (var x = 0; x < CH; x++) {
      var tx = cx * CH + x, ty = cy * CH + y;
      if (tx >= W || ty >= H) continue;
      drawGround(g, x * S, y * S, tx, ty);
    }
    chunks[key] = c;
    chunkOrder.push(key);
    if (chunkOrder.length > 90) delete chunks[chunkOrder.shift()];
    return c;
  }

  function invalidateChunks() { chunks = {}; chunkOrder = []; }

  /* ---------- Entities ---------- */

  var PLAYER_LOOK = { skin: '#c98d5e', hair: '#1a1411', shirt: '#eef1f6', pants: '#2b3445' };
  var player = { x: 0, y: 0, dir: 'down', moving: false, step: 0, stepT: 0, bike: false, look: PLAYER_LOOK };
  var npcs = [], signs = [], items = [], zones = [];
  var ents = {};

  var SKINS = ['#c68a5a', '#b07a4f', '#d9a274', '#9c6b45', '#e0b088', '#a87048'];
  var HAIRS = ['#1b1512', '#241a14', '#2e2219', '#3b2a1e', '#16110e'];
  var SHIRTS = ['#e05a47', '#3f7fbf', '#f2c14e', '#6bb36b', '#a26bc9', '#ef8f3a', '#f4f1ea', '#2d9c9a', '#d65f8f', '#5c6bc0', '#8d6e63'];
  var PANTS = ['#2b3445', '#3a4b6b', '#4a4a4a', '#5b4a3a', '#24304a', '#6b6b78'];

  function randomLook(seed) {
    var r = function (i) { return A.hash(seed, i, 99); };
    var long = r(5) > 0.62;
    return {
      skin: SKINS[Math.floor(r(1) * SKINS.length)], hair: HAIRS[Math.floor(r(2) * HAIRS.length)],
      shirt: SHIRTS[Math.floor(r(3) * SHIRTS.length)], pants: long && r(6) > 0.5 ? SHIRTS[Math.floor(r(7) * SHIRTS.length)] : PANTS[Math.floor(r(4) * PANTS.length)],
      hairLong: long
    };
  }

  /* ---------- Input ---------- */

  var keys = {}, pressed = {};
  var KEYMAP = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    Space: 'act', Enter: 'act', KeyE: 'act', KeyZ: 'act', KeyB: 'bike', KeyX: 'bike', KeyM: 'map', KeyJ: 'journal', KeyQ: 'journal', Escape: 'back', ShiftLeft: 'run', ShiftRight: 'run'
  };
  window.addEventListener('keydown', function (e) {
    var k = KEYMAP[e.code];
    if (!k) return;
    var onButton = e.target && e.target.tagName === 'BUTTON';
    if (attractMode && onButton) return;          // let the title menu work with Enter
    if (onButton) e.target.blur();
    if (k !== 'run') e.preventDefault();
    if (!keys[k]) pressed[k] = true;
    keys[k] = true;
    AUDIO.unlock();
  });
  window.addEventListener('keyup', function (e) { var k = KEYMAP[e.code]; if (k) keys[k] = false; });
  window.addEventListener('blur', function () { keys = {}; });

  // Touch: a floating stick on the left, buttons on the right.
  var stick = { id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
  var stickEl = document.getElementById('stick'), knobEl = document.getElementById('knob');
  canvas.addEventListener('touchstart', function (e) {
    AUDIO.unlock();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (stick.id === null && t.clientX < window.innerWidth * 0.6) {
        stick.id = t.identifier; stick.ox = t.clientX; stick.oy = t.clientY; stick.dx = stick.dy = 0;
        stickEl.style.left = (t.clientX - 50) + 'px'; stickEl.style.top = (t.clientY - 50) + 'px';
        stickEl.classList.add('on');
      }
    }
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchmove', function (e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (t.identifier !== stick.id) continue;
      var dx = t.clientX - stick.ox, dy = t.clientY - stick.oy, d = Math.hypot(dx, dy), m = 40;
      if (d > m) { dx *= m / d; dy *= m / d; }
      stick.dx = dx / m; stick.dy = dy / m;
      knobEl.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    }
    e.preventDefault();
  }, { passive: false });
  function endTouch(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === stick.id) {
        stick.id = null; stick.dx = stick.dy = 0;
        knobEl.style.transform = ''; stickEl.classList.remove('on');
      }
    }
  }
  canvas.addEventListener('touchend', endTouch);
  canvas.addEventListener('touchcancel', endTouch);

  document.querySelectorAll('[data-press]').forEach(function (el) {
    var k = el.getAttribute('data-press');
    el.addEventListener('pointerdown', function (e) { e.preventDefault(); AUDIO.unlock(); pressed[k] = true; keys[k] = true; });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { el.addEventListener(ev, function () { keys[k] = false; }); });
  });

  /* ---------- Audio: tiny chiptune ---------- */

  var AUDIO = (function () {
    var ac = null, master = null, musicGain = null, musicOn = true, sfxOn = true, nextNote = 0, step = 0, started = false;
    try { musicOn = localStorage.getItem('kgp-music') !== 'off'; } catch (e) {}
    // D major pentatonic, a gentle walking tune. Each entry: [melody, bass] as semitones from D4 / D2, null = rest.
    var SONG = [
      [7, 0], [null, null], [9, null], [12, 7], [14, 0], [null, null], [12, null], [9, 7],
      [7, 5], [null, null], [4, null], [7, 12], [9, 5], [null, null], [null, null], [null, 12],
      [12, 3], [null, null], [14, null], [16, 10], [14, 3], [12, null], [9, null], [12, 10],
      [9, 0], [7, null], [4, null], [2, 7], [4, 0], [null, null], [null, null], [null, 7]
    ];
    function freq(base, semis) { return base * Math.pow(2, semis / 12); }
    function init() {
      if (ac) return;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
      musicGain = ac.createGain(); musicGain.gain.value = musicOn ? 1 : 0; musicGain.connect(master);
    }
    function tone(f, t, dur, type, vol, dest) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest || master);
      o.start(t); o.stop(t + dur + 0.02);
    }
    function schedule() {
      if (!ac || !started) return;
      var spb = 60 / 100 / 2;          // eighth notes at 100 bpm
      while (nextNote < ac.currentTime + 0.25) {
        var n = SONG[step % SONG.length];
        var night = WORLD.darkness > 0.35;
        if (n[0] !== null) tone(freq(293.66, n[0] - (night ? 12 : 0)), nextNote, spb * 1.6, night ? 'triangle' : 'square', night ? 0.05 : 0.022, musicGain);
        if (n[1] !== null) tone(freq(73.42, n[1]), nextNote, spb * 1.9, 'triangle', 0.07, musicGain);
        nextNote += spb; step++;
      }
    }
    return {
      unlock: function () {
        init();
        if (!ac) return;
        if (ac.state === 'suspended') ac.resume();
        if (!started) { started = true; nextNote = ac.currentTime + 0.1; }
      },
      tick: schedule,
      sfx: function (name) {
        if (!ac || !sfxOn) return;
        var t = ac.currentTime;
        if (name === 'blip') tone(880 + Math.random() * 60, t, 0.03, 'square', 0.025);
        else if (name === 'item') { [0, 4, 7, 12].forEach(function (s, i) { tone(freq(587.33, s), t + i * 0.07, 0.12, 'square', 0.05); }); }
        else if (name === 'quest') { [0, 7, 12, 16, 19, 24].forEach(function (s, i) { tone(freq(440, s), t + i * 0.08, 0.2, 'square', 0.05); }); }
        else if (name === 'step') tone(120 + Math.random() * 30, t, 0.03, 'triangle', 0.03);
        else if (name === 'bell') { tone(1318, t, 0.25, 'triangle', 0.06); tone(1760, t + 0.12, 0.3, 'triangle', 0.05); }
        else if (name === 'wrong') tone(160, t, 0.25, 'square', 0.04);
        else if (name === 'open') tone(660, t, 0.06, 'square', 0.03);
      },
      toggleMusic: function () {
        musicOn = !musicOn;
        try { localStorage.setItem('kgp-music', musicOn ? 'on' : 'off'); } catch (e) {}
        if (musicGain) musicGain.gain.value = musicOn ? 1 : 0;
        return musicOn;
      },
      get musicOn() { return musicOn; }
    };
  })();

  /* ---------- World state: time, weather ---------- */

  var WORLD = {
    minutes: 16 * 60 + 30,  // 4:30 pm
    day: 0,
    rain: 0, rainTarget: 0,
    darkness: 0,
    t: 0
  };
  var drops = [];

  function daylight(min) {
    // 0 = full day, 1 = deep night
    var h = min / 60;
    if (h >= 6.5 && h < 17) return 0;
    if (h >= 17 && h < 19.5) return (h - 17) / 2.5;
    if (h >= 19.5 || h < 4.5) return 1;
    return 1 - (h - 4.5) / 2;
  }
  function warmth(min) {
    var h = min / 60;
    if (h >= 16 && h < 19) return Math.sin((h - 16) / 3 * Math.PI);
    if (h >= 5 && h < 7.5) return Math.sin((h - 5) / 2.5 * Math.PI) * 0.7;
    return 0;
  }
  function clockText() {
    var m = Math.floor(WORLD.minutes), h = Math.floor(m / 60), mm = m % 60;
    var ap = h >= 12 ? 'pm' : 'am', h12 = h % 12 || 12;
    return h12 + ':' + (mm < 10 ? '0' : '') + mm + ' ' + ap;
  }

  /* ---------- UI ---------- */

  var $ = function (id) { return document.getElementById(id); };
  var ui = {
    dialog: $('dialog'), name: $('dlg-name'), text: $('dlg-text'), choices: $('dlg-choices'), more: $('dlg-more'),
    objective: $('objective'), objText: $('obj-text'), date: $('hud-date'), clock: $('hud-clock'),
    toast: $('toast'), mapView: $('mapview'), mapCanvas: $('mapcanvas'), journal: $('journal'),
    title: $('title'), banner: $('banner'), lore: $('hud-lore')
  };
  var dialogOpen = false, overlay = null;

  var dlg = null;   // {pages, i, shown, full, resolve, choices}
  function say(name, pages) {
    if (typeof pages === 'string') pages = [pages];
    return new Promise(function (resolve) {
      dlg = { name: name, pages: pages, i: 0, resolve: resolve, choices: null };
      openDialog();
    });
  }
  function choose(name, prompt, options) {
    return new Promise(function (resolve) {
      dlg = { name: name, pages: [prompt], i: 0, resolve: resolve, choices: options };
      openDialog();
    });
  }
  function openDialog() {
    dialogOpen = true;
    ui.dialog.classList.add('open');
    ui.name.textContent = dlg.name || '';
    ui.name.style.display = dlg.name ? '' : 'none';
    showPage();
  }
  function showPage() {
    dlg.full = dlg.pages[dlg.i];
    dlg.shown = 0;
    ui.text.textContent = '';
    ui.choices.innerHTML = '';
    ui.more.style.visibility = 'hidden';
  }
  function finishPage() {
    dlg.shown = dlg.full.length;
    ui.text.textContent = dlg.full;
    var last = dlg.i === dlg.pages.length - 1;
    if (last && dlg.choices) {
      ui.choices.innerHTML = '';
      dlg.choices.forEach(function (c, idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = c;
        b.addEventListener('click', function () { pick(idx); });
        ui.choices.appendChild(b);
      });
      dlg.sel = 0;
      markChoice();
    } else {
      ui.more.style.visibility = 'visible';
    }
  }
  function markChoice() {
    Array.prototype.forEach.call(ui.choices.children, function (b, i) { b.classList.toggle('sel', i === dlg.sel); });
  }
  function pick(idx) {
    var r = dlg.resolve;
    closeDialog();
    AUDIO.sfx('open');
    r(idx);
  }
  function closeDialog() {
    dialogOpen = false;
    ui.dialog.classList.remove('open');
    dlg = null;
  }
  function dialogTick(dt) {
    if (!dlg) return;
    if (dlg.shown < dlg.full.length) {
      var before = Math.floor(dlg.shown);
      dlg.shown = Math.min(dlg.full.length, dlg.shown + dt * 55);
      if (Math.floor(dlg.shown) !== before) {
        ui.text.textContent = dlg.full.slice(0, Math.floor(dlg.shown));
        if (before % 3 === 0 && dlg.full[before] !== ' ') AUDIO.sfx('blip');
      }
      if (dlg.shown >= dlg.full.length) finishPage();
      if (pressed.act) finishPage();
      return;
    }
    var last = dlg.i === dlg.pages.length - 1;
    if (last && dlg.choices) {
      if (pressed.up) { dlg.sel = (dlg.sel + dlg.choices.length - 1) % dlg.choices.length; markChoice(); AUDIO.sfx('blip'); }
      if (pressed.down) { dlg.sel = (dlg.sel + 1) % dlg.choices.length; markChoice(); AUDIO.sfx('blip'); }
      if (pressed.act) pick(dlg.sel);
      return;
    }
    if (pressed.act) {
      if (last) { var r = dlg.resolve; closeDialog(); r(); }
      else { dlg.i++; showPage(); }
    }
  }
  ui.dialog.addEventListener('click', function (e) {
    if (e.target.tagName === 'BUTTON' || !dlg) return;
    pressed.act = true;
  });

  var toastTimer = null;
  function toast(text, kind) {
    ui.toast.textContent = text;
    ui.toast.className = 'show' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { ui.toast.className = ''; }, 2600);
  }

  function banner(top, bottom) {
    ui.banner.innerHTML = '';
    var a = document.createElement('div'); a.className = 'b-top'; a.textContent = top;
    var b = document.createElement('div'); b.className = 'b-bottom'; b.textContent = bottom;
    ui.banner.appendChild(a); ui.banner.appendChild(b);
    ui.banner.classList.remove('show'); void ui.banner.offsetWidth; ui.banner.classList.add('show');
  }

  /* ---------- Save ---------- */

  var state = { flags: {}, items: [], lore: {}, quest: null, done: [] };
  var objective = null;
  var SAVE_KEY = 'kgp-save-v1';
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        state: state, x: player.x, y: player.y, bike: player.bike, look: player.look,
        minutes: WORLD.minutes, day: WORLD.day, date: ui.date.textContent
      }));
    } catch (e) {}
  }
  function loadSave() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; }
  }

  /* ---------- Objective ---------- */

  function setObjective(text, target) {
    objective = target ? { text: text, x: target.x, y: target.y } : null;
    ui.objText.textContent = text || '';
    ui.objective.classList.toggle('empty', !text);
  }

  /* ---------- Simulation ---------- */

  var running = false, paused = false, attractMode = true;
  var cam = { x: 0, y: 0 };
  var lastStepSound = 0;

  function collides(x, y) {
    var x0 = Math.floor((x - 5) / S), x1 = Math.floor((x + 4) / S);
    var y0 = Math.floor((y - 5) / S), y1 = Math.floor((y - 1) / S);
    for (var ty = y0; ty <= y1; ty++) for (var tx = x0; tx <= x1; tx++) if (solidAt(tx, ty)) return true;
    return false;
  }

  function moveAxis(e, dx, dy) {
    if (!dx && !dy) return;
    if (!collides(e.x + dx, e.y + dy)) { e.x += dx; e.y += dy; return; }
    // slide round corners so you don't snag on single tiles
    for (var n = 1; n <= 7; n++) {
      if (dx) {
        if (!collides(e.x + dx, e.y - n) && !collides(e.x, e.y - n)) { e.y -= Math.min(n, Math.abs(dx)); return; }
        if (!collides(e.x + dx, e.y + n) && !collides(e.x, e.y + n)) { e.y += Math.min(n, Math.abs(dx)); return; }
      } else {
        if (!collides(e.x - n, e.y + dy) && !collides(e.x - n, e.y)) { e.x -= Math.min(n, Math.abs(dy)); return; }
        if (!collides(e.x + n, e.y + dy) && !collides(e.x + n, e.y)) { e.x += Math.min(n, Math.abs(dy)); return; }
      }
    }
  }

  function facingPoint() {
    var d = { up: [0, -12], down: [0, 10], left: [-12, -3], right: [12, -3] }[player.dir];
    return { x: player.x + d[0], y: player.y + d[1] };
  }

  function nearestInteractable() {
    var f = facingPoint(), best = null, bd = 15 * 15;
    function test(o) {
      if (o.hidden) return;
      var dx = o.x - f.x, dy = (o.y - 4) - f.y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = o; }
    }
    npcs.forEach(test); signs.forEach(test);
    return best;
  }

  var busy = false;
  function interact(o) {
    if (busy) return;
    busy = true;
    if (o.kind === 'npc') {
      // face each other
      var dx = player.x - o.x, dy = player.y - o.y;
      o.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      o.talking = true;
    }
    Promise.resolve(o.onTalk ? o.onTalk(o) : say(o.title || o.name, o.pages || ['...']))
      .catch(function (err) { console.error(err); })
      .then(function () { o.talking = false; busy = false; save(); });
  }

  function update(dt) {
    WORLD.t += dt;
    if (!paused) {
      WORLD.minutes += dt * 2;            // a day lasts 12 real minutes
      if (WORLD.minutes >= 1440) {
        WORLD.minutes -= 1440; WORLD.day++;
        WORLD.rainTarget = A.hash(WORLD.day, 3, 5) < 0.3 ? 1 : 0;   // the monsoon comes and goes
      }
    }
    WORLD.rain += (WORLD.rainTarget - WORLD.rain) * Math.min(1, dt * 0.25);
    WORLD.darkness = daylight(WORLD.minutes);

    if (attractMode) {
      // title screen: drift slowly over the campus
      cam.x = clamp(cam.x + dt * 9, viewW / 2, W * S - viewW / 2);
      return;
    }

    if (dialogOpen) { dialogTick(dt); updateNPCs(dt); return; }
    if (overlay) {
      if (pressed.back || pressed[overlay] || pressed.act) closeOverlay();
      return;
    }
    if (busy) { updateNPCs(dt); return; }

    if (pressed.map) { openOverlay('map'); return; }
    if (pressed.journal) { openOverlay('journal'); return; }
    if (pressed.bike) {
      if (state.flags.hasBike) { player.bike = !player.bike; AUDIO.sfx('bell'); toast(player.bike ? 'On the cycle' : 'Walking'); }
      else toast('You don’t have a cycle yet. Everyone at KGP gets one.');
    }

    var ix = (keys.right ? 1 : 0) - (keys.left ? 1 : 0) + stick.dx;
    var iy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0) + stick.dy;
    var mag = Math.hypot(ix, iy);
    if (mag > 1) { ix /= mag; iy /= mag; mag = 1; }
    if (mag < 0.2) { ix = iy = 0; mag = 0; }
    var speed = player.bike ? 150 : (keys.run ? 105 : 72);
    player.moving = mag > 0;
    if (player.moving) {
      player.dir = Math.abs(ix) > Math.abs(iy) ? (ix > 0 ? 'right' : 'left') : (iy > 0 ? 'down' : 'up');
      moveAxis(player, ix * speed * dt, 0);
      moveAxis(player, 0, iy * speed * dt);
      player.stepT += dt * (player.bike ? 6 : 8);
      player.step = Math.floor(player.stepT) % 2;
      if (!player.bike && WORLD.t - lastStepSound > 0.32) { AUDIO.sfx('step'); lastStepSound = WORLD.t; }
    } else {
      player.step = 0;
    }

    // pick-ups and zones
    for (var i = items.length - 1; i >= 0; i--) {
      var it = items[i];
      if (Math.abs(it.x - player.x) < 10 && Math.abs(it.y - player.y) < 10) {
        items.splice(i, 1); delete ents[it.id];
        AUDIO.sfx('item');
        if (it.onPickup) it.onPickup(it);
      }
    }
    zones.forEach(function (z) {
      var inside = Math.hypot(z.x - player.x, z.y - player.y) < z.r;
      if (inside && !z.inside && z.onEnter && !busy) {
        busy = true;
        Promise.resolve(z.onEnter(z)).then(function () { busy = false; save(); });
      }
      z.inside = inside;
    });

    if (pressed.act) {
      var o = nearestInteractable();
      if (o) interact(o);
    }

    updateNPCs(dt);

    var tx = player.x, ty = player.y - 8;
    cam.x += (tx - cam.x) * Math.min(1, dt * 8);
    cam.y += (ty - cam.y) * Math.min(1, dt * 8);
  }

  function updateNPCs(dt) {
    npcs.forEach(function (n) {
      if (n.talking || !n.wander) { n.step = 0; return; }
      if (Math.abs(n.x - player.x) > 500 || Math.abs(n.y - player.y) > 400) return;   // asleep offscreen
      if (n.wait > 0) { n.wait -= dt; n.step = 0; return; }
      if (!n.target) pickNext(n);
      if (!n.target) { n.wait = 1 + Math.random() * 2; return; }
      var dx = n.target.x - n.x, dy = n.target.y - n.y, d = Math.hypot(dx, dy);
      var sp = (n.bike ? 60 : 28) * dt;
      if (d <= sp) { n.x = n.target.x; n.y = n.target.y; n.target = null; if (Math.random() < 0.05) n.wait = 1 + Math.random() * 3; }
      else { n.x += dx / d * sp; n.y += dy / d * sp; }
      n.stepT = (n.stepT || 0) + dt * (n.bike ? 5 : 6);
      n.step = Math.floor(n.stepT) % 2;
    });
  }

  var DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  function pickNext(n) {
    var tx = Math.floor(n.x / S), ty = Math.floor((n.y - 1) / S);
    var ok = n.bike ? function (t) { return t === T.ROAD; } : function (t) { return t === T.ROAD || t === T.PATH || t === T.PLAZA; };
    var opts = [];
    Object.keys(DIRS).forEach(function (k) {
      var nx = tx + DIRS[k][0], ny = ty + DIRS[k][1];
      if (ok(tileAt(nx, ny))) opts.push(k);
    });
    if (!opts.length) return;
    var back = { up: 'down', down: 'up', left: 'right', right: 'left' }[n.dir];
    var choice = opts.indexOf(n.dir) >= 0 && Math.random() < 0.8 ? n.dir : opts[Math.floor(Math.random() * opts.length)];
    if (choice === back && opts.length > 1 && Math.random() < 0.85) choice = opts.filter(function (o) { return o !== back; })[0];
    n.dir = choice;
    n.target = { x: (tx + DIRS[choice][0]) * S + 8, y: (ty + DIRS[choice][1]) * S + 12 };
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- Rendering ---------- */

  function render() {
    var c = ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.imageSmoothingEnabled = false;
    c.fillStyle = '#1b2a1b';
    c.fillRect(0, 0, canvas.width, canvas.height);

    var cx = clamp(cam.x, viewW / 2, W * S - viewW / 2);
    var cy = clamp(cam.y, viewH / 2, H * S - viewH / 2);
    var left = Math.round((cx - viewW / 2) * zoom) / zoom;
    var top = Math.round((cy - viewH / 2) * zoom) / zoom;
    c.setTransform(zoom, 0, 0, zoom, -Math.round(left * zoom), -Math.round(top * zoom));

    var c0 = Math.floor(left / (CH * S)), c1 = Math.floor((left + viewW) / (CH * S));
    var r0 = Math.floor(top / (CH * S)), r1 = Math.floor((top + viewH) / (CH * S));
    for (var gy = r0; gy <= r1; gy++) for (var gx = c0; gx <= c1; gx++) {
      if (gx < 0 || gy < 0 || gx * CH >= W || gy * CH >= H) continue;
      c.drawImage(getChunk(gx, gy), gx * CH * S, gy * CH * S);
    }

    var tx0 = Math.max(0, Math.floor(left / S) - 1), tx1 = Math.min(W - 1, Math.ceil((left + viewW) / S) + 1);
    var ty0 = Math.max(0, Math.floor(top / S) - 1), ty1 = Math.min(H - 1, Math.ceil((top + viewH) / S) + 2);

    // water shimmer
    var frame = Math.floor(WORLD.t * 2) % 6;
    c.fillStyle = A.P.waterLight;
    for (var wy = ty0; wy <= ty1; wy++) for (var wx = tx0; wx <= tx1; wx++) {
      if (tiles[wy * W + wx] !== T.WATER) continue;
      var sx = (Math.floor(A.hash(wx, wy, 80) * 12) + frame * 2) % 13;
      c.fillRect(wx * S + sx, wy * S + 4 + (frame % 2), 3, 1);
    }

    // windows light up after dark (about half of them: somebody is always studying)
    if (WORLD.darkness > 0.3) {
      c.fillStyle = A.P.windowLit;
      c.globalAlpha = Math.min(1, (WORLD.darkness - 0.3) * 2.5);
      for (var ly = ty0; ly <= ty1; ly++) for (var lx = tx0; lx <= tx1; lx++) {
        var lb = bids[ly * W + lx];
        if (!lb || bidAt(lx, ly + 1) === lb || doors[lx + ',' + ly] || A.hash(lx, ly, 404) > 0.55) continue;
        if (A.hash(lx, ly, 405) > 0.5) c.fillRect(lx * S + 3, ly * S + 6, 4, 5);
        if (A.hash(lx, ly, 406) > 0.4) c.fillRect(lx * S + 9, ly * S + 6, 4, 5);
      }
      c.globalAlpha = 1;
    }

    // tall things, back to front
    var draw = [];
    for (var y = ty0; y <= ty1; y++) for (var x = tx0; x <= tx1; x++) {
      if (tiles[y * W + x] === T.TREE) draw.push({ y: y * S + 15, tx: x, ty: y, k: 0 });
    }
    lamps.forEach(function (l) {
      if (l.x >= tx0 && l.x <= tx1 && l.y >= ty0 && l.y <= ty1) draw.push({ y: l.y * S + 12, tx: l.x, ty: l.y, k: 1 });
    });
    signs.forEach(function (s) { if (!s.hidden && near(s, left, top)) draw.push({ y: s.y, o: s, k: 2 }); });
    items.forEach(function (it) { if (near(it, left, top)) draw.push({ y: it.y, o: it, k: 3 }); });
    npcs.forEach(function (n) { if (!n.hidden && near(n, left, top)) draw.push({ y: n.y, o: n, k: 4 }); });
    if (!attractMode) draw.push({ y: player.y, o: player, k: 4 });
    draw.sort(function (a, b) { return a.y - b.y; });
    var night = WORLD.darkness > 0.45;
    for (var i = 0; i < draw.length; i++) {
      var d = draw[i];
      if (d.k === 0) A.tree(c, d.tx * S, d.ty * S, d.tx, d.ty);
      else if (d.k === 1) A.lamp(c, d.tx * S, d.ty * S, night);
      else if (d.k === 2) A.sign(c, Math.round(d.o.x - 8), Math.round(d.o.y - 15));
      else if (d.k === 3) (d.o.draw || A.scroll)(c, Math.round(d.o.x - 8), Math.round(d.o.y - 14), WORLD.t);
      else A.person(c, Math.round(d.o.x - 8), Math.round(d.o.y - 23), d.o.dir, d.o.step, d.o.look, d.o.bike);
    }

    // markers over the objective and over people with something to say
    if (!attractMode) {
      npcs.forEach(function (n) {
        if (n.mark && !n.hidden && near(n, left, top)) drawMark(c, n.x, n.y - 30, n.mark);
      });
      if (objective) {
        var ox = objective.x * S + 8, oy = objective.y * S + 8;
        if (ox > left && ox < left + viewW && oy > top && oy < top + viewH) drawPin(c, ox, oy - 26);
      }
      var f = nearestInteractable();
      if (f && !dialogOpen && !busy) drawPrompt(c, f.x, f.y - (f.kind === 'npc' ? 34 : 22));
    }

    // light and weather in screen space
    c.setTransform(1, 0, 0, 1, 0, 0);
    drawLighting(left, top);
    drawRain(c);

    if (!attractMode && objective) drawCompass(c, left, top);
  }

  function near(o, left, top) {
    return o.x > left - 24 && o.x < left + viewW + 24 && o.y > top - 8 && o.y < top + viewH + 40;
  }

  function drawMark(c, x, y, mark) {
    var b = Math.round(Math.sin(WORLD.t * 5) * 1.5);
    c.fillStyle = '#1d1d24'; c.fillRect(x - 3, y - 9 + b, 7, 11);
    c.fillStyle = mark === '?' ? '#7fd1ff' : '#ffd23f';
    if (mark === '?') { c.fillRect(x - 2, y - 8 + b, 5, 2); c.fillRect(x + 1, y - 6 + b, 2, 2); c.fillRect(x - 1, y - 4 + b, 2, 2); c.fillRect(x - 1, y - 1 + b, 2, 2); }
    else { c.fillRect(x - 1, y - 8 + b, 3, 6); c.fillRect(x - 1, y - 1 + b, 3, 2); }
  }
  function drawPin(c, x, y) {
    var b = Math.round(Math.sin(WORLD.t * 4) * 2);
    c.fillStyle = '#1d1d24';
    c.fillRect(x - 5, y - 6 + b, 11, 8); c.fillRect(x - 3, y + 2 + b, 7, 2); c.fillRect(x - 1, y + 4 + b, 3, 2);
    c.fillStyle = '#ffd23f';
    c.fillRect(x - 4, y - 5 + b, 9, 6); c.fillRect(x - 2, y + 1 + b, 5, 2); c.fillRect(x, y + 3 + b, 1, 2);
    c.fillStyle = '#fff3b0'; c.fillRect(x - 3, y - 4 + b, 2, 2);
  }
  function drawPrompt(c, x, y) {
    var b = Math.round(Math.sin(WORLD.t * 6));
    c.fillStyle = '#1d1d24'; c.fillRect(x - 5, y - 5 + b, 11, 9);
    c.fillStyle = '#f4f1ea'; c.fillRect(x - 4, y - 4 + b, 9, 7);
    c.fillStyle = '#1d1d24'; c.fillRect(x - 2, y - 3 + b, 1, 5); c.fillRect(x + 1, y - 3 + b, 1, 5); c.fillRect(x - 1, y - 2 + b, 2, 1); c.fillRect(x - 1, y + b, 2, 1);
  }

  function drawCompass(c, left, top) {
    var ox = objective.x * S + 8, oy = objective.y * S + 8;
    var sx = (ox - left) * zoom, sy = (oy - top) * zoom;
    var m = 34 * dpr;
    if (sx > m && sx < canvas.width - m && sy > m && sy < canvas.height - m) return;
    var cx = canvas.width / 2, cy = canvas.height / 2;
    var ang = Math.atan2(sy - cy, sx - cx);
    var ex = cx + Math.cos(ang) * 1e5, ey = cy + Math.sin(ang) * 1e5;
    var kx = (canvas.width / 2 - m) / Math.abs(ex - cx), ky = (canvas.height / 2 - m) / Math.abs(ey - cy);
    var k = Math.min(kx, ky);
    var px = cx + (ex - cx) * k, py = cy + (ey - cy) * k;
    var dist = Math.round(Math.hypot(ox - player.x, oy - player.y) / S * METRES / 10) * 10;
    c.save();
    c.translate(px, py); c.rotate(ang);
    var u = 3 * dpr;
    c.fillStyle = '#1d1d24';
    c.beginPath(); c.moveTo(6 * u, 0); c.lineTo(-3 * u, -4.5 * u); c.lineTo(-3 * u, 4.5 * u); c.closePath(); c.fill();
    c.fillStyle = '#ffd23f';
    c.beginPath(); c.moveTo(4.5 * u, 0); c.lineTo(-2 * u, -3 * u); c.lineTo(-2 * u, 3 * u); c.closePath(); c.fill();
    c.restore();
    c.font = (11 * dpr) + 'px "Press Start 2P", monospace';
    c.textAlign = 'center';
    var lx = px - Math.cos(ang) * 46 * dpr, ly = py - Math.sin(ang) * 30 * dpr + 4 * dpr;
    c.fillStyle = 'rgba(20,20,28,0.75)';
    var label = dist + ' m';
    var tw = c.measureText(label).width;
    c.fillRect(lx - tw / 2 - 5 * dpr, ly - 11 * dpr, tw + 10 * dpr, 15 * dpr);
    c.fillStyle = '#ffd23f';
    c.fillText(label, lx, ly);
  }

  function drawLighting(left, top) {
    var dark = WORLD.darkness, warm = warmth(WORLD.minutes), rain = WORLD.rain;
    if (warm > 0.01) {
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(255,140,60,' + (0.35 * warm) + ')';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
    var a = dark * 0.68 + rain * 0.18;
    if (a < 0.02) return;
    var lw = light.width, lh = light.height, q = 4;
    lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, lw, lh);
    lctx.fillStyle = 'rgba(12,16,44,' + a + ')';
    lctx.fillRect(0, 0, lw, lh);
    if (dark > 0.3) {
      lctx.globalCompositeOperation = 'destination-out';
      var strength = Math.min(1, (dark - 0.3) * 2);
      lamps.forEach(function (l) {
        var x = (l.x * S + 8 - left) / q, y = (l.y * S - 4 - top) / q;
        if (x < -20 || y < -20 || x > lw + 20 || y > lh + 20) return;
        hole(x, y + 3, 15, 0.85 * strength);
      });
      // lit windows
      var tx0 = Math.max(0, Math.floor(left / S)), tx1 = Math.min(W - 1, Math.ceil((left + viewW) / S));
      var ty0 = Math.max(0, Math.floor(top / S)), ty1 = Math.min(H - 1, Math.ceil((top + viewH) / S));
      for (var y = ty0; y <= ty1; y++) for (var x = tx0; x <= tx1; x++) {
        var b = bids[y * W + x];
        if (!b || bidAt(x, y + 1) === b) continue;
        if (A.hash(x, y, 404) > 0.55 || doors[x + ',' + y]) continue;
        hole((x * S + 8 - left) / q, (y * S + 9 - top) / q, 3.2, 0.95 * strength);
      }
      hole((player.x - left) / q, (player.y - 10 - top) / q, 12, 0.55 * strength);
      lctx.globalCompositeOperation = 'source-over';
    }
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(light, 0, 0, lw, lh, 0, 0, lw * q * zoom, lh * q * zoom);
    ctx.imageSmoothingEnabled = false;
    if (dark > 0.3) {
      // a warm glow where the lamps are
      ctx.globalCompositeOperation = 'lighter';
      lamps.forEach(function (l) {
        var x = (l.x * S + 8 - left) * zoom, y = (l.y * S - 6 - top) * zoom;
        if (x < -100 || y < -100 || x > canvas.width + 100 || y > canvas.height + 100) return;
        var r = 30 * zoom, g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(255,190,90,' + (0.22 * dark) + ')');
        g.addColorStop(1, 'rgba(255,190,90,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      });
      ctx.globalCompositeOperation = 'source-over';
    }
    function hole(x, y, r, s) {
      var g = lctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(0,0,0,' + s + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = g;
      lctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }

  function drawRain(c) {
    var want = Math.floor(WORLD.rain * 260);
    while (drops.length < want) drops.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, v: 0.7 + Math.random() * 0.6 });
    if (drops.length > want) drops.length = want;
    if (!want) return;
    c.strokeStyle = 'rgba(190,210,235,0.55)';
    c.lineWidth = Math.max(1, dpr);
    c.beginPath();
    var dt = 1 / 60;
    drops.forEach(function (d) {
      d.y += 900 * d.v * dt * dpr; d.x -= 140 * dt * dpr;
      if (d.y > canvas.height) { d.y = -10; d.x = Math.random() * canvas.width * 1.2; }
      c.moveTo(d.x, d.y); c.lineTo(d.x - 3 * dpr, d.y + 14 * dpr * d.v);
    });
    c.stroke();
  }

  /* ---------- Overlays: map, journal ---------- */

  var mapImage = null;
  function buildMapImage() {
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d'), img = g.createImageData(W, H);
    var COL = {};
    COL[T.GRASS] = [92, 158, 63]; COL[T.TREE] = [47, 110, 52]; COL[T.ROAD] = [222, 218, 205]; COL[T.PATH] = [196, 170, 120];
    COL[T.BUILDING] = [182, 92, 70]; COL[T.WATER] = [70, 132, 200]; COL[T.PITCH] = [120, 182, 92]; COL[T.PARK] = [110, 176, 80];
    COL[T.RAIL] = [70, 66, 62]; COL[T.PLAZA] = [205, 195, 175]; COL[T.FARM] = [170, 152, 72]; COL[T.SAND] = [216, 197, 143];
    for (var i = 0; i < W * H; i++) {
      var col = COL[tiles[i]] || [0, 0, 0];
      img.data[i * 4] = col[0]; img.data[i * 4 + 1] = col[1]; img.data[i * 4 + 2] = col[2]; img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    mapImage = c;
  }

  function drawMapView() {
    var cv = ui.mapCanvas, g = cv.getContext('2d');
    var box = cv.getBoundingClientRect();
    cv.width = Math.round(box.width * dpr); cv.height = Math.round(box.height * dpr);
    var k = Math.min(cv.width / W, cv.height / H);
    var ox = (cv.width - W * k) / 2, oy = (cv.height - H * k) / 2;
    g.imageSmoothingEnabled = false;
    g.drawImage(mapImage, ox, oy, W * k, H * k);
    g.font = Math.round(9 * dpr) + 'px "Press Start 2P", monospace';
    g.textAlign = 'center';
    Object.keys(state.lore).forEach(function (key) {
      var l = MAP.landmarks[key] || (GAME.extraPlaces && GAME.extraPlaces[key]);
      if (!l) return;
      var x = ox + (l.x + 0.5) * k, y = oy + (l.y + 0.5) * k;
      g.fillStyle = '#1d1d24'; g.fillRect(x - 3 * dpr, y - 3 * dpr, 6 * dpr, 6 * dpr);
      g.fillStyle = '#f4f1ea'; g.fillRect(x - 2 * dpr, y - 2 * dpr, 4 * dpr, 4 * dpr);
    });
    if (objective) {
      var qx = ox + (objective.x + 0.5) * k, qy = oy + (objective.y + 0.5) * k;
      g.fillStyle = '#1d1d24'; g.beginPath(); g.arc(qx, qy, 7 * dpr, 0, 7); g.fill();
      g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(qx, qy, 5 * dpr, 0, 7); g.fill();
    }
    var px = ox + player.x / S * k, py = oy + player.y / S * k;
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(px, py, 6 * dpr, 0, 7); g.fill();
    g.fillStyle = '#e0452f'; g.beginPath(); g.arc(px, py, 4 * dpr, 0, 7); g.fill();
  }

  function openOverlay(kind) {
    overlay = kind;
    AUDIO.sfx('open');
    if (kind === 'map') {
      ui.mapView.classList.add('open');
      if (!mapImage) buildMapImage();
      drawMapView();
    } else {
      renderJournal();
      ui.journal.classList.add('open');
    }
  }
  function closeOverlay() {
    ui.mapView.classList.remove('open');
    ui.journal.classList.remove('open');
    overlay = null;
  }
  document.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', closeOverlay); });
  document.querySelectorAll('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () { if (running && !dialogOpen && !busy) openOverlay(b.getAttribute('data-open')); });
  });
  var musicBtn = $('btn-music');
  if (musicBtn) {
    musicBtn.setAttribute('aria-pressed', String(AUDIO.musicOn));
    musicBtn.addEventListener('click', function () { AUDIO.unlock(); musicBtn.setAttribute('aria-pressed', String(AUDIO.toggleMusic())); });
  }

  function renderJournal() {
    var j = GAME.journal ? GAME.journal(state) : { quests: [], items: [] };
    var q = $('j-quests'), it = $('j-items'), lo = $('j-lore');
    q.innerHTML = ''; it.innerHTML = '';
    j.quests.forEach(function (x) {
      var li = document.createElement('li');
      li.className = x.done ? 'done' : 'now';
      li.textContent = x.title;
      q.appendChild(li);
    });
    if (!j.items.length) it.innerHTML = '<li class="muted">Nothing yet.</li>';
    j.items.forEach(function (x) {
      var li = document.createElement('li');
      var b = document.createElement('b'); b.textContent = x.name;
      li.appendChild(b); li.appendChild(document.createTextNode(' ' + x.desc));
      it.appendChild(li);
    });
    lo.textContent = Object.keys(state.lore).length + ' of ' + signs.length + ' campus signs read';
  }

  /* ---------- Loop ---------- */

  var last = performance.now(), hudT = 0;
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    pressed = {};
    render();
    AUDIO.tick();
    hudT += dt;
    if (hudT > 0.5) {
      hudT = 0;
      ui.clock.textContent = clockText();
      ui.lore.textContent = Object.keys(state.lore).length + '/' + signs.length;
      if (running) save();
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Public API for story.js ---------- */

  function tileCenter(p) { return { x: p.x * S + 8, y: p.y * S + 12 }; }

  var GAME = window.GAME = {
    S: S, W: W, H: H, METRES: METRES, T: T, MAP: MAP,
    state: state, player: player, world: WORLD,
    landmark: function (k) { return MAP.landmarks[k]; },
    tileAt: tileAt, solidAt: solidAt,
    setLook: function (bid, look) { looks[bid] = look; invalidateChunks(); },
    say: say, choose: choose, toast: toast, banner: banner, sfx: function (n) { AUDIO.sfx(n); },
    randomLook: randomLook,
    setObjective: setObjective,
    setDate: function (t) { ui.date.textContent = t; },
    save: save,

    addSign: function (o) {
      var p = tileCenter(o.at);
      var s = { kind: 'sign', id: o.id, x: p.x, y: p.y - 2, title: o.title, pages: o.pages };
      s.onTalk = function () {
        var first = !state.lore[o.id];
        state.lore[o.id] = 1;
        return say(o.title, o.pages).then(function () { if (first) toast('Campus sign read: ' + Object.keys(state.lore).length + ' of ' + signs.length, 'lore'); });
      };
      signs.push(s); ents[o.id] = s;
      return s;
    },
    addNPC: function (o) {
      var p = o.px || tileCenter(o.at);
      var n = {
        kind: 'npc', id: o.id, name: o.name, x: p.x, y: p.y, dir: o.dir || 'down', step: 0,
        look: o.look || randomLook(npcs.length + 17), wander: !!o.wander, bike: !!o.bike,
        onTalk: o.onTalk, pages: o.pages, mark: o.mark || null, hidden: !!o.hidden
      };
      npcs.push(n); ents[o.id] = n;
      return n;
    },
    addItem: function (o) {
      var p = tileCenter(o.at);
      var it = { kind: 'item', id: o.id, x: p.x, y: p.y, onPickup: o.onPickup, draw: o.draw };
      items.push(it); ents[o.id] = it;
      return it;
    },
    addZone: function (o) {
      var p = tileCenter(o.at);
      var z = { id: o.id, x: p.x, y: p.y, r: (o.r || 1) * S, onEnter: o.onEnter };
      zones.push(z); ents[o.id] = z;
      return z;
    },
    remove: function (id) {
      [npcs, signs, items, zones].forEach(function (list) {
        for (var i = list.length - 1; i >= 0; i--) if (list[i].id === id) list.splice(i, 1);
      });
      delete ents[id];
    },
    get: function (id) { return ents[id]; },
    walkableNear: function (p) {
      for (var r = 0; r < 12; r++) for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        var t = tileAt(p.x + dx, p.y + dy);
        if (!solidTile(t)) return { x: p.x + dx, y: p.y + dy };
      }
      return p;
    },
    roadTiles: function (n, seed) {
      var out = [], tries = 0;
      while (out.length < n && tries < n * 200) {
        tries++;
        var x = Math.floor(A.hash(tries, seed, 1) * W), y = Math.floor(A.hash(tries, seed, 2) * H);
        var t = tileAt(x, y);
        if (t === T.ROAD || t === T.PATH) out.push({ x: x, y: y });
      }
      return out;
    },
    give: function (id, name, desc) {
      if (state.items.some(function (i) { return i.id === id; })) return;
      state.items.push({ id: id, name: name, desc: desc });
      AUDIO.sfx('item');
      toast('Got: ' + name, 'item');
    },
    has: function (id) { return state.items.some(function (i) { return i.id === id; }); },
    questDone: function (title) { AUDIO.sfx('quest'); toast('Quest complete: ' + title, 'quest'); },
    teleport: function (p) { var c = tileCenter(p); player.x = c.x; player.y = c.y; cam.x = c.x; cam.y = c.y - 8; },
    setPlayerLook: function (patch) { Object.keys(patch).forEach(function (k) { player.look[k] = patch[k]; }); },
    setBike: function (on) { player.bike = on; },
    setTime: function (min) { WORLD.minutes = min; },

    begin: function (fromSave) {
      attractMode = false;
      running = true;
      ui.title.classList.add('gone');
      document.body.classList.add('playing');
      AUDIO.unlock();
      var sv = fromSave ? loadSave() : null;
      if (sv) {
        Object.keys(sv.state).forEach(function (k) { state[k] = sv.state[k]; });
        player.x = sv.x; player.y = sv.y; player.bike = !!sv.bike;
        if (sv.look) player.look = sv.look;
        WORLD.minutes = sv.minutes; WORLD.day = sv.day || 0;
        if (sv.date) ui.date.textContent = sv.date;
        cam.x = player.x; cam.y = player.y - 8;
      } else {
        try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
      }
      if (GAME.story) GAME.story.start(!!sv);
    },
    hasSave: function () { return !!loadSave(); }
  };

  // Start the world drifting behind the title screen.
  window.addEventListener('load', function () {
    if (GAME.story && GAME.story.setup) GAME.story.setup();
    var start = MAP.landmarks.main_building || { x: W / 2, y: H / 2 };
    cam.x = start.x * S - viewW * 0.3; cam.y = start.y * S;
    WORLD.minutes = 18 * 60 + 10;   // dusk over the campus
    requestAnimationFrame(frame);
  });
})();
