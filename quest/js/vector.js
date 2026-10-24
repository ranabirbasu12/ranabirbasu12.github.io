/* The campus drawn from its real shapes.
   Roads are smooth polylines at their true paths, areas are filled polygons, and every
   building is its real footprint extruded into a 2.5D volume: front walls with windows
   floor by floor, a roof with a parapet, and a shadow on the ground. Collision and the
   road network for walkers come from the same shapes. World units are pixels (16 per tile). */

(function () {
  'use strict';

  var A = window.ART, S = A.S, R = A.R, hash = A.hash;
  var MAP = window.KGP_MAP;
  var WPX = MAP.w * S, HPX = MAP.h * S;
  var CHUNK = 256;
  var NBX = Math.ceil(WPX / CHUNK), NBY = Math.ceil(HPX / CHUNK);
  var OVERRIDES = window.KGP_BUILDINGS || {};

  var rgbCache = {};
  function rgb(hex) {
    var c = rgbCache[hex];
    if (c) return c;
    var n = parseInt(hex.slice(1), 16);
    return (rgbCache[hex] = [n >> 16, (n >> 8) & 255, n & 255]);
  }

  /* ---------- Geometry ---------- */

  function px(pts) { return pts.map(function (q) { return [q[0] * S, q[1] * S, q[2]]; }); }
  function bboxOf(pts, pad) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach(function (q) { if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; });
    pad = pad || 0;
    return [x0 - pad, y0 - pad, x1 + pad, y1 + pad];
  }
  function polyArea(p) {
    var a = 0;
    for (var i = 0; i < p.length; i++) { var q = p[i], r = p[(i + 1) % p.length]; a += q[0] * r[1] - r[0] * q[1]; }
    return a / 2;
  }
  function inside(x, y, p) {
    var c = false;
    for (var i = 0, j = p.length - 1; i < p.length; j = i++) {
      var a = p[i], b = p[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }
  function segDist2(x, y, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy, t = L ? ((x - ax) * dx + (y - ay) * dy) / L : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var ex = ax + dx * t - x, ey = ay + dy * t - y;
    return ex * ex + ey * ey;
  }
  // nearest edge distance and its index
  function edgeDist(x, y, p) {
    var best = 1e9, bi = 0;
    for (var i = 0; i < p.length; i++) {
      var a = p[i], b = p[(i + 1) % p.length], d = segDist2(x, y, a[0], a[1], b[0], b[1]);
      if (d < best) { best = d; bi = i; }
    }
    return [Math.sqrt(best), bi];
  }
  // scanline fill; calls fn(x, y) for every pixel whose centre is inside, clipped to [cx0,cy0,cx1,cy1)
  function fillPoly(p, cx0, cy0, cx1, cy1, fn) {
    var bb = bboxOf(p);
    var y0 = Math.max(cy0, Math.floor(bb[1])), y1 = Math.min(cy1 - 1, Math.ceil(bb[3]));
    var xs = [];
    for (var y = y0; y <= y1; y++) {
      var cy = y + 0.5;
      xs.length = 0;
      for (var i = 0, j = p.length - 1; i < p.length; j = i++) {
        var a = p[i], b = p[j];
        if ((a[1] <= cy && b[1] > cy) || (b[1] <= cy && a[1] > cy)) xs.push(a[0] + (cy - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
      xs.sort(function (m, n) { return m - n; });
      for (var k = 0; k + 1 < xs.length; k += 2) {
        var xa = Math.max(cx0, Math.ceil(xs[k] - 0.5)), xb = Math.min(cx1 - 1, Math.floor(xs[k + 1] - 0.5));
        for (var x = xa; x <= xb; x++) fn(x, y);
      }
    }
  }
  // thick polyline: fn(x, y, t, segIndex) for every pixel within hw of the line
  function stroke(p, hw, cx0, cy0, cx1, cy1, fn) {
    var h2 = hw * hw;
    for (var i = 0; i + 1 < p.length; i++) {
      var a = p[i], b = p[i + 1];
      var x0 = Math.max(cx0, Math.floor(Math.min(a[0], b[0]) - hw)), x1 = Math.min(cx1 - 1, Math.ceil(Math.max(a[0], b[0]) + hw));
      var y0 = Math.max(cy0, Math.floor(Math.min(a[1], b[1]) - hw)), y1 = Math.min(cy1 - 1, Math.ceil(Math.max(a[1], b[1]) + hw));
      if (x0 > x1 || y0 > y1) continue;
      var dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
      for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
        var qx = x + 0.5, qy = y + 0.5;
        var t = L ? ((qx - a[0]) * dx + (qy - a[1]) * dy) / L : 0;
        var tc = t < 0 ? 0 : t > 1 ? 1 : t;
        var ex = a[0] + dx * tc - qx, ey = a[1] + dy * tc - qy;
        if (ex * ex + ey * ey <= h2) fn(x, y, t, i);
      }
    }
  }

  /* ---------- Features ---------- */

  var FOOT = { footway: 1, path: 1, pedestrian: 1, cycleway: 1, steps: 1, track: 1 };
  var roads = MAP.roads.map(function (r, i) { return { i: i, c: r.c, w: r.w, foot: !!FOOT[r.c], bridge: !!r.b, p: px(r.p) }; });
  var rails = MAP.rails.map(px);
  var ORDER = { farm: 1, park: 2, pitch: 3, water: 4, forest: 5 };   // woods last: TSG Lake's island sits on the water
  var areas = MAP.areas.map(function (a) { var p = px(a.p); return { k: a.k, p: p, pond: a.k === 'water' && Math.abs(polyArea(p)) > 40 * 256 }; }).sort(function (a, b) { return ORDER[a.k] - ORDER[b.k]; });
  // extra ground features from buildings.js: running tracks and the like
  var tracks = (window.KGP_AREAS || []).map(function (t) {
    var sc = function (r) { return r ? [r[0] * S, r[1] * S, r[2] * S, r[3] * S, (r[4] || 0) * S, (r[5] === undefined ? (r[4] || 0) : r[5]) * S] : null; };
    return { k: t.k, outer: sc(t.outer), inner: sc(t.inner) };
  });
  // signed distance to a rounded rectangle [x0, y0, x1, y1, radiusTop, radiusBottom]
  function rrDist(x, y, q) {
    var cx = (q[0] + q[2]) / 2, cy = (q[1] + q[3]) / 2, hx = (q[2] - q[0]) / 2, hy = (q[3] - q[1]) / 2;
    var r = Math.min(y < cy ? q[4] : q[5], hx, hy);
    var dx = Math.abs(x - cx) - (hx - r), dy = Math.abs(y - cy) - (hy - r);
    return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - r;
  }

  var FLOOR = 11;    // pixels per storey: taller than true scale, as RPGs do
  // where a landmark's door really is (e.g. the Main Building's entrance faces GolC, to the west)
  var MOVES = window.KGP_LANDMARKS || {};
  Object.keys(MOVES).forEach(function (k) { var l = MAP.landmarks[k]; if (l) { l.x = MOVES[k][0]; l.y = MOVES[k][1]; } });
  var landmarkByBid = {};
  Object.keys(MAP.landmarks).forEach(function (k) { var l = MAP.landmarks[k]; if (l.bid) landmarkByBid[l.bid] = { key: k, l: l }; });

  function makeBuilding(id, osm, name, ptsTiles, lv, o, lm) {
    var sh = o.shift || [0, 0];
    var p = ptsTiles.map(function (q) { return [(q[0] + sh[0]) * S, (q[1] + sh[1]) * S]; });
    if (polyArea(p) < 0) p.reverse();             // clockwise on screen (y down)
    var m2 = Math.abs(polyArea(p)) / 4;            // 2 px per metre
    var hall = /Hall/i.test(name);
    var floors = o.floors || lv || (hall ? 4 : m2 < 140 ? 1 : m2 < 450 ? 2 : 3);
    floors = Math.max(1, Math.min(floors, 10));
    var hs = hash(id, 7, 1);
    return {
      id: id, osm: osm, name: name, p: p, bb: bboxOf(p), floors: floors,
      h: floors * FLOOR + 3,
      ring: o.ring ? o.ring * 2 : 0,               // courtyard: keep a band this many metres deep
      wall: o.wall || (o.brick ? 'brick' : ['cream', 'butter', 'blush', 'white', 'sage'][Math.floor(hash(id, 1, 11) * 5)]),
      roof: o.roof || (hs < 0.04 && !hall ? 'tile' : m2 > 900 && hash(id, 6, 16) < 0.45 ? 'solar' : ['concrete', 'warm', 'grey'][Math.floor(hash(id, 2, 12) * 3)]),
      accents: (o.roofAccents || []).map(function (q) { return [q[0] * S, q[1] * S, q[2] * S, q[3] * S, q[4] || 'tile']; }),
      fan: o.fanCenter ? [o.fanCenter[0] * S, o.fanCenter[1] * S] : null,
      towerAt: o.towerAt ? [o.towerAt[0] * S, o.towerAt[1] * S] : null,
      shutters: o.shutters !== undefined ? o.shutters : (hall || hash(id, 5, 15) < 0.3),
      tower: !!(o.tower || o.towerAt),
      door: lm && lm.l.x !== undefined ? { x: lm.l.x * S + 8, y: lm.l.y * S } : null
    };
  }
  var buildings = [];
  MAP.buildings.forEach(function (b) {
    var name = MAP.buildingNames[b.id] || '';
    var lm = landmarkByBid[b.id];
    var o = OVERRIDES[b.osm] || (lm && OVERRIDES[lm.key]) || {};
    if (o.hide) return;
    buildings.push(makeBuilding(b.id, b.osm, o.name || name, b.p, b.lv, o, lm));
  });
  // buildings traced from imagery where the map has none
  (window.KGP_EXTRA_BUILDINGS || []).forEach(function (e, i) {
    var pts = e.p;
    if (e.rect) pts = [[e.rect[0], e.rect[1]], [e.rect[2], e.rect[1]], [e.rect[2], e.rect[3]], [e.rect[0], e.rect[3]]];
    if (e.circle || e.sector) {
      // circle [cx, cy, r] or sector [cx, cy, r, fromDeg, toDeg] (0 = east, 90 = south)
      var c = e.circle || e.sector, a0 = e.sector ? c[3] : 0, a1 = e.sector ? c[4] : 360, n = 28;
      pts = e.sector && !c[5] ? [[c[0], c[1]]] : [];
      for (var k = 0; k <= n; k++) { var a = (a0 + (a1 - a0) * k / n) * Math.PI / 180; pts.push([c[0] + Math.cos(a) * c[2], c[1] + Math.sin(a) * c[2]]); }
      if (e.sector && c[5]) for (var k2 = n; k2 >= 0; k2--) { var a2 = (a0 + (a1 - a0) * k2 / n) * Math.PI / 180; pts.push([c[0] + Math.cos(a2) * c[5], c[1] + Math.sin(a2) * c[5]]); }
      if (!e.sector) pts.pop();
      if (e.sector && !e.fanCenter) e.fanCenter = [c[0], c[1]];
    }
    buildings.push(makeBuilding(10000 + i, 'extra' + i, e.name || '', pts, null, e, null));
  });
  var byId = {};
  buildings.forEach(function (b) { byId[b.id] = b; });

  // The footprint as a pixel mask, so courtyards and odd shapes extrude correctly.
  function maskOf(b) {
    if (b.mask) return b.mask;
    var x0 = Math.floor(b.bb[0]) - 1, y0 = Math.floor(b.bb[1]) - 1;
    var w = Math.ceil(b.bb[2]) - x0 + 2, h = Math.ceil(b.bb[3]) - y0 + 2;
    var m = new Uint8Array(w * h);
    fillPoly(b.p, x0, y0, x0 + w, y0 + h, function (x, y) { m[(y - y0) * w + (x - x0)] = 1; });
    var dist = chamfer(m, w, h);
    if (b.ring) for (var i = 0; i < m.length; i++) if (m[i] && dist[i] > b.ring) m[i] = 0;
    if (b.ring) dist = chamfer(m, w, h);
    b.mask = { x0: x0, y0: y0, w: w, h: h, m: m, d: dist };
    return b.mask;
  }
  // distance (px) from each inside pixel to the nearest outside pixel
  function chamfer(m, w, h) {
    var d = new Float32Array(w * h), INF = 1e6, i, x, y;
    for (i = 0; i < m.length; i++) d[i] = m[i] ? INF : 0;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      i = y * w + x; if (!d[i]) continue;
      var v = d[i];
      if (x > 0) v = Math.min(v, d[i - 1] + 1);
      if (y > 0) { v = Math.min(v, d[i - w] + 1); if (x > 0) v = Math.min(v, d[i - w - 1] + 1.414); if (x < w - 1) v = Math.min(v, d[i - w + 1] + 1.414); }
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) v = Math.min(v, 1);
      d[i] = v;
    }
    for (y = h - 1; y >= 0; y--) for (x = w - 1; x >= 0; x--) {
      i = y * w + x; if (!d[i]) continue;
      var u = d[i];
      if (x < w - 1) u = Math.min(u, d[i + 1] + 1);
      if (y < h - 1) { u = Math.min(u, d[i + w] + 1); if (x < w - 1) u = Math.min(u, d[i + w + 1] + 1.414); if (x > 0) u = Math.min(u, d[i + w - 1] + 1.414); }
      d[i] = u;
    }
    return d;
  }
  function inMask(b, x, y) {
    var M = maskOf(b), lx = (x | 0) - M.x0, ly = (y | 0) - M.y0;
    return lx >= 0 && ly >= 0 && lx < M.w && ly < M.h && M.m[ly * M.w + lx] === 1;
  }

  /* ---------- Spatial bins ---------- */

  function bins() { var a = []; for (var i = 0; i < NBX * NBY; i++) a.push([]); return a; }
  function addToBins(list, item, bb) {
    var x0 = Math.max(0, Math.floor(bb[0] / CHUNK)), x1 = Math.min(NBX - 1, Math.floor(bb[2] / CHUNK));
    var y0 = Math.max(0, Math.floor(bb[1] / CHUNK)), y1 = Math.min(NBY - 1, Math.floor(bb[3] / CHUNK));
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) list[y * NBX + x].push(item);
  }
  var bRoad = bins(), bArea = bins(), bRail = bins(), bShadow = bins(), bBuild = bins(), bTree = bins(), bName = bins();
  roads.forEach(function (r) { addToBins(bRoad, r, bboxOf(r.p, r.w / 2 + 4)); });
  areas.forEach(function (a) { addToBins(bArea, a, bboxOf(a.p, 2)); });
  rails.forEach(function (p) { addToBins(bRail, p, bboxOf(p, 8)); });
  buildings.forEach(function (b) {
    var sx = b.h * 0.55, sy = b.h * 0.3;
    addToBins(bShadow, b, [b.bb[0], b.bb[1], b.bb[2] + sx, b.bb[3] + sy]);
    addToBins(bBuild, b, [b.bb[0], b.bb[1] - b.h - 50, b.bb[2], b.bb[3]]);
    if (b.name) addToBins(bName, b, [b.bb[0] - 16, b.bb[1] - 16, b.bb[2] + 16, b.bb[3] + 16]);
  });

  /* ---------- Collision (4 px cells) and road mask ---------- */

  var CELL = 4, CW = Math.ceil(WPX / CELL), CHH = Math.ceil(HPX / CELL);
  var solid = new Uint8Array(CW * CHH);     // 1 wall/water, 2 rail, 3 tree
  var roadMask = new Uint8Array(CW * CHH);
  function cellPoly(p) { return p.map(function (q) { return [q[0] / CELL, q[1] / CELL]; }); }
  buildings.forEach(function (b) {
    var M = maskOf(b);
    for (var cy = Math.floor(M.y0 / CELL); cy <= Math.floor((M.y0 + M.h) / CELL); cy++)
      for (var cx = Math.floor(M.x0 / CELL); cx <= Math.floor((M.x0 + M.w) / CELL); cx++) {
        if (cx < 0 || cy < 0 || cx >= CW || cy >= CHH) continue;
        if (inMask(b, cx * CELL + 2, cy * CELL + 2)) solid[cy * CW + cx] = 1;
      }
  });
  areas.forEach(function (a) { if (a.k === 'water') fillPoly(cellPoly(a.p), 0, 0, CW, CHH, function (x, y) { solid[y * CW + x] = 1; }); });
  areas.forEach(function (a) { if (a.k === 'forest') fillPoly(cellPoly(a.p), 0, 0, CW, CHH, function (x, y) { if (solid[y * CW + x] === 1) solid[y * CW + x] = 0; }); });
  rails.forEach(function (p) { stroke(cellPoly(p), 1.4, 0, 0, CW, CHH, function (x, y) { if (!solid[y * CW + x]) solid[y * CW + x] = 2; }); });
  roads.forEach(function (r) {
    stroke(cellPoly(r.p), (r.w / 2 + 2) / CELL, 0, 0, CW, CHH, function (x, y) {
      var i = y * CW + x;
      roadMask[i] = r.foot ? 2 : 1;
      if (solid[i] === 2) solid[i] = 0;        // level crossings and bridges
    });
  });
  for (var ex = 0; ex < CW; ex++) { solid[ex] = 1; solid[(CHH - 1) * CW + ex] = 1; }
  for (var ey = 0; ey < CHH; ey++) { solid[ey * CW] = 1; solid[ey * CW + CW - 1] = 1; }

  function solidPx(x, y) {
    var cx = x >> 2, cy = y >> 2;
    if (cx < 0 || cy < 0 || cx >= CW || cy >= CHH) return true;
    return solid[cy * CW + cx] !== 0;
  }
  function onRoad(x, y) { var cx = x >> 2, cy = y >> 2; return cx >= 0 && cy >= 0 && cx < CW && cy < CHH && roadMask[cy * CW + cx] !== 0; }

  /* ---------- Trees and lamps ---------- */

  var lamps = [];
  roads.forEach(function (r, ri) {
    if (r.foot || r.w < 18) return;
    var acc = 30 + hash(ri, 1, 77) * 40, side = ri % 2 ? 1 : -1;
    for (var i = 0; i + 1 < r.p.length; i++) {
      var a = r.p[i], b = r.p[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      while (acc < L) {
        var t = acc / L, nx = -dy / L * side, ny = dx / L * side, off = r.w / 2 + 6;
        var x = Math.round(a[0] + dx * t + nx * off), y = Math.round(a[1] + dy * t + ny * off);
        if (!solidPx(x, y) && !onRoad(x, y) && !lamps.some(function (l) { return Math.abs(l.x - x) < 40 && Math.abs(l.y - y) < 40; })) lamps.push({ x: x, y: y });
        acc += 80;
      }
      acc -= L;
    }
  });

  function field(x, y) {
    var fx = x / 64, fy = y / 64, ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy;
    u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v);
    var a = hash(ix, iy, 5), b = hash(ix + 1, iy, 5), c = hash(ix, iy + 1, 5), d = hash(ix + 1, iy + 1, 5);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }

  var trees = [];
  (function () {
    // playing fields and farms stay open
    var open = new Uint8Array(CW * CHH);
    areas.forEach(function (a) { if (a.k === 'pitch' || a.k === 'farm') fillPoly(cellPoly(a.p), 0, 0, CW, CHH, function (x, y) { open[y * CW + x] = 1; }); });
    tracks.forEach(function (t) {
      if (!t.outer) return;
      for (var cy = Math.floor(t.outer[1] / CELL); cy < Math.ceil(t.outer[3] / CELL); cy++)
        for (var cx = Math.floor(t.outer[0] / CELL); cx < Math.ceil(t.outer[2] / CELL); cx++)
          if (cx >= 0 && cy >= 0 && cx < CW && cy < CHH && rrDist(cx * CELL + 2, cy * CELL + 2, t.outer) <= 2) open[cy * CW + cx] = 1;
    });
    function free(x, y, pad) {
      var c0 = (x - pad) >> 2, c1 = (x + pad) >> 2, r0 = (y - pad) >> 2, r1 = (y + 2) >> 2;
      if (c0 < 1 || r0 < 1 || c1 >= CW - 1 || r1 >= CHH - 1) return false;
      for (var cy = r0; cy <= r1; cy++) for (var cx = c0; cx <= c1; cx++) {
        var k = cy * CW + cx;
        if (solid[k] || roadMask[k] || open[k]) return false;
      }
      return true;
    }
    function plant(x, y) {
      x = Math.round(x); y = Math.round(y);
      var t = { x: x, y: y, tx: x, ty: y };
      trees.push(t);
      var cx = x >> 2, cy = y >> 2;
      for (var dy = -1; dy <= 0; dy++) for (var dx = -1; dx <= 0; dx++) solid[(cy + dy) * CW + cx + dx] = 3;
      addToBins(bTree, t, [x - 16, y - 40, x + 16, y + 4]);
    }
    var nearLamp = function (x, y) { return lamps.some(function (l) { return Math.abs(l.x - x) < 9 && Math.abs(l.y - y) < 9; }); };
    // avenue trees: both verges of every proper road
    roads.forEach(function (r, ri) {
      if (r.foot || r.w < 12) return;
      [-1, 1].forEach(function (side) {
        var acc = hash(ri, side + 5, 3) * 20;
        for (var i = 0; i + 1 < r.p.length; i++) {
          var a = r.p[i], b = r.p[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
          while (acc < L) {
            var t = acc / L, off = r.w / 2 + 7 + hash(ri, Math.floor(acc), side) * 3;
            var x = a[0] + dx * t - dy / L * off * side, y = a[1] + dy * t + dx / L * off * side;
            if (free(x, y, 3) && !nearLamp(x, y) && hash(Math.floor(x), Math.floor(y), 41) < 0.82) plant(x, y);
            acc += 20 + hash(ri, Math.floor(acc), 9) * 8;
          }
          acc -= L;
        }
      });
    });
    // groves: clustered, thickest where the value field is high and inside mapped woods
    var forest = new Uint8Array(CW * CHH);
    areas.forEach(function (a) { if (a.k === 'forest') fillPoly(cellPoly(a.p), 0, 0, CW, CHH, function (x, y) { forest[y * CW + x] = 1; }); });
    for (var gy = 8; gy < HPX - 8; gy += 13) for (var gx = 8; gx < WPX - 8; gx += 13) {
      var x = gx + (hash(gx, gy, 51) - 0.5) * 9, y = gy + (hash(gx, gy, 52) - 0.5) * 9;
      var f = field(x * 0.6, y * 0.6), p = forest[(y >> 2) * CW + (x >> 2)] ? 0.85 : f > 0.55 ? 0.62 : f > 0.4 ? 0.3 : 0.07;
      if (hash(gx, gy, 53) < p && free(x, y, 5) && !nearLamp(x, y)) plant(x, y);
    }
  })();

  /* ---------- Ground chunks ---------- */

  var G = R.grass, PK = R.park;
  var GRASS = G.map(rgb), PARK = PK.map(rgb), LIGHT_G = rgb('#5d9d47'), LIGHT_P = rgb('#6fae52');
  var ROAD = R.road.map(rgb), KERB = R.kerb.map(rgb), DIRT = R.dirt.map(rgb), PAVE = R.pave.map(rgb);
  var POND = ['#1f3524', '#2a4630', '#35573a', '#416a45', '#5b8259', '#86a57f', '#c8d9bf'].map(rgb);
  var TRACK = ['#8e4a37', '#b0604a', '#c4785e', '#e0b3a0'].map(rgb);
  var WATER = R.water.map(rgb), WATER_BLUE = WATER, STONE = ['#5f5440', '#857657', '#a8996f', '#c8ba8e'].map(rgb);
  var PITCH = R.pitch.map(rgb), FARM = R.farm.map(rgb), WOOD = R.wood.map(rgb), STEEL = R.steel.map(rgb), BALLAST = R.rail.map(rgb);
  var LINE = rgb('#edf3e2'), FOREST = rgb('#3f6f31'), SHADE = [12, 24, 16];
  var FLOWERS = [['#f2d24b', '#b8901f'], ['#ffffff', '#bdb7c8'], ['#e86a8a', '#a8405c'], ['#9b7fe0', '#5f4aa0']];

  function chunk(cx, cy) {
    var X0 = cx * CHUNK, Y0 = cy * CHUNK, N = CHUNK;
    var r = new A.Raster(N, N), d = r.d;
    function put(x, y, c) { var i = ((y - Y0) * N + (x - X0)) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; }
    function blend(x, y, c, a) { var i = ((y - Y0) * N + (x - X0)) * 4; d[i] += (c[0] - d[i]) * a; d[i + 1] += (c[1] - d[i + 1]) * a; d[i + 2] += (c[2] - d[i + 2]) * a; }
    function grassAt(x, y, pal, light) {
      var f = field(x & ~1, y & ~1);
      var c = (f > 0.62 || (f > 0.56 && (((x >> 1) + (y >> 1)) & 1))) ? light : pal[3];
      var h = hash(x, y, 1);
      if (h < 0.05) c = pal[2]; else if (h < 0.072) c = pal[4];
      return c;
    }
    var x1 = X0 + N, y1 = Y0 + N;

    // 1. grass, with tufts and the odd patch of flowers
    for (var y = Y0; y < y1; y++) for (var x = X0; x < x1; x++) put(x, y, grassAt(x, y, GRASS, LIGHT_G));
    for (var gy = Y0; gy < y1; gy += 8) for (var gx = X0; gx < x1; gx += 8) {
      var hq = hash(gx, gy, 3);
      if (hq < 0.22) {
        var tx = gx + 2 + Math.floor(hash(gx, gy, 4) * 4), ty = gy + 2 + Math.floor(hash(gx, gy, 6) * 4);
        put(tx, ty, GRASS[5]); put(tx - 1, ty + 1, GRASS[2]); put(tx + 1, ty + 1, GRASS[2]); put(tx, ty + 1, GRASS[4]);
      } else if (hq > 0.985) {
        var fc = FLOWERS[Math.floor(hash(gx, gy, 7) * 4)];
        for (var k = 0; k < 3; k++) { var fx = gx + Math.floor(hash(gx, gy, 20 + k) * 7), fy = gy + Math.floor(hash(gx, gy, 30 + k) * 7); put(fx, fy, rgb(fc[0])); if (fx + 1 < x1) put(fx + 1, fy, rgb(fc[1])); }
      }
    }

    var bi = cy * NBX + cx;

    // 2. land cover
    bArea[bi].forEach(function (a) {
      if (a.k === 'park') fillPoly(a.p, X0, Y0, x1, y1, function (x, y) { put(x, y, grassAt(x, y, PARK, LIGHT_P)); });
      else if (a.k === 'forest') fillPoly(a.p, X0, Y0, x1, y1, function (x, y) { put(x, y, hash(x, y, 9) < 0.15 ? GRASS[1] : FOREST); });
      else if (a.k === 'farm') fillPoly(a.p, X0, Y0, x1, y1, function (x, y) { var m = y % 5; put(x, y, m === 0 ? FARM[0] : m === 1 ? FARM[1] : (hash(x, y, 2) < 0.04 ? rgb('#7fa840') : FARM[2])); });
      else if (a.k === 'pitch') fillPoly(a.p, X0, Y0, x1, y1, function (x, y) {
        var e = edgeDist(x + 0.5, y + 0.5, a.p)[0];
        put(x, y, e > 4 && e < 5.2 ? LINE : (Math.floor(x / 24) % 2 ? PITCH[2] : PITCH[3]));
        if (hash(x, y, 4) < 0.03) put(x, y, PITCH[1]);
      });
      else if (a.k === 'water') fillPoly(a.p, X0, Y0, x1, y1, function (x, y) {
        var e = edgeDist(x + 0.5, y + 0.5, a.p)[0], dith = (x + y) & 1, c, WATER = a.pond ? POND : WATER_BLUE;
        if (e < 1.5) c = STONE[(x * 7 + y * 3) % 4 < 2 ? 2 : 1];
        else if (e < 3) c = WATER[5];
        else if (e < 6) c = dith && e > 5 ? WATER[3] : WATER[4];
        else if (e < 12) c = dith && e > 10 ? WATER[2] : WATER[3];
        else c = WATER[2];
        if (e > 3 && hash(x >> 2, y, 11) < 0.02) c = WATER[5];
        put(x, y, c);
      });
    });

    // 2b. running tracks: red lanes round a grass field
    tracks.forEach(function (t) {
      if (t.k === 'plaza' && t.outer) {
        var q = t.outer;
        for (var py = Math.max(Y0, Math.floor(q[1])); py < Math.min(y1, Math.ceil(q[3])); py++)
          for (var pxx = Math.max(X0, Math.floor(q[0])); pxx < Math.min(x1, Math.ceil(q[2])); pxx++) {
            var dq = rrDist(pxx + 0.5, py + 0.5, q);
            if (dq > 0) continue;
            var hq = hash(pxx, py, 31);
            // beaten earth fraying into the grass at the edges
            if (dq > -3 && hash(pxx, py, 32) < 0.5) continue;
            put(pxx, py, hq < 0.12 ? DIRT[1] : hq > 0.92 ? DIRT[3] : (field(pxx * 3, py * 3) > 0.58 ? PAVE[2] : DIRT[2]));
          }
        return;
      }
      if (t.k !== 'track' || !t.outer) return;
      var o = t.outer;
      if (o[2] < X0 || o[0] > x1 || o[3] < Y0 || o[1] > y1) return;
      for (var ty = Math.max(Y0, Math.floor(o[1])); ty < Math.min(y1, Math.ceil(o[3])); ty++)
        for (var tx = Math.max(X0, Math.floor(o[0])); tx < Math.min(x1, Math.ceil(o[2])); tx++) {
          var dOut = rrDist(tx + 0.5, ty + 0.5, o);
          if (dOut > 0) continue;
          var dIn = t.inner ? rrDist(tx + 0.5, ty + 0.5, t.inner) : 99;
          if (dIn <= 0) { put(tx, ty, Math.floor(tx / 24) % 2 ? PITCH[2] : PITCH[3]); continue; }
          var lane = Math.floor(dIn) % 4;
          put(tx, ty, dOut > -1 ? TRACK[0] : dIn < 1 ? LINE : lane === 0 ? TRACK[3] : (hash(tx, ty, 23) < 0.1 ? TRACK[1] : TRACK[2]));
        }
    });

    // 3. shadows cast by buildings (sun from the upper left), as one soft mask
    var mask = new Uint8Array(N * N), anyShadow = false;
    bShadow[bi].forEach(function (b) {
      var M = maskOf(b), sx = b.h * 0.55, sy = b.h * 0.3, steps = Math.max(2, Math.ceil(Math.max(sx, sy) / 2));
      for (var s = 0; s <= steps; s++) {
        var ox = Math.round(sx * s / steps), oy = Math.round(sy * s / steps);
        var gx0 = M.x0 + ox, gy0 = M.y0 + oy;
        var ly0 = Math.max(0, Y0 - gy0), ly1 = Math.min(M.h, y1 - gy0), lx0 = Math.max(0, X0 - gx0), lx1 = Math.min(M.w, x1 - gx0);
        for (var ly = ly0; ly < ly1; ly++) for (var lx = lx0; lx < lx1; lx++) {
          if (M.m[ly * M.w + lx]) { mask[(gy0 + ly - Y0) * N + (gx0 + lx - X0)] = 1; anyShadow = true; }
        }
      }
    });
    if (anyShadow) for (var my = 0; my < N; my++) for (var mx = 0; mx < N; mx++) if (mask[my * N + mx]) blend(X0 + mx, Y0 + my, SHADE, 0.3);

    // 4. railway: ballast, sleepers, steel
    bRail[bi].forEach(function (p) {
      stroke(p, 7, X0, Y0, x1, y1, function (x, y) { put(x, y, BALLAST[Math.floor(hash(x, y, 13) * 4)]); });
      stroke(p, 5, X0, Y0, x1, y1, function (x, y, t, i) {
        var a = p[i], b = p[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = t * L;
        if (((u % 5) + 5) % 5 < 2) put(x, y, WOOD[2]);
      });
      [-2.5, 2.5].forEach(function (off) {
        var q = offsetLine(p, off);
        stroke(q, 0.75, X0, Y0, x1, y1, function (x, y) { put(x, y, STEEL[2]); });
      });
    });

    // 5. footpaths, then road kerbs, then asphalt, so junctions merge cleanly
    var rs = bRoad[bi];
    rs.forEach(function (rd) {
      if (!rd.foot) return;
      var paved = rd.c === 'footway' || rd.c === 'pedestrian';
      stroke(rd.p, rd.w / 2, X0, Y0, x1, y1, function (x, y) {
        var h = hash(x, y, 15);
        if (paved) put(x, y, ((x >> 2) + (y >> 2)) % 2 ? PAVE[2] : PAVE[1]);
        else put(x, y, h < 0.15 ? DIRT[1] : h > 0.9 ? DIRT[3] : DIRT[2]);
      });
    });
    rs.forEach(function (rd) { if (!rd.foot) stroke(rd.p, rd.w / 2 + 3, X0, Y0, x1, y1, function (x, y) { put(x, y, KERB[0]); }); });
    rs.forEach(function (rd) { if (!rd.foot) stroke(rd.p, rd.w / 2 + 2, X0, Y0, x1, y1, function (x, y) { put(x, y, hash(x, y, 16) < 0.2 ? KERB[2] : KERB[3]); }); });
    rs.forEach(function (rd) {
      if (rd.foot) return;
      var dash = rd.c === 'primary' || rd.c === 'secondary';
      stroke(rd.p, rd.w / 2, X0, Y0, x1, y1, function (x, y, t, i) {
        var h = hash(x, y, 17), c = h < 0.07 ? ROAD[1] : h < 0.11 ? ROAD[3] : ROAD[2];
        put(x, y, c);
      });
      stroke(rd.p, rd.w / 2, X0, Y0, x1, y1, function (x, y, t, i) {
        // a soft darker band along each edge where tyres don't polish the tar
        var a = rd.p[i], b = rd.p[i + 1];
        var dd = Math.sqrt(segDist2(x + 0.5, y + 0.5, a[0], a[1], b[0], b[1]));
        if (dd > rd.w / 2 - 2) put(x, y, ROAD[1]);
        if (dash && dd < 0.8) {
          var L = Math.hypot(b[0] - a[0], b[1] - a[1]);
          if (((t * L) % 18) < 9) put(x, y, rgb('#cfcabb'));
        }
      });
    });

    return r.canvas();
  }

  function offsetLine(p, off) {
    return p.map(function (q, i) {
      var a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)];
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      return [q[0] - dy / L * off, q[1] + dx / L * off];
    });
  }

  /* ---------- Buildings ---------- */

  var WALLS = {
    cream: ['#8f7f62', '#b9a682', '#ddcba4', '#ece0c2', '#f7efdb'],
    butter: ['#8c7a45', '#b8a160', '#dcc684', '#ebdba7', '#f6edc8'],
    blush: ['#8d6a5e', '#b98f80', '#dcb4a3', '#ead0c3', '#f5e6dd'],
    white: ['#7f8183', '#a9abab', '#d3d4d0', '#e6e6e2', '#f6f6f2'],
    sage: ['#6b7a68', '#92a28c', '#b8c6ae', '#d0dbc7', '#e6eedf'],
    brick: ['#4f1c13', '#73291c', '#9a3f2a', '#b5543b', '#cf7559'],
    grey: ['#5d6066', '#7f838a', '#a1a5ab', '#bcc0c5', '#d6d9dd']
  };
  var ROOFS = {
    concrete: ['#6e6a62', '#8e897e', '#aaa498', '#c2bcae', '#d8d2c4'],
    warm: ['#776755', '#978570', '#b5a288', '#cab99e', '#ddd0b6'],
    grey: ['#59616a', '#768089', '#929da5', '#adb6bd', '#c9d0d5'],
    tile: ['#5a2116', '#7c311e', '#a1462b', '#bc5f3e', '#d48163'],
    tin: ['#2c4a37', '#3c634d', '#4e7d64', '#66987b', '#88b499'],
    solar: ['#5f6268', '#7c8087', '#979ba1', '#b0b4b9', '#c9ccd0'],
    brickroof: ['#6d5a4c', '#8a7462', '#a68e78', '#bba48d', '#d2bea8']
  };
  function hexRamp(name, table) { var r = table[name]; if (!r && name && name[0] === '#') r = shadeRamp(name); return (r || table.concrete || table.cream).map(rgb); }
  function shadeRamp(hex) {
    var c = rgb(hex), f = function (k) { return '#' + c.map(function (v) { var t = Math.max(0, Math.min(255, Math.round(v * k))); return (t < 16 ? '0' : '') + t.toString(16); }).join(''); };
    return [f(0.55), f(0.75), hex, f(1.12), f(1.25)];
  }

  var spriteCache = {};
  var GLASS = [rgb('#9cc0d8'), rgb('#557a9a'), rgb('#3b5873'), rgb('#2e465e')];
  var LIT = rgb(A.WINDOW_LIT || '#ffd77a'), LIT_HI = rgb('#fff1c2');
  var OUT = rgb(R.outline), PLINTH = [rgb('#8b8578'), rgb('#b8b2a4')];
  var DOORW = R.wood.map(rgb);

  // Draws one building from its footprint mask: walls wherever the footprint ends going south,
  // then the roof (the footprint lifted by the wall height) over them. Courtyards just work.
  // Returns {img, glow, x, y, w, h, strips}.
  function building(b) {
    if (spriteCache[b.id]) return spriteCache[b.id];
    var M = maskOf(b), m = M.m, md = M.d, mw = M.w, mh = M.h;
    var h = b.h, towerH = b.tower ? 46 : 0;
    var ox = M.x0 - 2, oy = M.y0 - h - 2 - towerH;
    var w = mw + 4, H = mh + h + 4 + towerH;
    var r = new A.Raster(w, H), g = new A.Raster(w, H);
    var d = r.d, gd = g.d;
    function put(x, y, c) { x = x | 0; y = y | 0; if (x < 0 || y < 0 || x >= w || y >= H) return; var i = (y * w + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; }
    function glow(x, y, c) { x = x | 0; y = y | 0; if (x < 0 || y < 0 || x >= w || y >= H) return; var i = (y * w + x) * 4; gd[i] = c[0]; gd[i + 1] = c[1]; gd[i + 2] = c[2]; gd[i + 3] = 255; }
    var at = function (lx, ly) { return lx >= 0 && ly >= 0 && lx < mw && ly < mh && m[ly * mw + lx] === 1; };
    var WL = hexRamp(b.wall, WALLS), RF = hexRamp(b.roof === 'concrete' && b.wall === 'brick' ? 'brickroof' : b.roof, ROOFS);
    var TILE = ROOFS.tile.map(rgb), PANEL = ['#22334d', '#2d4466', '#3f5c85', '#86a6cc'].map(rgb);
    var brick = b.wall === 'brick';
    var floorH = (h - 3) / b.floors;

    // south edges: (column, last inside row) pairs
    var edgesAt = [];
    for (var lx = 0; lx < mw; lx++) {
      var list = [];
      for (var ly = 0; ly < mh; ly++) if (m[ly * mw + lx] && !at(lx, ly + 1)) list.push(ly);
      edgesAt.push(list);
    }
    function nearestEdge(lx, ly) {
      if (lx < 0 || lx >= mw) return null;
      var best = null, bd = 7;
      edgesAt[lx].forEach(function (e) { var dd = Math.abs(e - ly); if (dd < bd) { bd = dd; best = e; } });
      return best;
    }
    var doorCol = b.door ? Math.round(b.door.x) - M.x0 : -99, doorRow = null;
    if (b.door && doorCol >= 0 && doorCol < mw) {
      var bestD = 1e9;
      edgesAt[doorCol].forEach(function (e) { var dd = Math.abs(M.y0 + e - b.door.y); if (dd < bestD) { bestD = dd; doorRow = e; } });
    }

    // 1. walls
    for (lx = 0; lx < mw; lx++) edgesAt[lx].forEach(function (e) {
      var L = nearestEdge(lx - 1, e), Rr = nearestEdge(lx + 1, e);
      var slope = (L !== null && Rr !== null) ? (Rr - L) / 2 : (L !== null ? e - L : Rr !== null ? Rr - e : 0);
      var nx = -slope / Math.sqrt(1 + slope * slope);
      var tone = nx < -0.35 ? 3 : nx > 0.35 ? 1 : 2;   // lit from the left
      if (L === null && !at(lx - 1, e)) tone = Math.min(4, tone + 1);   // west corner catches the light
      if (Rr === null && !at(lx + 1, e)) tone = Math.max(0, tone - 1);  // east corner in shade
      var base = WL[tone], dark = WL[Math.max(0, tone - 1)], light = WL[Math.min(4, tone + 1)];
      var gx = M.x0 + lx, ye = M.y0 + e + 1;            // ground x and the edge's ground y
      var isDoor = doorRow === e && Math.abs(lx - doorCol) < 4;
      for (var v = 0; v < h; v++) {
        var y = ye - 1 - v, col = base;
        if (brick && ((v % 3 === 0) || ((gx + (Math.floor(v / 3) % 2) * 3) % 6 === 0))) col = dark;
        if (v < 2) col = v < 1 ? PLINTH[0] : PLINTH[1];
        else if (v >= h - 3) col = v >= h - 1 ? light : RF[3];
        else {
          var fv = (v - 2) % floorH, fi = Math.floor((v - 2) / floorH);
          if (fv < 1 && fi > 0) col = dark;                       // floor ledge
          if (isDoor && fi === 0) {
            var dx2 = Math.abs(lx - doorCol);
            col = fv > floorH * 0.85 ? WL[4] : (dx2 < 3 ? (dx2 < 1 ? DOORW[1] : DOORW[2]) : WL[0]);
          } else {
            var um = ((gx % 8) + 8) % 8, win = um >= 2 && um < 6 && fv > floorH * 0.32 && fv < floorH * 0.8;
            if (win) {
              var gi = fv > floorH * 0.72 ? 0 : fv > floorH * 0.62 ? 1 : (um < 3 ? 2 : 3);
              col = GLASS[gi];
              var wid = Math.floor(gx / 8) + fi * 997 + ye * 7919;
              if (hash(wid, b.id, 3) < 0.5) glow(gx - ox, y - oy, fv > floorH * 0.72 ? LIT_HI : LIT);
            } else if (b.shutters && (um === 1 || um === 6) && fv > floorH * 0.32 && fv < floorH * 0.8) {
              col = rgb(um === 1 ? '#3f6b47' : '#2f5638');
            } else if (um >= 1 && um <= 6 && fv >= floorH * 0.8 && fv < floorH * 0.8 + 1) {
              col = light;                                          // sill
            }
          }
        }
        put(gx - ox, y - oy, col);
      }
    });

    // 2. roof: every footprint pixel, lifted by the wall height
    var tileRoof = b.roof === 'tile' || b.roof === 'tin';
    for (var ry = 0; ry < mh; ry++) for (var rx = 0; rx < mw; rx++) {
      var k = ry * mw + rx;
      if (!m[k]) continue;
      var gX = M.x0 + rx, gY = M.y0 + ry, sx = gX - ox, sy = gY - h - oy, dd = md[k], col;
      // which side the nearest edge is on decides whether the rim is lit
      var litSide = !at(rx, ry - 1) || !at(rx - 1, ry) || (dd < 3 && (!at(rx, ry - 2) || !at(rx - 2, ry) || !at(rx, ry - 3) || !at(rx - 3, ry)));
      var accent = null;
      for (var ai = 0; ai < b.accents.length; ai++) { var q = b.accents[ai]; if (gX >= q[0] && gX <= q[2] && gY >= q[1] && gY <= q[3]) { accent = q[4]; break; } }
      if (accent === 'solar' && dd > 2.5) {
        var apy = ((gY % 9) + 9) % 9, apx = ((gX % 5) + 5) % 5;
        col = apy < 6 ? (apy === 0 ? PANEL[3] : apx === 0 ? PANEL[2] : (apy > 3 ? PANEL[0] : PANEL[1])) : RF[2];
      } else if (b.fan && dd > 1.5) {
        // an auditorium roof seen from above: ribs fanning out from the stage
        var ang = Math.atan2(gY - b.fan[1], gX - b.fan[0]), rib = Math.floor((ang + Math.PI) / (Math.PI / 14));
        var rad = Math.hypot(gX - b.fan[0], gY - b.fan[1]);
        col = rgb(rib % 2 ? '#d8c6a6' : '#a9876a');
        if ((Math.floor(rad) % 9) === 0) col = rgb('#8a6c52');
      } else if (accent) {
        col = dd < 1.5 ? TILE[0] : (gY % 4 === 0) ? TILE[1] : ((gX + (Math.floor(gY / 4) % 2) * 2) % 4 === 0 ? TILE[3] : TILE[2]);
      } else if (dd < 1.5) col = litSide ? RF[4] : RF[0];
      else if (dd < 2.5) col = litSide ? RF[3] : RF[1];
      else if (dd < 3.5 && !tileRoof) col = litSide ? RF[1] : RF[2];
      else if (tileRoof) {
        // pitched tile roof: a ridge along the middle, lit slope above it
        var ridge = dd > 0 && md[k] >= (md[Math.min(m.length - 1, k + mw)] || 0) && md[k] >= (md[Math.max(0, k - mw)] || 0);
        col = ridge ? RF[4] : (gY % 4 === 0) ? RF[1] : ((gX + (Math.floor(gY / 4) % 2) * 2) % 4 === 0 ? RF[3] : (at(rx, ry - 3) && !at(rx, ry + 3) ? RF[1] : RF[2]));
      } else {
        var hh = hash(gX, gY, 21);
        col = hh < 0.06 ? RF[1] : hh < 0.1 ? RF[3] : RF[2];
        if ((gX % 12 === 0 || (gY + 6) % 12 === 0) && hh < 0.7) col = RF[1];
        if (field(gX * 2, gY * 2) > 0.7 && ((gX + gY) & 1)) col = RF[1];   // monsoon stains
        if (b.roof === 'solar' && dd > 4.5) {
          var py = ((gY % 9) + 9) % 9, pxx = ((gX % 5) + 5) % 5;
          if (py < 6) col = py === 0 ? PANEL[3] : pxx === 0 ? PANEL[2] : (py > 3 ? PANEL[0] : PANEL[1]);
        }
      }
      put(sx, sy, col);
    }

    // 3. rooftop clutter on plain flat roofs
    if (!tileRoof && b.roof !== 'solar' && !b.fan) {
      for (var cy = 6; cy < mh - 4; cy += 13) for (var cx = 6; cx < mw - 4; cx += 13) {
        var jx = Math.round(cx + (hash(cx, cy, b.id) - 0.5) * 6), jy = Math.round(cy + (hash(cy, cx, b.id) - 0.5) * 6);
        if (!at(jx, jy) || md[jy * mw + jx] < 7) continue;
        var v2 = hash(jx, jy, b.id + 3), tx0 = M.x0 + jx - ox, ty0 = M.y0 + jy - h - oy;
        if (v2 < 0.035) tank(tx0, ty0);
        else if (v2 < 0.07) ac(tx0, ty0);
        else if (v2 < 0.085) solar(tx0, ty0);
        else if (v2 < 0.095) stairRoom(tx0, ty0);
      }
    }
    function tank(x, y) {
      for (var yy = -3; yy <= 3; yy++) for (var xx = -3; xx <= 3; xx++) if (xx * xx + yy * yy <= 10) put(x + xx, y + yy, rgb(xx + yy < -2 ? '#4a4a52' : xx + yy > 2 ? '#141418' : '#26262c'));
      put(x - 1, y - 1, rgb('#5a5a63'));
      for (var s2 = 0; s2 < 4; s2++) put(x + 2 + s2, y + 3, rgb('#3a3530'));
    }
    function ac(x, y) {
      for (var yy = -2; yy <= 2; yy++) for (var xx = -3; xx <= 3; xx++) put(x + xx, y + yy, rgb(yy === -2 ? '#e6e6e0' : yy === 2 ? '#8e8e88' : '#c9c9c3'));
      put(x, y, rgb('#66666b')); put(x + 1, y, rgb('#77777c'));
    }
    function solar(x, y) {
      for (var yy = -3; yy <= 3; yy++) for (var xx = -5; xx <= 5; xx++) put(x + xx, y + yy, rgb(yy === -3 ? '#7aa3d6' : (xx === 0 || yy === 0) ? '#1d355a' : '#2a4a7a'));
    }
    function stairRoom(x, y) {
      for (var yy = -6; yy <= 0; yy++) for (var xx = -5; xx <= 5; xx++) put(x + xx, y + yy, RF[yy === -6 ? 4 : 3]);
      for (var y3 = 1; y3 <= 5; y3++) for (var x3 = -5; x3 <= 5; x3++) put(x + x3, y + y3, WL[y3 === 5 ? 1 : 2]);
      for (var y4 = 1; y4 <= 5; y4++) for (var x4 = -1; x4 <= 1; x4++) put(x + x4, y + y4, DOORW[1]);
    }

    r.outline(R.outline);
    // only keep glow where a window is still visible after the roof was drawn over it
    for (var gi2 = 0; gi2 < gd.length; gi2 += 4) {
      if (!gd[gi2 + 3]) continue;
      var isGlass = false;
      for (var k2 = 0; k2 < GLASS.length; k2++) if (d[gi2] === GLASS[k2][0] && d[gi2 + 1] === GLASS[k2][1] && d[gi2 + 2] === GLASS[k2][2]) { isGlass = true; break; }
      if (!isGlass) gd[gi2 + 3] = 0;
    }
    var img = r.canvas(), gl = g.canvas();

    var tAt = b.towerAt || (b.door ? [b.door.x, b.door.y - 4] : null);
    if (b.tower && tAt) {
      var tw = A.towerSprite();
      img.getContext('2d').drawImage(tw, Math.round(tAt[0] - ox - 14), Math.round(tAt[1] - h - oy - 46));
    }

    // vertical strips, each sorted by the southernmost wall in it, so people in front of one wing
    // aren't hidden by another
    var strips = [];
    for (var sx0 = 0; sx0 < w; sx0 += 16) {
      var sw = Math.min(16, w - sx0), maxY = -1e9;
      for (var c2 = sx0; c2 < sx0 + sw; c2++) {
        var col2 = c2 + ox - M.x0;
        if (col2 < 0 || col2 >= mw) continue;
        edgesAt[col2].forEach(function (e) { if (M.y0 + e + 1 > maxY) maxY = M.y0 + e + 1; });
      }
      if (maxY < -1e8) maxY = b.bb[3];
      strips.push({ sx: sx0, sw: sw, baseY: maxY });
    }
    var out = { img: img, glow: gl, x: ox, y: oy, w: w, h: H, strips: strips };
    spriteCache[b.id] = out;
    return out;
  }

  // the name of a building within a few steps of (x, y)
  function nameNear(x, y) {
    var bx = Math.floor(x / CHUNK), by = Math.floor(y / CHUNK);
    if (bx < 0 || by < 0 || bx >= NBX || by >= NBY) return '';
    var list = bName[by * NBX + bx];
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      for (var dy = -14; dy <= 6; dy += 4) for (var dx = -12; dx <= 12; dx += 4) if (inMask(b, x + dx, y + dy)) return b.name;
    }
    return '';
  }

  /* ---------- Road network for walkers ---------- */

  var nodeRefs = {};
  roads.forEach(function (r, ri) {
    r.p.forEach(function (q, i) { var id = q[2]; if (id === undefined) return; (nodeRefs[id] || (nodeRefs[id] = [])).push([ri, i]); });
  });

  function nearestRoad(x, y, footOk) {
    var best = null, bd = 1e12;
    var bx = Math.floor(x / CHUNK), by = Math.floor(y / CHUNK);
    for (var j = by - 1; j <= by + 1; j++) for (var i = bx - 1; i <= bx + 1; i++) {
      if (i < 0 || j < 0 || i >= NBX || j >= NBY) continue;
      bRoad[j * NBX + i].forEach(function (rd) {
        if (rd.foot && !footOk) return;
        rd.p.forEach(function (q, k) { var dd = (q[0] - x) * (q[0] - x) + (q[1] - y) * (q[1] - y); if (dd < bd) { bd = dd; best = { ri: rd.i, i: k }; } });
      });
    }
    return best;
  }

  /* ---------- Queries for the renderer ---------- */

  function visible(list, x0, y0, x1, y1) {
    var out = [], seen = new Set();
    for (var j = Math.max(0, Math.floor(y0 / CHUNK)); j <= Math.min(NBY - 1, Math.floor(y1 / CHUNK)); j++)
      for (var i = Math.max(0, Math.floor(x0 / CHUNK)); i <= Math.min(NBX - 1, Math.floor(x1 / CHUNK)); i++)
        list[j * NBX + i].forEach(function (it) { if (!seen.has(it)) { seen.add(it); out.push(it); } });
    return out;
  }

  window.VEC = {
    CHUNK: CHUNK, NBX: NBX, NBY: NBY,
    roads: roads, buildings: buildings, byId: byId, trees: trees, lamps: lamps, nodeRefs: nodeRefs,
    chunk: chunk, building: building, nameNear: nameNear,
    solidPx: solidPx, onRoad: onRoad, nearestRoad: nearestRoad,
    visibleBuildings: function (x0, y0, x1, y1) { return visible(bBuild, x0, y0, x1, y1); },
    visibleTrees: function (x0, y0, x1, y1) { return visible(bTree, x0, y0, x1, y1); }
  };
})();
