/* 16-bit pixel art, all drawn in code: the palette, a small rasteriser, and the cached
   sprites (trees, people, lamps, signs, the Main Building tower), each with a dark outline.
   The ground and buildings are drawn from the real map shapes in vector.js.
   Light comes from the upper left. */

(function () {
  'use strict';

  var T = { GRASS: 0, TREE: 1, ROAD: 2, PATH: 3, BUILDING: 4, WATER: 5, PITCH: 6, PARK: 7, RAIL: 8, PLAZA: 9, FARM: 10, SAND: 11 };
  var CHARS = 'gTr.BwpkR=fs';
  var S = 16;

  function hash(x, y, s) {
    var h = (x * 374761393 + y * 668265263 + (s || 0) * 2147483647) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  var cache = {};
  function C(hex) {
    var c = cache[hex];
    if (c) return c;
    var n = parseInt(hex.slice(1), 16);
    c = cache[hex] = [n >> 16, (n >> 8) & 255, n & 255];
    return c;
  }

  /* ---------- Palette: ramps run dark to light ---------- */

  var R = {
    grass: ['#2b4f25', '#386630', '#467f39', '#559542', '#6aab50', '#8cc46a'],
    park: ['#305626', '#3f6f31', '#4f8a3a', '#62a246', '#7cb95a', '#a1d07a'],
    pitch: ['#3a7333', '#478a3c', '#52983f', '#5ea648'],
    leaf: ['#122a17', '#1a3f20', '#24582b', '#317236', '#438c41', '#5fa64e', '#86c36a'],
    bark: ['#33200f', '#4f3219', '#6d4826', '#8b6034'],
    road: ['#363940', '#42464d', '#4e525a', '#5a5e66', '#686c74', '#7a7e86'],
    kerb: ['#5f5e58', '#86857d', '#adaca3', '#cdccc3'],
    dirt: ['#6e5131', '#8a683c', '#a5804d', '#bd9a62', '#d3b47f'],
    pave: ['#8a8173', '#a69d8d', '#bdb4a3', '#d0c8b8'],
    water: ['#173f73', '#1f5290', '#2964a8', '#3779bd', '#5195cf', '#86bde6', '#d2ebf8'],
    rail: ['#5a5148', '#7a7064', '#958a7c', '#b0a596'],
    steel: ['#55595e', '#8d9399', '#c9ced3'],
    wood: ['#3b2412', '#5a3a1f', '#7a522d', '#9c6c3c', '#bd8a50'],
    farm: ['#6f6128', '#8a7a33', '#a39140', '#bfac58'],
    sand: ['#b39c62', '#cdb67e', '#e0cc98'],
    skin: [['#7a4a2c', '#9c6440', '#b98057', '#d29f73'], ['#6a3f25', '#8a5634', '#a76f48', '#c48c62'], ['#8a5a38', '#ad754d', '#c99266', '#e0b08a'], ['#5a341e', '#784729', '#956039', '#b27b50']],
    outline: '#1c1517',
    shadow: [12, 24, 16]
  };

  var BRICK = ['#4f1c13', '#73291c', '#9a3f2a', '#b5543b', '#cf7559'];

  /* ---------- A tiny rasteriser ---------- */

  function Raster(w, h) {
    this.w = w; this.h = h;
    this.img = new ImageData(w, h);
    this.d = this.img.data;
    this.cx0 = 0; this.cy0 = 0; this.cx1 = w; this.cy1 = h;
  }
  Raster.prototype.clip = function (x, y, w, h) { this.cx0 = x; this.cy0 = y; this.cx1 = x + w; this.cy1 = y + h; };
  Raster.prototype.noclip = function () { this.cx0 = 0; this.cy0 = 0; this.cx1 = this.w; this.cy1 = this.h; };
  Raster.prototype.px = function (x, y, hex) {
    x = x | 0; y = y | 0;
    if (x < this.cx0 || y < this.cy0 || x >= this.cx1 || y >= this.cy1) return;
    var c = C(hex), i = (y * this.w + x) * 4, d = this.d;
    d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
  };
  // blend a colour over what is there (for shadows and glows)
  Raster.prototype.pa = function (x, y, rgb, a) {
    x = x | 0; y = y | 0;
    if (x < this.cx0 || y < this.cy0 || x >= this.cx1 || y >= this.cy1) return;
    var i = (y * this.w + x) * 4, d = this.d, da = d[i + 3] / 255;
    if (da === 0) { d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = Math.round(a * 255); return; }
    d[i] = d[i] + (rgb[0] - d[i]) * a; d[i + 1] = d[i + 1] + (rgb[1] - d[i + 1]) * a; d[i + 2] = d[i + 2] + (rgb[2] - d[i + 2]) * a;
    d[i + 3] = Math.min(255, d[i + 3] + a * 255 * (1 - da));
  };
  Raster.prototype.rect = function (x, y, w, h, hex) {
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.px(x + i, y + j, hex);
  };
  Raster.prototype.rectA = function (x, y, w, h, rgb, a) {
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.pa(x + i, y + j, rgb, a);
  };
  Raster.prototype.alpha = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.d[(y * this.w + x) * 4 + 3];
  };
  // a shaded ball lit from the upper left, dithered between tones
  Raster.prototype.ball = function (cx, cy, r, ramp, ry) {
    ry = ry || r;
    for (var y = -ry; y <= ry; y++) for (var x = -r; x <= r; x++) {
      var nx = x / r, ny = y / ry, d = nx * nx + ny * ny;
      if (d > 1) continue;
      var l = -(nx * 0.7 + ny * 0.7) * 0.9 + (1 - d) * 0.35 + (((x + y) & 1) ? 0.08 : -0.08);
      var t = l > 0.62 ? 4 : l > 0.22 ? 3 : l > -0.18 ? 2 : l > -0.55 ? 1 : 0;
      this.px(cx + x, cy + y, ramp[Math.min(ramp.length - 1, t + (ramp.length - 5))]);
    }
  };
  Raster.prototype.ellipseA = function (cx, cy, rx, ry, rgb, a) {
    for (var y = -ry; y <= ry; y++) for (var x = -rx; x <= rx; x++) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) this.pa(cx + x, cy + y, rgb, a);
    }
  };
  Raster.prototype.line = function (x0, y0, x1, y1, hex) {
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (var i = 0; i <= n; i++) this.px(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), hex);
  };
  // dark outline round every opaque shape (not round soft shadows)
  Raster.prototype.outline = function (hex) {
    var w = this.w, h = this.h, d = this.d, mark = [];
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] === 255) continue;
      if (this.alpha(x - 1, y) === 255 || this.alpha(x + 1, y) === 255 || this.alpha(x, y - 1) === 255 || this.alpha(x, y + 1) === 255) mark.push(x, y);
    }
    for (var i = 0; i < mark.length; i += 2) this.px(mark[i], mark[i + 1], hex);
  };
  Raster.prototype.canvas = function () {
    var c = document.createElement('canvas');
    c.width = this.w; c.height = this.h;
    c.getContext('2d').putImageData(this.img, 0, 0);
    return c;
  };

  /* ---------- Sprites ---------- */

  var sprites = {};

  function sprite(key, w, h, draw, outline) {
    var s = sprites[key];
    if (s) return s;
    var r = new Raster(w, h);
    draw(r);
    if (outline !== false) r.outline(R.outline);
    if (r.after) r.after(r);
    s = sprites[key] = r.canvas();
    return s;
  }

  // Trees: 32 x 44, trunk base at (16, 40).
  function treeKind(tx, ty) {
    var v = hash(tx, ty, 130);
    if (v < 0.025) return 'krishnachura';
    if (v < 0.04) return 'radhachura';
    if (v < 0.1) return 'palm';
    if (v < 0.45) return 'mango';
    return 'round' + (v > 0.75 ? 'B' : 'A');
  }

  function treeSprite(tx, ty) {
    var kind = treeKind(tx, ty);
    var variant = Math.floor(hash(tx, ty, 131) * 3);
    return sprite('tree:' + kind + variant, 32, 44, function (r) {
      var Bk = R.bark;
      r.after = function (rr) { rr.ellipseA(18, 41, 10, 3, R.shadow, 0.3); };
      if (kind === 'palm') {
        // a curved coconut palm
        var lean = variant - 1;
        for (var y = 40; y > 12; y--) {
          var x = 16 + Math.round(lean * Math.pow((40 - y) / 28, 2) * 4);
          r.rect(x - 1, y, 3, 1, (y % 3) ? Bk[2] : Bk[1]);
          r.px(x - 1, y, Bk[3]);
        }
        var cx = 16 + lean * 4, cy = 12;
        var L = R.leaf;
        [[-12, 4], [-9, -4], [-3, -8], [4, -8], [10, -4], [12, 5], [0, 6]].forEach(function (d, i) {
          for (var k = 0; k <= 10; k++) {
            var t = k / 10, x2 = Math.round(cx + d[0] * t), y2 = Math.round(cy + d[1] * t + Math.pow(t, 2) * 5);
            r.px(x2, y2, L[4]); r.px(x2, y2 + 1, L[2]);
            if (k % 2 === 0 && k > 2) { r.px(x2 + (d[0] > 0 ? 0 : 0), y2 + 2, L[3]); }
          }
          if (i === 2) r.px(cx - 1, cy - 1, L[5]);
        });
        r.ball(cx - 1, cy + 2, 2, ['#3b2412', '#5a3a1f', '#7a522d', '#9c6c3c', '#bd8a50']);
        r.ball(cx + 2, cy + 2, 2, ['#3b2412', '#5a3a1f', '#7a522d', '#9c6c3c', '#bd8a50']);
        return;
      }
      // trunk
      r.rect(14, 26, 4, 15, Bk[2]); r.rect(14, 26, 1, 15, Bk[3]); r.rect(17, 26, 1, 15, Bk[1]);
      r.px(13, 40, Bk[1]); r.px(18, 40, Bk[1]);
      var Lf = R.leaf;
      if (kind === 'krishnachura') Lf = ['#4a120a', '#7a1d10', '#a92c15', '#d0421d', '#e8642c', '#f4904a', '#ffc07a'];
      if (kind === 'radhachura') Lf = ['#5a3e08', '#7f5a0c', '#a77c12', '#c99c1e', '#e4bd36', '#f2d65c', '#fff0a0'];
      if (kind === 'mango') Lf = ['#0d2412', '#14361a', '#1c4a22', '#265f2b', '#357637', '#4d9046', '#6daa5c'];
      var big = kind === 'roundB' || kind === 'mango';
      var top = big ? 6 : 10;
      r.ball(16, top + 13, big ? 12 : 10, Lf, big ? 10 : 9);
      r.ball(10 + variant, top + 12, 7, Lf);
      r.ball(22 - variant, top + 11, 7, Lf);
      r.ball(15, top + 6, 8, Lf, 7);
      if (kind === 'krishnachura' || kind === 'radhachura') {
        // a few green leaves peeking through the blossom
        for (var g = 0; g < 9; g++) r.px(6 + Math.floor(hash(g, variant, 3) * 20), top + 4 + Math.floor(hash(g, variant, 4) * 16), R.leaf[3 + (g % 2)]);
      } else {
        for (var h2 = 0; h2 < 6; h2++) r.px(9 + Math.floor(hash(h2, variant, 5) * 12), top + 3 + Math.floor(hash(h2, variant, 6) * 9), Lf[6]);
      }
    });
  }

  /* People: 18 x 27 sprite, feet at (9, 25).
     look: {skin (hex or index), hair, shirt, pants, hairLong, cap, tie, bag, kurta, saree} */
  function shade(hex, k) {
    var c = C(hex);
    var f = function (v) { return Math.max(0, Math.min(255, Math.round(v * k))); };
    return '#' + ((1 << 24) + (f(c[0]) << 16) + (f(c[1]) << 8) + f(c[2])).toString(16).slice(1);
  }
  function skinRamp(look) {
    if (typeof look.skin === 'number') return R.skin[look.skin % R.skin.length];
    var b = look.skin;
    return [shade(b, 0.62), shade(b, 0.8), b, shade(b, 1.12)];
  }

  function personSprite(look, dir, frame, bike) {
    var key = 'p:' + JSON.stringify(look) + dir + frame + (bike ? 'b' : '');
    return sprite(key, 22, 28, function (r) {
      r.after = function (rr) { rr.ellipseA(11, 26, bike ? 9 : 5, 1, R.shadow, 0.35); };
      drawPerson(r, look, dir, frame, bike);
    });
  }

  function drawPerson(r, look, dir, frame, bike) {
    var ox = 3, sk = skinRamp(look);
    var hair = look.hair, hairHi = shade(hair, 1.6), hairLo = shade(hair, 0.7);
    var sh = look.shirt, shHi = shade(sh, 1.15), shLo = shade(sh, 0.75);
    var pa = look.pants, paLo = shade(pa, 0.72);
    var walk = !bike && (frame === 1 || frame === 3);
    var bob = walk ? 1 : 0;
    var side = dir === 'left' || dir === 'right';
    var flip = dir === 'left';
    var X = function (x) { return flip ? ox + 15 - x : ox + x; };
    var P = function (x, y, c) { r.px(X(x), y, c); };
    var RR = function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) P(x + i, y + j, c); };
    var top = 2 + bob + (bike ? 1 : 0);

    if (bike) drawBikeUnder(r, dir, frame, X);

    // legs and shoes
    var shoe = '#2a2119';
    if (look.saree) {
      RR(4, top + 14, 8, 8, sh); RR(4, top + 14, 1, 8, shHi); RR(10, top + 14, 2, 8, shLo);
      RR(4, top + 21, 8, 1, shLo);
      if (!bike) { P(5, top + 22, shoe); P(10, top + 22, shoe); }
    } else if (bike) {
      var up = frame % 2;
      RR(5, top + 14, 2, 4 - up * 2, pa); RR(9, top + 14, 2, 2 + up * 2, pa);
      P(5, top + 18 - up * 2, shoe); P(9, top + 16 + up * 2, shoe);
    } else if (side) {
      var a = frame === 1 ? 2 : frame === 3 ? -2 : 0;
      RR(6 + a, top + 15, 2, 6, pa); RR(8 - a, top + 15, 2, 6, paLo);
      RR(6 + a, top + 21, 3, 1, shoe); RR(8 - a, top + 21, 3, 1, shoe);
    } else {
      var l = frame === 1 ? 1 : 0, rr = frame === 3 ? 1 : 0;
      RR(5, top + 15, 3, 6 - l, pa); RR(8, top + 15, 3, 6 - rr, paLo);
      RR(5, top + 15, 1, 6 - l, shade(pa, 1.15));
      RR(5, top + 21 - l, 3, 1, shoe); RR(8, top + 21 - rr, 3, 1, shoe);
    }

    // torso
    var bodyH = look.kurta ? 9 : 7;
    RR(4, top + 9, 8, bodyH, sh);
    RR(4, top + 9, 1, bodyH, shHi);
    RR(10, top + 9, 2, bodyH, shLo);
    RR(4, top + 8 + bodyH, 8, 1, shLo);
    if (!look.kurta && !look.saree) RR(4, top + 15, 8, 1, '#3a2c22');   // belt
    if (dir === 'down') {
      P(7, top + 9, sk[1]); P(8, top + 9, sk[1]);                       // neck
      if (!look.saree) { P(6, top + 9, shHi); P(9, top + 9, shHi); }   // collar
      if (look.tie) { RR(7, top + 10, 2, 5, look.tie); P(7, top + 10, shade(look.tie, 1.3)); }
      if (look.saree) { P(5, top + 10, shLo); P(6, top + 11, shLo); P(7, top + 12, shLo); P(8, top + 13, shLo); P(9, top + 14, shLo); }
    }
    if (look.bag && (dir === 'up' || side)) {
      var bg = look.bag;
      if (dir === 'up') { RR(5, top + 10, 6, 6, bg); RR(5, top + 10, 6, 1, shade(bg, 1.25)); RR(5, top + 15, 6, 1, shade(bg, 0.7)); }
      else { RR(2, top + 10, 2, 5, bg); P(2, top + 10, shade(bg, 1.25)); }
    }

    // arms
    var swing = walk ? (frame === 1 ? 1 : -1) : 0;
    if (side) {
      RR(7 - swing, top + 10, 2, 5, shLo); P(7 - swing, top + 15, sk[2]); P(8 - swing, top + 15, sk[1]);
    } else if (bike) {
      RR(3, top + 10, 1, 4, shLo); RR(12, top + 10, 1, 4, shLo); P(3, top + 14, sk[2]); P(12, top + 14, sk[2]);
    } else {
      RR(3, top + 10 + Math.max(0, swing), 1, 5, shHi); RR(12, top + 10 + Math.max(0, -swing), 1, 5, shLo);
      P(3, top + 15 + Math.max(0, swing), sk[2]); P(12, top + 15 + Math.max(0, -swing), sk[1]);
    }

    // head: 10 wide, 8 tall
    RR(3, top + 1, 10, 8, sk[2]);
    RR(3, top + 1, 1, 8, sk[3]);
    RR(11, top + 1, 2, 8, sk[1]);
    RR(4, top + 8, 8, 1, sk[1]);
    if (dir === 'up') {
      RR(3, top, 10, 7, hair); RR(4, top, 6, 1, hairHi); RR(3, top + 6, 10, 1, hairLo);
      if (look.hairLong) { RR(3, top + 7, 10, 4, hair); RR(4, top + 10, 8, 1, hairLo); }
    } else if (side) {
      RR(3, top, 10, 3, hair); RR(4, top, 5, 1, hairHi);
      RR(3, top + 3, 4, 3, hair);                // back of the head
      P(9, top + 4, '#ffffff'); P(10, top + 4, '#1d1d24'); P(10, top + 5, '#1d1d24');
      P(12, top + 5, sk[1]); P(12, top + 6, sk[2]);   // nose
      P(10, top + 7, sk[0]);
      if (look.hairLong) RR(3, top + 3, 3, 8, hair);
    } else {
      RR(3, top, 10, 3, hair); RR(5, top, 5, 1, hairHi);
      P(3, top + 3, hair); P(12, top + 3, hair); P(3, top + 4, hairLo); P(12, top + 4, hairLo);
      P(5, top + 3, hair); P(9, top + 3, hair);   // fringe
      P(5, top + 5, '#1d1d24'); P(10, top + 5, '#1d1d24'); P(5, top + 4, '#ffffff'); P(10, top + 4, '#ffffff');
      P(7, top + 7, sk[0]); P(8, top + 7, sk[0]);
      if (look.hairLong) { RR(2, top + 2, 1, 8, hair); RR(13, top + 2, 1, 8, hair); }
    }
    if (look.cap) {
      RR(3, top - 1, 10, 3, look.cap); RR(3, top - 1, 10, 1, shade(look.cap, 1.3));
      if (dir === 'down') RR(2, top + 2, 12, 1, shade(look.cap, 0.7));
      if (side) RR(10, top + 2, 4, 1, shade(look.cap, 0.7));
    }
    if (look.saree && dir !== 'up') { RR(11, top + 9, 2, 7, shLo); }
    if (look.saree && dir === 'up') { RR(4, top + 7, 8, 3, sh); }
  }

  function drawBikeUnder(r, dir, frame, X) {
    var fr = '#2a6fb0', frHi = '#5a9ad6', tyre = '#1b1b20', spoke = '#9a9ea4';
    var y0 = 2;
    if (dir === 'left' || dir === 'right') {
      wheel(r, X(1) + (dir === 'left' ? -3 : 0), 20 + y0, frame, tyre, spoke);
      wheel(r, X(14) + (dir === 'left' ? -3 : 0), 20 + y0, frame, tyre, spoke);
      r.line(X(3), 19 + y0, X(12), 19 + y0, fr);
      r.line(X(6), 14 + y0, X(3), 19 + y0, fr);
      r.line(X(6), 14 + y0, X(10), 19 + y0, frHi);
      r.line(X(12), 13 + y0, X(13), 19 + y0, fr);
      r.px(X(11), 12 + y0, '#333'); r.px(X(12), 12 + y0, '#333'); r.px(X(13), 12 + y0, '#333');
      r.px(X(5), 13 + y0, '#3a2c22'); r.px(X(6), 13 + y0, '#3a2c22'); r.px(X(7), 13 + y0, '#3a2c22');
    } else {
      // seen end-on: a narrow wheel and the handlebar
      for (var y = 15; y < 25; y++) { r.px(10, y + y0 - 2, tyre); r.px(11, y + y0 - 2, (y + frame) % 3 ? tyre : '#3a3a40'); }
      r.line(5, 13 + y0, 16, 13 + y0, '#333');
      r.px(10, 12 + y0, fr); r.px(11, 12 + y0, fr);
    }
  }

  function wheel(r, cx, cy, frame, tyre, spoke) {
    for (var a = 0; a < 24; a++) {
      var t = a / 24 * Math.PI * 2;
      r.px(Math.round(cx + Math.cos(t) * 3.5), Math.round(cy + Math.sin(t) * 3.5), tyre);
    }
    var t0 = frame * Math.PI / 4;
    for (var k = 0; k < 2; k++) {
      var tt = t0 + k * Math.PI / 2;
      r.px(Math.round(cx + Math.cos(tt) * 2), Math.round(cy + Math.sin(tt) * 2), spoke);
      r.px(Math.round(cx - Math.cos(tt) * 2), Math.round(cy - Math.sin(tt) * 2), spoke);
    }
    r.px(cx, cy, '#cfd3d8');
  }

  // Lamp post: 10 x 30, base at (5, 28).
  function lampSprite(on) {
    return sprite('lamp' + (on ? 1 : 0), 10, 30, function (r) {
      r.after = function (rr) { rr.ellipseA(6, 28, 3, 1, R.shadow, 0.3); };
      r.rect(4, 6, 2, 22, '#3a4046'); r.rect(4, 6, 1, 22, '#5c646b');
      r.rect(3, 26, 4, 2, '#2c3136');
      r.rect(2, 2, 6, 4, on ? '#ffe7a3' : '#a3acb2');
      r.rect(2, 2, 6, 1, on ? '#fff6d6' : '#c8d0d5');
      r.rect(1, 1, 8, 1, '#2c3136'); r.rect(3, 0, 4, 1, '#2c3136');
      r.rect(2, 6, 6, 1, '#2c3136');
    });
  }

  // Notice board: 20 x 20, base at (10, 18).
  function signSprite() {
    return sprite('sign', 20, 20, function (r) {
      r.after = function (rr) { rr.ellipseA(11, 18, 7, 1, R.shadow, 0.3); };
      var Wd = R.wood;
      r.rect(4, 9, 2, 9, Wd[1]); r.rect(14, 9, 2, 9, Wd[1]); r.px(4, 9, Wd[3]); r.px(14, 9, Wd[3]);
      r.rect(2, 2, 16, 9, Wd[2]);
      r.rect(2, 2, 16, 1, Wd[4]); r.rect(2, 5, 16, 1, Wd[1]); r.rect(2, 8, 16, 1, Wd[1]);
      r.rect(4, 3, 12, 6, '#efe3c4');
      r.rect(5, 4, 9, 1, '#9a8a6a'); r.rect(5, 6, 7, 1, '#9a8a6a');
      r.rect(1, 1, 18, 1, '#4a2e17');
    });
  }

  // Parchment: 14 x 14
  function scrollSprite() {
    return sprite('scroll', 14, 14, function (r) {
      r.rect(3, 2, 8, 10, '#f3e8cb'); r.rect(3, 2, 1, 10, '#fff8e6'); r.rect(10, 2, 1, 10, '#d8c79f');
      r.rect(2, 1, 10, 2, '#c49a52'); r.rect(2, 11, 10, 2, '#c49a52'); r.rect(2, 1, 10, 1, '#e0bb72');
      r.rect(5, 5, 4, 1, '#8a7650'); r.rect(5, 7, 3, 1, '#8a7650');
      r.rect(6, 9, 2, 3, '#b0302a');
    });
  }

  // The Main Building's tower: 28 x 52, base at (14, 50).
  function towerSprite() {
    return sprite('tower', 28, 52, function (r) {
      var B = BRICK, trim = '#ece2d2';
      r.rect(4, 12, 20, 38, B[2]);
      for (var y = 12; y < 50; y += 3) { r.rect(4, y, 20, 1, B[1]); }
      r.rect(4, 12, 2, 38, B[3]); r.rect(21, 12, 3, 38, B[1]);
      r.rect(2, 8, 24, 4, trim); r.rect(2, 8, 24, 1, '#ffffff'); r.rect(2, 11, 24, 1, '#b9ad9b');
      r.rect(6, 2, 16, 6, B[2]); r.rect(6, 2, 16, 1, B[4]); r.rect(5, 1, 18, 1, trim);
      for (var k = 0; k < 4; k++) { r.rect(8 + k * 4, 3, 2, 4, '#2f4561'); }
      [16, 26, 36].forEach(function (y2) {
        r.rect(9, y2, 4, 7, '#2f4561'); r.rect(15, y2, 4, 7, '#2f4561');
        r.rect(9, y2, 4, 1, '#8fb3cc'); r.rect(15, y2, 4, 1, '#8fb3cc');
        r.rect(8, y2 + 7, 12, 1, trim);
      });
      r.rect(13, 0, 2, 2, '#e0452f');
      r.rect(3, 46, 22, 4, trim);
    });
  }

  window.ART = {
    T: T, CHARS: CHARS, S: S, R: R, hash: hash, Raster: Raster,
    treeSprite: treeSprite, personSprite: personSprite, lampSprite: lampSprite,
    signSprite: signSprite, scrollSprite: scrollSprite, towerSprite: towerSprite,
    WINDOW_LIT: '#ffd77a'
  };
})();
