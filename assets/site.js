/* The rock behind the page.
   Each .formation section is one layer. On load the layers settle into a compressed
   cross-section with the name cut through them; scrolling stretches them out to the
   sections' real positions and drills a borehole down through them. */

(function () {
  'use strict';

  var root = document.documentElement;

  // Copy-email button works with or without the canvas.
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('done');
        setTimeout(function () { btn.textContent = 'Copy email'; btn.classList.remove('done'); }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });

  var canvas = document.getElementById('strata');
  var ctx = canvas && canvas.getContext && canvas.getContext('2d');
  if (!ctx || typeof Path2D === 'undefined') return;
  root.classList.add('canvas-on');

  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = reduceMQ.matches;

  var PAPER = '#ECEEE6';
  var INK = '#16242B';
  var STEP = 12;                           // px between samples along each boundary
  var DIP = [0, 0.018, -0.012, 0.022, -0.009, 0.014];

  var mask = document.createElement('canvas');
  var mctx = mask.getContext('2d');
  var stencil = document.createElement('canvas');   // the name, used to cut the mask
  var sctx = stencil.getContext('2d');
  var cue = document.getElementById('cue');
  var firstPanel = document.querySelector('.formation .panel');

  var bands = Array.prototype.map.call(document.querySelectorAll('.formation'), function (el) {
    var cs = getComputedStyle(el);
    return {
      el: el,
      light: cs.getPropertyValue('--band').trim(),
      deep: cs.getPropertyValue('--deep').trim(),
      lith: el.getAttribute('data-lith'),
      from: parseFloat(el.getAttribute('data-from')),
      to: parseFloat(el.getAttribute('data-to')),
      top: 0, bottom: 0, marks: [],
      pattern: null,
      dep: reduce ? 1 : 0
    };
  });
  var N = bands.length;
  if (!N) return;

  var W, H, dpr, mobile, xs, pts, contentL, contentR, railX, gutter;
  var fontReady = false;
  var nameRatio = 2.8;                     // width of "Ranabir" per px of font size
  var pointer = { x: -1e5, amt: 0, target: 0 };
  var lastSy = window.scrollY, lastT = performance.now(), spin = 0;
  var debris = [];

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function rgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function seeded(seed) {
    var s = seed;
    return function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
  }

  // Lithology symbols, as on a geological section: stipple for sand, dashes for shale,
  // brick for limestone, crosses for granite.
  function makePattern(kind) {
    var S = { sand: 56, shale: 48, lime: 44, granite: 64 }[kind] || 48;
    var c = document.createElement('canvas');
    c.width = c.height = Math.round(S * dpr);
    var g = c.getContext('2d');
    g.scale(dpr, dpr);
    g.strokeStyle = g.fillStyle = INK;
    g.globalAlpha = 0.16;
    g.lineWidth = 1;
    g.lineCap = 'round';
    var r = seeded(kind.length * 7919 + 13);
    var i, x, y;
    if (kind === 'sand') {
      for (i = 0; i < 26; i++) { g.beginPath(); g.arc(r() * S, r() * S, 0.6 + r() * 1.1, 0, 7); g.fill(); }
    } else if (kind === 'shale') {
      for (y = 6; y < S; y += 12) {
        var off = ((y - 6) / 12) % 2 ? 12 : 0;
        for (x = off - 24; x < S; x += 24) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 14, y); g.stroke(); }
      }
    } else if (kind === 'lime') {
      var h = S / 2;
      g.beginPath();
      for (var row = 0; row < 2; row++) {
        y = row * h + 0.5;
        g.moveTo(0, y); g.lineTo(S, y);
        x = (row ? S / 2 : 0) + 0.5;
        g.moveTo(x, y); g.lineTo(x, y + h);
      }
      g.stroke();
    } else {
      for (i = 0; i < 7; i++) {
        var s = 2.6 + r() * 1.4;
        g.save();
        g.translate(6 + r() * (S - 12), 6 + r() * (S - 12));
        if (r() > 0.5) g.rotate(Math.PI / 4);
        g.beginPath(); g.moveTo(-s, 0); g.lineTo(s, 0); g.moveTo(0, -s); g.lineTo(0, s); g.stroke();
        g.restore();
      }
    }
    return ctx.createPattern(c, 'repeat');
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    mobile = W < 760;
    [canvas, mask, stencil].forEach(function (c) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    });
    bands.forEach(function (b) { b.pattern = makePattern(b.lith); });
    var n = Math.ceil(W / STEP) + 2;
    xs = new Float32Array(n);
    for (var i = 0; i < n; i++) xs[i] = i * STEP;
    pts = [];
    for (var j = 0; j <= N; j++) pts.push(new Float32Array(n));
    measure();
  }

  function measure() {
    var sy = window.scrollY;
    bands.forEach(function (b) {
      var r = b.el.getBoundingClientRect();
      b.top = r.top + sy;
      b.bottom = r.bottom + sy;
      // Depth-to-year control points: the layer's ends plus every dated entry inside it.
      var h = Math.max(1, b.bottom - b.top);
      b.marks = [{ f: 0, yr: b.to }];
      b.el.querySelectorAll('[data-at]').forEach(function (m) {
        b.marks.push({ f: (m.getBoundingClientRect().top + sy - b.top) / h, yr: parseFloat(m.getAttribute('data-at')) });
      });
      b.marks.push({ f: 1, yr: b.from });
      b.marks.sort(function (a, c) { return a.f - c.f; });
    });
    var panel = bands[0].el.querySelector('.panel').getBoundingClientRect();
    contentL = panel.left;
    contentR = panel.right;
    railX = mobile ? 24 : contentL - 92;
    gutter = document.querySelector('.hero-intro').getBoundingClientRect().left +
      parseFloat(getComputedStyle(document.querySelector('.hero-intro')).paddingLeft);
  }

  function depositLayers() {
    if (reduce) {
      bands.forEach(function (b) { b.dep = 1; });
      root.classList.add('settled');
      return;
    }
    // Oldest rock first, each layer landing on the one below.
    var t0 = performance.now();
    var order = bands.slice().reverse();
    (function step(now) {
      var busy = false;
      order.forEach(function (b, i) {
        var t = clamp((now - t0 - i * 240) / 760, 0, 1);
        b.dep = 1 - Math.pow(1 - t, 3);
        if (t < 1) busy = true;
      });
      if (busy) requestAnimationFrame(step);
    })(t0);
    setTimeout(function () { root.classList.add('settled'); }, 1100);
  }

  function fracToYear(b, f) {
    var m = b.marks;
    for (var i = 1; i < m.length; i++) {
      if (f <= m[i].f) return lerp(m[i - 1].yr, m[i].yr, clamp((f - m[i - 1].f) / Math.max(1e-6, m[i].f - m[i - 1].f), 0, 1));
    }
    return b.from;
  }

  function yearToFrac(b, yr) {
    var m = b.marks;
    for (var i = 1; i < m.length; i++) {
      if (yr >= m[i].yr) return lerp(m[i - 1].f, m[i].f, clamp((m[i - 1].yr - yr) / Math.max(1e-6, m[i - 1].yr - m[i].yr), 0, 1));
    }
    return 1;
  }

  function bandPath(k) {
    var top = pts[k], bot = pts[k + 1], n = xs.length, i;
    var p = new Path2D();
    p.moveTo(xs[0], top[0]);
    for (i = 1; i < n; i++) p.lineTo(xs[i], top[i]);
    for (i = n - 1; i >= 0; i--) p.lineTo(xs[i], bot[i]);
    p.closePath();
    return p;
  }

  function strokeBetween(g, k, f) {
    var top = pts[k], bot = pts[k + 1];
    g.beginPath();
    for (var i = 0; i < xs.length; i++) {
      var y = top[i] + (bot[i] - top[i]) * f;
      if (i) g.lineTo(xs[i], y); else g.moveTo(xs[i], y);
    }
    g.stroke();
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    var T = reduce ? 0 : now / 1000;
    var sy = window.scrollY;
    var dy = sy - lastSy;
    lastSy = sy;

    var p = clamp(sy / H, 0, 1);
    var e = easeInOut(p);

    // Hero layout: layers stacked up from the bottom of the screen.
    var regionTop = H * (mobile ? 0.5 : 0.44);
    var h0 = (H - regionTop) / N;
    var heroB = new Array(N + 1), b = new Array(N + 1), j, k, i;
    heroB[N] = H;
    for (k = N - 1; k >= 0; k--) heroB[k] = heroB[k + 1] - h0 * bands[k].dep;
    // Page layout: where the sections really are.
    for (k = 0; k < N; k++) b[k] = lerp(heroB[k], bands[k].top - sy, e);
    b[N] = lerp(heroB[N], bands[N - 1].bottom - sy, e);

    var amp = lerp(6, mobile ? 14 : 26, e);
    pointer.amt += (pointer.target * (1 - e) - pointer.amt) * Math.min(1, dt * 5);

    for (j = 0; j <= N; j++) {
      var P = pts[j], prev = j ? pts[j - 1] : null;
      var a = j === 0 ? amp * 0.7 : amp, dip = DIP[j % DIP.length] * e;
      for (i = 0; i < xs.length; i++) {
        var x = xs[i];
        var v = b[j] + a * (0.55 * Math.sin(x * 0.0042 + j * 1.7 + T * 0.25) +
                            0.30 * Math.sin(x * 0.011 + j * 3.1 - T * 0.18) +
                            0.15 * Math.sin(x * 0.027 + j * 5.3 + T * 0.4)) + dip * (x - W / 2);
        var dx = x - pointer.x;
        v += pointer.amt * 16 * Math.exp(-dx * dx / 30000) * (j === 0 ? 0.6 : 1);
        P[i] = prev && v < prev[i] ? prev[i] : v;   // layers never cross
      }
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    var margin = amp + 80;
    var paths = [];
    var pad = mobile ? 10 : 40, fade = mobile ? 26 : 90;
    for (k = 0; k < N; k++) {
      if (b[k + 1] + margin < 0 || b[k] - margin > H || b[k + 1] - b[k] < 0.5) { paths.push(null); continue; }
      var band = bands[k], path = bandPath(k);
      paths.push(path);

      ctx.fillStyle = band.light;
      ctx.fill(path);
      band.pattern.setTransform(new DOMMatrix([1 / dpr, 0, 0, 1 / dpr, 0, b[k]]));
      ctx.fillStyle = band.pattern;
      ctx.fill(path);

      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.08;
      strokeBetween(ctx, k, 0.36);
      strokeBetween(ctx, k, 0.72);
      ctx.globalAlpha = 1;

      // A quiet column of plain rock behind the text.
      if (e > 0.01) {
        var L0 = contentL - pad - fade, R0 = contentR + pad + fade, span = R0 - L0;
        var g = ctx.createLinearGradient(L0, 0, R0, 0);
        var on = rgba(band.light, 0.9 * e), off = rgba(band.light, 0);
        g.addColorStop(0, off);
        g.addColorStop(fade / span, on);
        g.addColorStop(1 - fade / span, on);
        g.addColorStop(1, off);
        ctx.fillStyle = g;
        ctx.fill(path);
      }
    }

    // Contacts between layers.
    ctx.strokeStyle = INK;
    for (j = 0; j <= N; j++) {
      if (b[j] + margin < 0 || b[j] - margin > H) continue;
      ctx.globalAlpha = j === 0 ? 0.7 : 0.38;
      ctx.lineWidth = j === 0 ? 1.5 : 1.2;
      ctx.beginPath();
      for (i = 0; i < xs.length; i++) { if (i) ctx.lineTo(xs[i], pts[j][i]); else ctx.moveTo(xs[i], pts[j][i]); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // The name, cut through the hero cross-section in the darker, wet colour of each layer.
    var m = 1 - clamp(p / 0.55, 0, 1);
    if (m > 0.002 && fontReady) {
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.globalCompositeOperation = 'source-over';
      mctx.clearRect(0, 0, W, H);
      for (k = 0; k < N; k++) {
        if (!paths[k]) continue;
        mctx.fillStyle = bands[k].deep;
        mctx.fill(paths[k]);
        mctx.strokeStyle = bands[k].light;
        mctx.globalAlpha = 0.22;
        strokeBetween(mctx, k, 0.36);
        strokeBetween(mctx, k, 0.72);
        mctx.globalAlpha = 1;
      }
      var region = H - regionTop;
      var fs = Math.min((W - 2 * gutter) * 0.94 / nameRatio, region * 0.5);
      var capH = fs * 0.72, gap = fs * 0.86;
      var base1 = regionTop + (region - capH - gap) * (mobile ? 0.42 : 0.3) + capH - sy * 0.3;
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sctx.clearRect(0, 0, W, H);
      sctx.fillStyle = '#000';
      sctx.font = '800 ' + fs + 'px "Big Shoulders Display"';
      sctx.textBaseline = 'alphabetic';
      sctx.fillText('Ranabir', gutter - fs * 0.02, base1);
      sctx.fillText('Basu', gutter - fs * 0.02, base1 + gap);
      mctx.globalCompositeOperation = 'destination-in';
      mctx.drawImage(stencil, 0, 0, W, H);
      ctx.globalAlpha = m;
      ctx.drawImage(mask, 0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    // The top layer's text waits until its rock has arrived underneath it.
    if (firstPanel) firstPanel.style.opacity = String(clamp((p - 0.6) / 0.35, 0, 1));
    if (cue) cue.style.opacity = root.classList.contains('settled') ? String(clamp(1 - p * 5, 0, 1)) : '';

    drawBorehole(p, dy, dt);

    requestAnimationFrame(frame);
  }

  function drawBorehole(p, dy, dt) {
    var vis = clamp((p - 0.55) / 0.35, 0, 1);
    if (vis <= 0) { debris.length = 0; return; }
    var idx = clamp(Math.round(railX / STEP), 0, xs.length - 1);
    var surf = pts[0][idx], floor = pts[N][idx];
    var readY = clamp(H * 0.5, surf, floor);
    var k, y;

    ctx.save();
    ctx.globalAlpha = vis;

    // Depth scale: a tick at every new year.
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = 1;
    ctx.font = '600 13px "Big Shoulders Text"';
    ctx.textAlign = 'right';
    for (k = 0; k < N; k++) {
      var bd = bands[k], yt = pts[k][idx], yb = pts[k + 1][idx];
      for (var yr = Math.floor(bd.to); yr >= bd.from; yr--) {
        if (yr === bd.to) continue;
        y = yt + yearToFrac(bd, yr) * (yb - yt);
        if (y < -20 || y > H + 20) continue;
        ctx.globalAlpha = vis * 0.55;
        ctx.beginPath(); ctx.moveTo(railX - 18, y); ctx.lineTo(railX - 9, y); ctx.stroke();
        if (!mobile) { ctx.globalAlpha = vis * 0.7; ctx.fillText(String(yr), railX - 23, y + 4.5); }
      }
    }

    // The planned hole below the bit.
    ctx.globalAlpha = vis * 0.4;
    ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(railX, readY + 18); ctx.lineTo(railX, Math.min(floor, H + 10)); ctx.stroke();
    ctx.setLineDash([]);

    // The core pulled so far: each layer's rock in the shaft.
    ctx.globalAlpha = vis;
    for (k = 0; k < N; k++) {
      var s0 = Math.max(pts[k][idx], surf), s1 = Math.min(pts[k + 1][idx], readY);
      if (s1 > s0) { ctx.fillStyle = bands[k].deep; ctx.fillRect(railX - 6, s0, 12, s1 - s0); }
    }
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = INK;
    if (readY > surf) ctx.strokeRect(railX - 6, surf, 12, readY - surf);

    // The bit spins while you scroll.
    spin += Math.abs(dy) * 0.12 + (reduce ? 0 : dt * 0.6);
    ctx.save();
    ctx.translate(railX, readY);
    ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.lineTo(0, 17); ctx.closePath();
    ctx.fillStyle = INK; ctx.fill();
    ctx.clip();
    ctx.strokeStyle = PAPER; ctx.globalAlpha = vis * 0.55; ctx.lineWidth = 1.5;
    for (var sI = 0; sI < 4; sI++) {
      var sx = ((spin * 5 + sI * 6) % 24) - 12;
      ctx.beginPath(); ctx.moveTo(sx, -2); ctx.lineTo(sx - 7, 19); ctx.stroke();
    }
    ctx.restore();

    // Depth readout at the bit.
    var cur = 0;
    for (k = 0; k < N; k++) if (readY >= pts[k][idx]) cur = k;
    var cb = bands[cur], ct = pts[cur][idx], cbt = pts[cur + 1][idx];
    var val = fracToYear(cb, clamp((readY - ct) / Math.max(1, cbt - ct), 0, 1));
    var label = cur === 0 && val > cb.to - 0.15 ? 'Today' : String(Math.floor(val));
    ctx.globalAlpha = vis;
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.font = '700 ' + (mobile ? 15 : 26) + 'px "Big Shoulders Text"';
    ctx.fillText(label, railX + (mobile ? 11 : 16), readY + (mobile ? 6 : 10));

    // Cuttings thrown off the bit.
    if (!reduce && readY < floor - 2 && Math.abs(dy) > 0.5) {
      var count = Math.min(5, Math.abs(dy) * 0.12);
      for (var c = 0; c < count; c++) {
        debris.push({
          x: railX + (Math.random() - 0.5) * 10, y: readY + 8,
          vx: (Math.random() - 0.5) * 220, vy: -40 - Math.random() * 140,
          life: 0.5 + Math.random() * 0.4, size: 1.5 + Math.random() * 2, color: cb.deep
        });
      }
      if (debris.length > 160) debris.splice(0, debris.length - 160);
    }
    for (var d = debris.length - 1; d >= 0; d--) {
      var q = debris[d];
      q.life -= dt;
      if (q.life <= 0) { debris.splice(d, 1); continue; }
      q.vy += 520 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
      ctx.globalAlpha = vis * Math.min(1, q.life * 2.5);
      ctx.fillStyle = q.color;
      ctx.fillRect(q.x, q.y, q.size, q.size);
    }
    ctx.restore();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('load', measure);
  if (window.ResizeObserver) new ResizeObserver(measure).observe(document.body);

  window.addEventListener('pointermove', function (ev) {
    if (ev.pointerType !== 'mouse' || reduce) return;
    pointer.x = ev.clientX;
    pointer.target = 1;
  });
  document.addEventListener('pointerleave', function () { pointer.target = 0; });

  var onReduce = function () { reduce = reduceMQ.matches; if (reduce) bands.forEach(function (b) { b.dep = 1; }); };
  if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', onReduce);

  resize();
  requestAnimationFrame(frame);

  var fonts = document.fonts
    ? Promise.all([
        document.fonts.load('800 100px "Big Shoulders Display"'),
        document.fonts.load('700 20px "Big Shoulders Text"')
      ])
    : Promise.resolve();
  Promise.race([fonts, new Promise(function (r) { setTimeout(r, 2000); })]).then(function () {
    fontReady = true;
    sctx.font = '800 100px "Big Shoulders Display"';
    nameRatio = sctx.measureText('Ranabir').width / 100 || nameRatio;
    measure();
    depositLayers();
  });
})();
