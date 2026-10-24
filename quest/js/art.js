/* Pixel art, all drawn in code.
   Tiles are drawn straight into map chunks (they need their neighbours for edges and walls);
   people are drawn per frame from a small look description. */

(function () {
  'use strict';

  var T = { GRASS: 0, TREE: 1, ROAD: 2, PATH: 3, BUILDING: 4, WATER: 5, PITCH: 6, PARK: 7, RAIL: 8, PLAZA: 9, FARM: 10, SAND: 11 };
  var CHARS = 'gTr.BwpkR=fs';
  var S = 16;

  var P = {
    grass: '#5c9e3f', grassDark: '#4c8a35', grassLight: '#70b24b', blade: '#3e7a2e',
    park: '#69ae4a', parkDark: '#5a9c40',
    pitch: '#55a046', pitchStripe: '#5fab4f', pitchLine: '#e9f2dc',
    canopy: '#2f6e34', canopyLight: '#46923f', canopyHi: '#5aa84a', canopyDark: '#20502a', trunk: '#6b4a2b',
    road: '#5d6169', roadDark: '#52565e', roadLight: '#686c74', kerb: '#a3a39a', kerbDark: '#7f7f77',
    path: '#bd9f6c', pathDark: '#a98b5b', pathLight: '#cdb07e',
    water: '#3b7cc0', waterDark: '#2f69a8', waterLight: '#6aa6dd', bank: '#8a7a52',
    ballast: '#8b8172', sleeper: '#5b4330', rail: '#c3c7cb',
    plaza: '#cbc1ae', plazaDark: '#b7ad9a',
    farm: '#a08e3e', farmDark: '#857531',
    sand: '#d8c58f',
    wall: '#e6d8bc', wallShade: '#cdbd9d', wallDark: '#9c8b6c', window: '#3d5a73', windowLit: '#ffd77a', door: '#6b4128',
    brick: '#b4553c', brickDark: '#8e3f2c', brickLight: '#c96a4f',
    shadow: 'rgba(20,30,20,0.28)'
  };

  var ROOFS = [
    ['#a64a36', '#c25e45', '#7f3726'],  // terracotta
    ['#6f7f8e', '#8494a3', '#566472'],  // slate
    ['#b8904d', '#cea660', '#8e6c35'],  // ochre
    ['#7f5b4c', '#99705f', '#5f4237'],  // brown
    ['#5d7d68', '#729580', '#465e4f'],  // green tin
    ['#9a9a96', '#b2b2ad', '#787874'],  // concrete
    ['#8a4f5d', '#a4636f', '#673a45']   // plum
  ];

  // Buildings that should look like themselves.
  var SPECIAL_ROOF = { brick: ['#b4553c', '#ca6c50', '#86392a'] };

  function hash(x, y, s) {
    var h = (x * 374761393 + y * 668265263 + (s || 0) * 2147483647) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  function px(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }

  /* ---------- Ground tiles ---------- */

  function grass(g, x, y, tx, ty, base, dark, light) {
    px(g, x, y, S, S, base);
    var n = 3 + Math.floor(hash(tx, ty, 1) * 4);
    for (var i = 0; i < n; i++) {
      var bx = x + Math.floor(hash(tx, ty, 10 + i) * 15), by = y + Math.floor(hash(tx, ty, 20 + i) * 14);
      px(g, bx, by, 1, 2, i % 2 ? dark : P.blade);
      if (hash(tx, ty, 30 + i) > 0.7) px(g, bx + 1, by + 1, 1, 1, light);
    }
    if (hash(tx, ty, 2) > 0.93) {
      // tiny flowers
      var fc = ['#f2d24b', '#ffffff', '#e86a8a'][Math.floor(hash(tx, ty, 3) * 3)];
      var fx = x + 3 + Math.floor(hash(tx, ty, 4) * 9), fy = y + 3 + Math.floor(hash(tx, ty, 5) * 9);
      px(g, fx, fy, 1, 1, fc); px(g, fx + 2, fy + 1, 1, 1, fc); px(g, fx + 1, fy + 2, 1, 1, fc);
    }
  }

  function edgeShade(g, x, y, nb, kind, c) {
    // darken edges that meet a different surface
    if (nb.n !== kind) px(g, x, y, S, 1, c);
    if (nb.s !== kind) px(g, x, y + S - 1, S, 1, c);
    if (nb.w !== kind) px(g, x, y, 1, S, c);
    if (nb.e !== kind) px(g, x + S - 1, y, 1, S, c);
  }

  function road(g, x, y, tx, ty, nb) {
    px(g, x, y, S, S, P.road);
    for (var i = 0; i < 5; i++) {
      px(g, x + Math.floor(hash(tx, ty, 40 + i) * 16), y + Math.floor(hash(tx, ty, 50 + i) * 16), 1, 1, i % 2 ? P.roadDark : P.roadLight);
    }
    var isRoad = function (t) { return t === T.ROAD || t === T.PATH || t === T.PLAZA; };
    if (!isRoad(nb.n)) { px(g, x, y, S, 2, P.kerb); px(g, x, y + 2, S, 1, P.kerbDark); }
    if (!isRoad(nb.s)) { px(g, x, y + S - 2, S, 2, P.kerb); }
    if (!isRoad(nb.w)) { px(g, x, y, 2, S, P.kerb); px(g, x + 2, y, 1, S, P.kerbDark); }
    if (!isRoad(nb.e)) { px(g, x + S - 2, y, 2, S, P.kerb); }
  }

  function path(g, x, y, tx, ty, nb) {
    px(g, x, y, S, S, P.path);
    for (var i = 0; i < 6; i++) {
      px(g, x + Math.floor(hash(tx, ty, 60 + i) * 15), y + Math.floor(hash(tx, ty, 70 + i) * 15), 2, 1, i % 2 ? P.pathDark : P.pathLight);
    }
    // soft grass fringe
    var c = P.grassDark;
    if (nb.n === T.GRASS || nb.n === T.TREE) for (var a = 0; a < S; a += 3) px(g, x + a, y, 2, 1 + (a % 2), c);
    if (nb.s === T.GRASS || nb.s === T.TREE) for (var b = 1; b < S; b += 3) px(g, x + b, y + S - 1, 2, 1, c);
  }

  function water(g, x, y, tx, ty, nb, frame) {
    px(g, x, y, S, S, P.water);
    for (var i = 0; i < 3; i++) {
      var wx = (Math.floor(hash(tx, ty, 80 + i) * 12) + frame * 2) % 13;
      var wy = 3 + i * 5 + Math.floor(hash(tx, ty, 90 + i) * 2);
      px(g, x + wx, y + wy, 3, 1, P.waterLight);
    }
    if (nb.n !== T.WATER) { px(g, x, y, S, 2, P.bank); px(g, x, y + 2, S, 1, P.waterDark); }
    if (nb.w !== T.WATER) px(g, x, y, 1, S, P.bank);
    if (nb.e !== T.WATER) px(g, x + S - 1, y, 1, S, P.bank);
    if (nb.s !== T.WATER) px(g, x, y + S - 1, S, 1, P.bank);
  }

  function pitch(g, x, y, tx, ty, nb) {
    px(g, x, y, S, S, (Math.floor(tx / 2) % 2) ? P.pitch : P.pitchStripe);
    if (nb.n !== T.PITCH) px(g, x, y + 1, S, 1, P.pitchLine);
    if (nb.s !== T.PITCH) px(g, x, y + S - 2, S, 1, P.pitchLine);
    if (nb.w !== T.PITCH) px(g, x + 1, y, 1, S, P.pitchLine);
    if (nb.e !== T.PITCH) px(g, x + S - 2, y, 1, S, P.pitchLine);
  }

  function rail(g, x, y, tx, ty, nb) {
    px(g, x, y, S, S, P.ballast);
    for (var i = 0; i < 8; i++) px(g, x + Math.floor(hash(tx, ty, 100 + i) * 16), y + Math.floor(hash(tx, ty, 110 + i) * 16), 1, 1, '#a1978a');
    var vertical = nb.n === T.RAIL || nb.s === T.RAIL;
    if (vertical) {
      for (var s = 1; s < S; s += 4) px(g, x + 2, y + s, 12, 2, P.sleeper);
      px(g, x + 4, y, 1, S, P.rail); px(g, x + 11, y, 1, S, P.rail);
    } else {
      for (var t = 1; t < S; t += 4) px(g, x + t, y + 2, 2, 12, P.sleeper);
      px(g, x, y + 4, S, 1, P.rail); px(g, x, y + 11, S, 1, P.rail);
    }
  }

  function farm(g, x, y, tx, ty) {
    px(g, x, y, S, S, P.farm);
    for (var r = 1; r < S; r += 4) px(g, x, y + r, S, 1, P.farmDark);
    for (var i = 0; i < 4; i++) px(g, x + Math.floor(hash(tx, ty, 120 + i) * 15), y + 2 + i * 4, 1, 1, '#c2b05a');
  }

  function plaza(g, x, y, tx, ty) {
    px(g, x, y, S, S, P.plaza);
    px(g, x, y + 7, S, 1, P.plazaDark); px(g, x, y + 15, S, 1, P.plazaDark);
    px(g, x + ((ty % 2) ? 4 : 11), y, 1, 7, P.plazaDark); px(g, x + ((ty % 2) ? 11 : 4), y + 8, 1, 7, P.plazaDark);
  }

  /* ---------- Buildings ---------- */

  function roofFor(bid, look) {
    if (look && SPECIAL_ROOF[look]) return SPECIAL_ROOF[look];
    return ROOFS[Math.floor(hash(bid, 7, 3) * ROOFS.length)];
  }

  // A building tile is either roof (top face) or the front wall (when the tile below is not this building).
  function building(g, x, y, tx, ty, nb, bid, look, isDoor, lit) {
    var roof = roofFor(bid, look);
    var brick = look === 'brick';
    var sameS = nb.sB === bid, sameN = nb.nB === bid, sameW = nb.wB === bid, sameE = nb.eB === bid;
    if (!sameS) {
      // front wall
      var wc = brick ? P.brick : P.wall, ws = brick ? P.brickDark : P.wallShade;
      px(g, x, y, S, S, wc);
      if (brick) for (var r = 2; r < S; r += 3) { px(g, x, y + r, S, 1, P.brickDark); }
      px(g, x, y, S, 3, roof[2]);           // eave shadow
      px(g, x, y + S - 2, S, 2, ws);
      if (isDoor) {
        px(g, x + 4, y + 5, 8, 11, P.door);
        px(g, x + 5, y + 6, 6, 9, '#83532f');
        px(g, x + 9, y + 10, 1, 1, '#e8c56a');
        px(g, x + 3, y + 4, 10, 1, ws);
      } else {
        var wcol = lit ? P.windowLit : P.window;
        px(g, x + 3, y + 6, 4, 5, wcol); px(g, x + 9, y + 6, 4, 5, wcol);
        px(g, x + 3, y + 11, 4, 1, ws); px(g, x + 9, y + 11, 4, 1, ws);
        if (!lit) { px(g, x + 3, y + 6, 1, 1, '#6d8ba3'); px(g, x + 9, y + 6, 1, 1, '#6d8ba3'); }
      }
      if (!sameW) px(g, x, y, 1, S, P.wallDark);
      if (!sameE) px(g, x + S - 1, y, 1, S, P.wallDark);
      return;
    }
    // roof
    px(g, x, y, S, S, roof[0]);
    if (hash(bid, ty, 9) > 0.5) for (var k = 3; k < S; k += 5) px(g, x, y + k, S, 1, roof[2]);
    if (!sameN) px(g, x, y, S, 2, roof[1]);
    if (!sameW) px(g, x, y, 2, S, roof[1]);
    if (!sameE) px(g, x + S - 2, y, 2, S, roof[2]);
    // occasional rooftop water tank, very Indian campus
    if (sameN && sameW && sameE && hash(tx, ty, bid) > 0.985) {
      px(g, x + 5, y + 3, 6, 7, '#2d2d2d'); px(g, x + 6, y + 4, 4, 1, '#4a4a4a');
    }
  }

  /* ---------- Trees (drawn as tall objects so you can walk behind them) ---------- */

  function tree(g, x, y, tx, ty) {
    var v = hash(tx, ty, 130);
    var big = v > 0.55;
    // shadow on the ground
    g.fillStyle = P.shadow;
    g.beginPath(); g.ellipse(x + 8, y + 14, 7, 3, 0, 0, 7); g.fill();
    px(g, x + 7, y + 8, 3, 7, P.trunk);
    px(g, x + 7, y + 8, 1, 7, '#7d5a36');
    var cy = big ? y - 6 : y - 2, r = big ? 9 : 7;
    blob(g, x + 8, cy + 4, r, P.canopyDark);
    blob(g, x + 7, cy + 2, r - 1, P.canopy);
    blob(g, x + 6, cy, r - 3, P.canopyLight);
    px(g, x + 4, cy - 2, 2, 2, P.canopyHi);
    px(g, x + 8, cy - 4, 2, 1, P.canopyHi);
    if (v < 0.12) { // flowering tree: krishnachura / radhachura, common in Bengal
      for (var i = 0; i < 7; i++) px(g, x + 2 + Math.floor(hash(tx, ty, 140 + i) * 12), cy - 4 + Math.floor(hash(tx, ty, 150 + i) * 10), 2, 2, v < 0.06 ? '#e8572f' : '#f2c230');
    }
  }

  function blob(g, cx, cy, r, c) {
    g.fillStyle = c;
    for (var dy = -r; dy <= r; dy++) {
      var w = Math.round(Math.sqrt(r * r - dy * dy));
      g.fillRect(cx - w, cy + dy, w * 2, 1);
    }
  }

  /* ---------- People ---------- */

  // look: {skin, hair, shirt, pants, hairLong, cap, tie}
  function person(g, x, y, dir, step, look, bike) {
    var sw = step ? 1 : 0;              // arm/leg swing
    var bob = step && !bike ? -1 : 0;
    g.fillStyle = P.shadow;
    g.beginPath(); g.ellipse(x + 8, y + 22, bike ? 8 : 5, 2, 0, 0, 7); g.fill();

    if (bike) drawBike(g, x, y, dir, step);

    var top = y + 4 + bob + (bike ? -1 : 0);
    // legs
    if (!bike) {
      if (dir === 'left' || dir === 'right') {
        px(g, x + 6 - sw, top + 13, 2, 5, look.pants);
        px(g, x + 9 + sw, top + 13, 2, 5, look.pants);
        px(g, x + 6 - sw, top + 17, 2, 1, '#2b2118'); px(g, x + 9 + sw, top + 17, 2, 1, '#2b2118');
      } else {
        px(g, x + 5, top + 13, 2, 5 - sw, look.pants);
        px(g, x + 9, top + 13, 2, 4 + sw, look.pants);
        px(g, x + 5, top + 17 - sw, 2, 1, '#2b2118'); px(g, x + 9, top + 16 + sw, 2, 1, '#2b2118');
      }
    } else {
      px(g, x + 5, top + 13, 2, 3, look.pants); px(g, x + 9, top + 13, 2, 3, look.pants);
    }
    // body
    px(g, x + 4, top + 7, 8, 7, look.shirt);
    px(g, x + 4, top + 13, 8, 1, shade(look.shirt));
    if (look.tie && dir === 'down') px(g, x + 7, top + 8, 2, 5, look.tie);
    // arms
    if (dir === 'left' || dir === 'right') {
      var ax = dir === 'left' ? x + 6 + sw : x + 8 - sw;
      px(g, ax, top + 8, 2, 5, shade(look.shirt)); px(g, ax, top + 12, 2, 1, look.skin);
    } else {
      px(g, x + 3, top + 8 + (bike ? 0 : sw), 1, 5, shade(look.shirt)); px(g, x + 12, top + 8 + (bike ? 0 : 1 - sw), 1, 5, shade(look.shirt));
      px(g, x + 3, top + 12 + (bike ? 0 : sw), 1, 1, look.skin); px(g, x + 12, top + 13 - (bike ? 1 : sw), 1, 1, look.skin);
    }
    // head
    px(g, x + 4, top, 8, 7, look.skin);
    px(g, x + 4, top + 6, 8, 1, shade(look.skin));
    var hair = look.hair;
    if (dir === 'up') {
      px(g, x + 4, top - 1, 8, 6, hair);
      if (look.hairLong) px(g, x + 4, top + 5, 8, 4, hair);
    } else {
      px(g, x + 4, top - 1, 8, 3, hair);
      px(g, x + 3, top, 1, 3, hair); px(g, x + 12, top, 1, 3, hair);
      if (dir === 'down') {
        px(g, x + 6, top + 3, 1, 2, '#1d1d24'); px(g, x + 9, top + 3, 1, 2, '#1d1d24');
        px(g, x + 7, top + 5, 2, 1, shade(look.skin));
        if (look.hairLong) { px(g, x + 3, top + 2, 1, 7, hair); px(g, x + 12, top + 2, 1, 7, hair); }
      } else {
        var back = dir === 'left' ? x + 9 : x + 4;
        px(g, back, top + 1, 3, 3, hair);
        px(g, dir === 'left' ? x + 5 : x + 10, top + 3, 1, 2, '#1d1d24');
        if (look.hairLong) px(g, back, top + 2, 3, 7, hair);
      }
    }
    if (look.cap) { px(g, x + 3, top - 2, 10, 3, look.cap); if (dir === 'down') px(g, x + 3, top + 1, 10, 1, shade(look.cap)); }
  }

  function drawBike(g, x, y, dir, step) {
    var frame = '#2a6fb0', tyre = '#1d1d22';
    if (dir === 'left' || dir === 'right') {
      wheel(g, x + 2, y + 18, tyre, step); wheel(g, x + 14, y + 18, tyre, step);
      px(g, x + 3, y + 16, 11, 1, frame); px(g, x + 7, y + 13, 1, 4, frame);
      px(g, dir === 'right' ? x + 12 : x + 3, y + 12, 2, 1, '#333');
    } else {
      px(g, x + 7, y + 13, 2, 9, tyre);
      px(g, x + 7, y + (step ? 14 : 16), 2, 1, '#555');
      px(g, x + 4, y + 13, 8, 1, '#333');
    }
  }

  function wheel(g, cx, cy, c, step) {
    px(g, cx - 2, cy - 3, 4, 1, c); px(g, cx - 2, cy + 2, 4, 1, c);
    px(g, cx - 3, cy - 2, 1, 4, c); px(g, cx + 2, cy - 2, 1, 4, c);
    px(g, cx + (step ? -1 : 0), cy - 1, 1, 2, '#777');
  }

  function shade(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, (n >> 16) - 34), gg = Math.max(0, ((n >> 8) & 255) - 34), b = Math.max(0, (n & 255) - 34);
    return '#' + ((1 << 24) + (r << 16) + (gg << 8) + b).toString(16).slice(1);
  }

  /* ---------- Small props ---------- */

  function lamp(g, x, y, on) {
    px(g, x + 7, y - 10, 2, 22, '#3d4248');
    px(g, x + 5, y - 12, 6, 3, '#2f3338');
    px(g, x + 6, y - 9, 4, 1, on ? '#ffe6a0' : '#8c9196');
  }

  function sign(g, x, y) {
    g.fillStyle = P.shadow; g.beginPath(); g.ellipse(x + 8, y + 15, 6, 2, 0, 0, 7); g.fill();
    px(g, x + 7, y + 7, 2, 8, '#6b4a2b');
    px(g, x + 2, y + 1, 12, 8, '#8a5f35');
    px(g, x + 3, y + 2, 10, 6, '#c49a5c');
    px(g, x + 4, y + 4, 8, 1, '#8a5f35'); px(g, x + 4, y + 6, 6, 1, '#8a5f35');
  }

  function scroll(g, x, y, t) {
    var b = Math.round(Math.sin(t * 4) * 1.5);
    g.fillStyle = P.shadow; g.beginPath(); g.ellipse(x + 8, y + 14, 5, 2, 0, 0, 7); g.fill();
    px(g, x + 4, y + 4 + b, 8, 7, '#f1e6c8');
    px(g, x + 3, y + 3 + b, 10, 2, '#c9a76a'); px(g, x + 3, y + 10 + b, 10, 2, '#c9a76a');
    px(g, x + 5, y + 6 + b, 6, 1, '#8a7650'); px(g, x + 5, y + 8 + b, 4, 1, '#8a7650');
  }

  function cycle(g, x, y) {
    wheel(g, x + 3, y + 12, '#1d1d22', 0); wheel(g, x + 13, y + 12, '#1d1d22', 0);
    px(g, x + 4, y + 10, 9, 1, '#c0392b'); px(g, x + 8, y + 7, 1, 4, '#c0392b');
    px(g, x + 6, y + 6, 4, 1, '#333'); px(g, x + 12, y + 6, 2, 1, '#333');
  }

  window.ART = {
    T: T, CHARS: CHARS, S: S, P: P, hash: hash,
    grass: grass, road: road, path: path, water: water, pitch: pitch, rail: rail, farm: farm, plaza: plaza,
    building: building, tree: tree, person: person, lamp: lamp, sign: sign, scroll: scroll, cycle: cycle,
    edgeShade: edgeShade, px: px
  };
})();
