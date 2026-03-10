/**
 * art.js — Pixel Art Generation System
 * Creates all visual textures programmatically for the RPG portfolio.
 * Uses Canvas 2D, converts to PIXI.Texture (PixiJS v7).
 */

(function () {
    'use strict';

    window.GAME = window.GAME || {};

    // =========================================================================
    // COLOR PALETTES PER TIER
    // =========================================================================

    var PALETTES = {
        base: {
            H: 0x2d1b0e, h: 0x3d2b1e, S: 0xf4c794, s: 0xd4a574,
            W: 0xffffff, E: 0x1a1a2e, B: 0x2d1b0e, M: 0xc4956a,
            N: 0xd4a574, T: 0x3b82f6, t: 0x2563eb, D: 0x60a5fa,
            C: 0x2563eb, A: 0x3b82f6, a: 0x2563eb, R: 0xf4c794,
            P: 0x4a5568, p: 0x374151, L: 0x1e293b,
            O: 0x1a1a2e, o: 0x2d3748
        },
        freshman: {
            H: 0x1a1a2e, h: 0x2d3748, S: 0xf4c794, s: 0xd4a574,
            W: 0xffffff, E: 0x1a1a2e, B: 0x1a1a2e, M: 0xc4956a,
            N: 0xd4a574, T: 0x3b82f6, t: 0x2563eb, D: 0x60a5fa,
            C: 0x2563eb, A: 0x3b82f6, a: 0x2563eb, R: 0xf4c794,
            P: 0x4a5568, p: 0x374151, L: 0x1e293b,
            O: 0xd69e2e, o: 0xe2b340
        },
        mid: {
            H: 0x1a1a2e, h: 0x2d3748, S: 0xf4c794, s: 0xd4a574,
            W: 0xffffff, E: 0x1a1a2e, B: 0x1a1a2e, M: 0xc4956a,
            N: 0xd4a574, T: 0x38b2ac, t: 0x2d9a8f, D: 0x4fd1c5,
            C: 0x2d9a8f, A: 0x38b2ac, a: 0x2d9a8f, R: 0xf4c794,
            P: 0x2d3748, p: 0x1e293b, L: 0x1e293b,
            O: 0x4a5568, o: 0x5a6578
        },
        formal: {
            H: 0x1a1a2e, h: 0x2d3748, S: 0xf4c794, s: 0xd4a574,
            W: 0xffffff, E: 0x1a1a2e, B: 0x1a1a2e, M: 0xc4956a,
            N: 0xd4a574, T: 0xe2e8f0, t: 0xcbd5e0, D: 0xf8fafc,
            C: 0xcbd5e0, A: 0xe2e8f0, a: 0xcbd5e0, R: 0xf4c794,
            P: 0x1a202c, p: 0x111827, L: 0x1e293b,
            O: 0x2d3748, o: 0x3d4758, I: 0xef4444
        },
        graduate: {
            H: 0x1a1a2e, h: 0x2d3748, S: 0xf4c794, s: 0xd4a574,
            W: 0xffffff, E: 0x1a1a2e, B: 0x1a1a2e, M: 0xc4956a,
            N: 0xd4a574, T: 0x1a202c, t: 0x111827, D: 0x2d3748,
            C: 0x111827, A: 0x1a202c, a: 0x111827, R: 0xf4c794,
            P: 0x1a202c, p: 0x111827, L: 0x1a202c,
            O: 0x2d3748, o: 0x3d4758, K: 0x1a202c, k: 0xfacc15
        },
        senior: {
            H: 0x1a1a2e, h: 0x2d3748, S: 0xf4c794, s: 0xd4a574,
            W: 0xffffff, E: 0x1a1a2e, B: 0x1a1a2e, M: 0xc4956a,
            N: 0xd4a574, T: 0xe2e8f0, t: 0xcbd5e0, D: 0xf8fafc,
            C: 0xcbd5e0, A: 0xe2e8f0, a: 0xcbd5e0, R: 0xf4c794,
            P: 0x1a202c, p: 0x111827, L: 0x1e293b,
            O: 0x2d3748, o: 0x3d4758,
            X: 0x1a365d, G: 0x94a3b8, g: 0xbfdbfe
        },
        'formal-coat': {
            H: 0x1a1a2e, h: 0x2d3748, S: 0xf4c794, s: 0xd4a574,
            W: 0xffffff, E: 0x1a1a2e, B: 0x1a1a2e, M: 0xc4956a,
            N: 0xd4a574, T: 0xe2e8f0, t: 0xcbd5e0, D: 0xf8fafc,
            C: 0xcbd5e0, A: 0xe2e8f0, a: 0xcbd5e0, R: 0xf4c794,
            P: 0x1a202c, p: 0x111827, L: 0x1e293b,
            O: 0x2d3748, o: 0x3d4758, I: 0xef4444, X: 0x0f172a
        },
        final: {
            H: 0x1a1a2e, h: 0x2d3748, S: 0xf4c794, s: 0xd4a574,
            W: 0xffffff, E: 0x1a1a2e, B: 0x1a1a2e, M: 0xc4956a,
            N: 0xd4a574, T: 0xffffff, t: 0xe2e8f0, D: 0xf8fafc,
            C: 0xe2e8f0, A: 0xffffff, a: 0xe2e8f0, R: 0xf4c794,
            P: 0x0f172a, p: 0x0a0f1a, L: 0x1e293b,
            O: 0x1a202c, o: 0x2a303c,
            X: 0x0f172a, I: 0x3b82f6, G: 0x60a5fa, g: 0x93c5fd
        }
    };

    // =========================================================================
    // RENDERING HELPER
    // =========================================================================

    function renderSpriteData(rows, palette) {
        var h = rows.length;
        var w = rows[0].length;
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');

        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var ch = rows[y][x];
                if (ch !== '.' && palette[ch] !== undefined) {
                    var color = palette[ch];
                    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        var tex = PIXI.Texture.from(canvas, { scaleMode: PIXI.SCALE_MODES.NEAREST });
        return tex;
    }

    function renderCanvasTexture(w, h, drawFn) {
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        drawFn(ctx, w, h);
        return PIXI.Texture.from(canvas, { scaleMode: PIXI.SCALE_MODES.NEAREST });
    }

    function hexToCSS(hex) {
        return '#' + hex.toString(16).padStart(6, '0');
    }

    // =========================================================================
    // CHARACTER SPRITE DATA (32 wide x 48 tall)
    // 3/4 top-down, facing right
    // =========================================================================

    // --- BASE IDLE FRAME 0 (standing still) ---
    var BASE_IDLE_0 = [
        '................................',  // 0
        '................................',  // 1
        '................................',  // 2
        '..........HHHHHHHhh............',  // 3
        '.........HHHHHHHHHhh...........',  // 4
        '........HHHHHHHHHHHhh..........',  // 5
        '........HHHHHHHHHHHhh..........',  // 6
        '........HHhhhHHHHHHhh..........',  // 7
        '........HSSSSSSSSShHh..........',  // 8
        '........HSSBWWESSSBH...........',  // 9
        '........HSSBWEESSSBH...........',  // 10
        '........HSSSSsSSSSSH...........',  // 11
        '.........SSSsMMsSS.............',  // 12
        '.........sSSSMMSSs.............',  // 13
        '..........sNNNNNs..............',  // 14
        '...........NNNN................',  // 15
        '.........CCTTTTCC..............',  // 16
        '........AATTTTTTTAA............',  // 17
        '........AATTTDTTTTAA...........',  // 18
        '.......AATTTTDTTTTtAA..........',  // 19
        '.......AaTTTTTTTTTtaA..........',  // 20
        '.......AaTTTTTTTTTtaA..........',  // 21
        '.......AaTTTTTTTTTtaA..........',  // 22
        '.......RaTTTTTTTTTtaR..........',  // 23
        '.......RRtTTTTTTTTtRR..........',  // 24
        '........RtTTTTTTTTtR...........',  // 25
        '........RLLLLLLLLLR............',  // 26
        '.........PPPPPPPP..............',  // 27
        '.........PPPPPPPP..............',  // 28
        '.........PPPPpPPP..............',  // 29
        '.........PPPpPPPP..............',  // 30
        '.........PPPpPPPP..............',  // 31
        '.........PPPpPPPP..............',  // 32
        '.........PPP.PPPP..............',  // 33
        '.........PPP.PPPP..............',  // 34
        '.........PPp.PPPp..............',  // 35
        '.........PPp.PPPp..............',  // 36
        '.........OOO.OOOo..............',  // 37
        '.........OOo.OOOo..............',  // 38
        '.........OOo.OOOo..............',  // 39
        '................................',  // 40
        '................................',  // 41
        '................................',  // 42
        '................................',  // 43
        '................................',  // 44
        '................................',  // 45
        '................................',  // 46
        '................................'   // 47
    ];

    // --- BASE IDLE FRAME 1 (breathing — torso shifts 1px, slight arm shift) ---
    var BASE_IDLE_1 = [
        '................................',  // 0
        '................................',  // 1
        '................................',  // 2
        '..........HHHHHHHhh............',  // 3
        '.........HHHHHHHHHhh...........',  // 4
        '........HHHHHHHHHHHhh..........',  // 5
        '........HHHHHHHHHHHhh..........',  // 6
        '........HHhhhHHHHHHhh..........',  // 7
        '........HSSSSSSSSShHh..........',  // 8
        '........HSSBWWESSSBH...........',  // 9
        '........HSSBWEESSSBH...........',  // 10
        '........HSSSSsSSSSSH...........',  // 11
        '.........SSSsMMsSS.............',  // 12
        '.........sSSSMMSSs.............',  // 13
        '..........sNNNNNs..............',  // 14
        '...........NNNN................',  // 15
        '.........CCTTTTCC..............',  // 16
        '........AATTTTTTAAA............',  // 17
        '........AATTTDTTTAAA...........',  // 18
        '.......AATTTTDTTTTtAA..........',  // 19
        '.......AaTTTTTTTTTtaA..........',  // 20
        '.......AaTTTTTTTTTtaA..........',  // 21
        '......AAaTTTTTTTTTtaAA.........',  // 22
        '......RRaTTTTTTTTTtaRR.........',  // 23
        '.......RRtTTTTTTTTtRR..........',  // 24
        '........RtTTTTTTTTtR...........',  // 25
        '........RLLLLLLLLLR............',  // 26
        '.........PPPPPPPP..............',  // 27
        '.........PPPPPPPP..............',  // 28
        '.........PPPPpPPP..............',  // 29
        '.........PPPpPPPP..............',  // 30
        '.........PPPpPPPP..............',  // 31
        '.........PPPpPPPP..............',  // 32
        '.........PPP.PPPP..............',  // 33
        '.........PPP.PPPP..............',  // 34
        '.........PPp.PPPp..............',  // 35
        '.........PPp.PPPp..............',  // 36
        '.........OOO.OOOo..............',  // 37
        '.........OOo.OOOo..............',  // 38
        '.........OOo.OOOo..............',  // 39
        '................................',  // 40
        '................................',  // 41
        '................................',  // 42
        '................................',  // 43
        '................................',  // 44
        '................................',  // 45
        '................................',  // 46
        '................................'   // 47
    ];

    // --- BASE WALK FRAME 0 (right foot forward, left arm forward, head bob down 1px) ---
    var BASE_WALK_0 = [
        '................................',  // 0
        '................................',  // 1
        '................................',  // 2
        '................................',  // 3
        '..........HHHHHHHhh............',  // 4
        '.........HHHHHHHHHhh...........',  // 5
        '........HHHHHHHHHHHhh..........',  // 6
        '........HHHHHHHHHHHhh..........',  // 7
        '........HHhhhHHHHHHhh..........',  // 8
        '........HSSSSSSSSShHh..........',  // 9
        '........HSSBWWESSSBH...........',  // 10
        '........HSSBWEESSSBH...........',  // 11
        '........HSSSSsSSSSSH...........',  // 12
        '.........SSSsMMsSS.............',  // 13
        '.........sSSSMMSSs.............',  // 14
        '..........sNNNNNs..............',  // 15
        '...........NNNN................',  // 16
        '.........CCTTTTCC..............',  // 17
        '........RATTTTTTTAA............',  // 18
        '.......RRATTTDTTTTAA...........',  // 19
        '......RRAaTTTDTTTTtaA..........',  // 20
        '.......RAaTTTTTTTTtaAR.........',  // 21
        '........AaTTTTTTTTtaARR........',  // 22
        '........AaTTTTTTTTtaRR.........',  // 23
        '........RRtTTTTTTTtRR..........',  // 24
        '........RRtTTTTTTTtR...........',  // 25
        '.........RLLLLLLLLLR...........',  // 26
        '.........PPPPPPPP..............',  // 27
        '.........PPPPPpPP..............',  // 28
        '.........PPPPpPPP..............',  // 29
        '..........PPp.PPP..............',  // 30
        '..........PPp..PPP.............',  // 31
        '..........PPp..PPPP............',  // 32
        '..........PP....PPPp...........',  // 33
        '..........PP....PPPp...........',  // 34
        '..........OO....OOOo...........',  // 35
        '.........OOo.....OOo...........',  // 36
        '.........OOo.....OOo...........',  // 37
        '................................',  // 38
        '................................',  // 39
        '................................',  // 40
        '................................',  // 41
        '................................',  // 42
        '................................',  // 43
        '................................',  // 44
        '................................',  // 45
        '................................',  // 46
        '................................'   // 47
    ];

    // --- BASE WALK FRAME 1 (passing / neutral, legs together) ---
    var BASE_WALK_1 = [
        '................................',  // 0
        '................................',  // 1
        '................................',  // 2
        '..........HHHHHHHhh............',  // 3
        '.........HHHHHHHHHhh...........',  // 4
        '........HHHHHHHHHHHhh..........',  // 5
        '........HHHHHHHHHHHhh..........',  // 6
        '........HHhhhHHHHHHhh..........',  // 7
        '........HSSSSSSSSShHh..........',  // 8
        '........HSSBWWESSSBH...........',  // 9
        '........HSSBWEESSSBH...........',  // 10
        '........HSSSSsSSSSSH...........',  // 11
        '.........SSSsMMsSS.............',  // 12
        '.........sSSSMMSSs.............',  // 13
        '..........sNNNNNs..............',  // 14
        '...........NNNN................',  // 15
        '.........CCTTTTCC..............',  // 16
        '........AATTTTTTTAA............',  // 17
        '........AATTTDTTTTAA...........',  // 18
        '.......AATTTTDTTTTtAA..........',  // 19
        '.......AaTTTTTTTTTtaA..........',  // 20
        '.......AaTTTTTTTTTtaA..........',  // 21
        '.......AaTTTTTTTTTtaA..........',  // 22
        '.......RaTTTTTTTTTtaR..........',  // 23
        '.......RRtTTTTTTTTtRR..........',  // 24
        '........RtTTTTTTTTtR...........',  // 25
        '........RLLLLLLLLLR............',  // 26
        '.........PPPPPPPP..............',  // 27
        '.........PPPPPPPP..............',  // 28
        '.........PPPPpPPP..............',  // 29
        '.........PPPpPPPP..............',  // 30
        '.........PPPpPPPP..............',  // 31
        '.........PPPpPPPP..............',  // 32
        '.........PPP.PPPP..............',  // 33
        '.........PPP.PPPP..............',  // 34
        '.........PPp.PPPp..............',  // 35
        '.........PPp.PPPp..............',  // 36
        '.........OOO.OOOo..............',  // 37
        '.........OOo.OOOo..............',  // 38
        '.........OOo.OOOo..............',  // 39
        '................................',  // 40
        '................................',  // 41
        '................................',  // 42
        '................................',  // 43
        '................................',  // 44
        '................................',  // 45
        '................................',  // 46
        '................................'   // 47
    ];

    // --- BASE WALK FRAME 2 (left foot forward, right arm forward, head bob down 1px) ---
    var BASE_WALK_2 = [
        '................................',  // 0
        '................................',  // 1
        '................................',  // 2
        '................................',  // 3
        '..........HHHHHHHhh............',  // 4
        '.........HHHHHHHHHhh...........',  // 5
        '........HHHHHHHHHHHhh..........',  // 6
        '........HHHHHHHHHHHhh..........',  // 7
        '........HHhhhHHHHHHhh..........',  // 8
        '........HSSSSSSSSShHh..........',  // 9
        '........HSSBWWESSSBH...........',  // 10
        '........HSSBWEESSSBH...........',  // 11
        '........HSSSSsSSSSSH...........',  // 12
        '.........SSSsMMsSS.............',  // 13
        '.........sSSSMMSSs.............',  // 14
        '..........sNNNNNs..............',  // 15
        '...........NNNN................',  // 16
        '.........CCTTTTCC..............',  // 17
        '........AATTTTTTTAR............',  // 18
        '.......AATTTTDTTTTaRR..........',  // 19
        '......AAaTTTTDTTTTtaRR.........',  // 20
        '.......AaTTTTTTTTTtaR..........',  // 21
        '........AaTTTTTTTTtaA..........',  // 22
        '........AaTTTTTTTTtaA..........',  // 23
        '........RRtTTTTTTTtRR..........',  // 24
        '........RRtTTTTTTTtR...........',  // 25
        '.........RLLLLLLLLLR...........',  // 26
        '.........PPPPPPPP..............',  // 27
        '.........PPpPPPPP..............',  // 28
        '.........PPPpPPPP..............',  // 29
        '.........PPP.pPP...............',  // 30
        '........PPP...PPp..............',  // 31
        '.......PPPP...PPp..............',  // 32
        '.......PPPp...PP...............',  // 33
        '.......PPPp...PP...............',  // 34
        '......OOOo....OO...............',  // 35
        '......OOo....OOo...............',  // 36
        '......OOo....OOo...............',  // 37
        '................................',  // 38
        '................................',  // 39
        '................................',  // 40
        '................................',  // 41
        '................................',  // 42
        '................................',  // 43
        '................................',  // 44
        '................................',  // 45
        '................................',  // 46
        '................................'   // 47
    ];

    // Walk frame 3 is same as frame 1 (passing position)
    var BASE_WALK_3 = BASE_WALK_1;

    // =========================================================================
    // TIER OVERLAY MODIFICATIONS
    // =========================================================================

    // These functions take an array of sprite rows (strings) and return modified copies
    // with tier-specific accessories added.

    function cloneRows(rows) {
        var out = [];
        for (var i = 0; i < rows.length; i++) {
            out.push(rows[i]);
        }
        return out;
    }

    function setPixel(rows, x, y, ch) {
        if (y >= 0 && y < rows.length && x >= 0 && x < rows[y].length) {
            rows[y] = rows[y].substring(0, x) + ch + rows[y].substring(x + 1);
        }
    }

    function addTie(rows) {
        // Add tie below collar, centered, 2px wide on rows 17-25
        setPixel(rows, 13, 17, 'I');
        setPixel(rows, 14, 17, 'I');
        setPixel(rows, 13, 18, 'I');
        setPixel(rows, 14, 18, 'I');
        setPixel(rows, 13, 19, 'I');
        setPixel(rows, 14, 19, 'I');
        setPixel(rows, 13, 20, 'I');
        setPixel(rows, 14, 20, 'I');
        setPixel(rows, 13, 21, 'I');
        setPixel(rows, 14, 21, 'I');
        setPixel(rows, 13, 22, 'I');
        setPixel(rows, 14, 22, 'I');
        setPixel(rows, 14, 23, 'I');
        setPixel(rows, 13, 23, 'I');
        setPixel(rows, 14, 24, 'I');
        setPixel(rows, 13, 24, 'I');
        return rows;
    }

    function addGraduationCap(rows) {
        // Flat rectangle on top of head extending beyond hair, with tassel
        // Head starts around row 3-7, hair top is row 3
        // Cap board: row 1-2, from x=6 to x=22
        for (var x = 6; x <= 22; x++) {
            setPixel(rows, x, 1, 'K');
            setPixel(rows, x, 2, 'K');
        }
        // Cap top center bump
        for (var x2 = 10; x2 <= 18; x2++) {
            setPixel(rows, x2, 0, 'K');
        }
        // Tassel hanging on right side
        setPixel(rows, 21, 3, 'k');
        setPixel(rows, 22, 3, 'k');
        setPixel(rows, 22, 4, 'k');
        setPixel(rows, 23, 4, 'k');
        setPixel(rows, 23, 5, 'k');
        setPixel(rows, 23, 6, 'k');
        return rows;
    }

    function addGlasses(rows) {
        // Glasses across eye area (rows 9-10), lenses over eyes
        // Left lens: x=11-13, right lens: x=14-16, bridge: x=13-14
        setPixel(rows, 10, 9, 'G');
        setPixel(rows, 11, 9, 'G');
        setPixel(rows, 12, 9, 'g');
        setPixel(rows, 13, 9, 'g');
        setPixel(rows, 14, 9, 'G');
        setPixel(rows, 15, 9, 'G');
        setPixel(rows, 16, 9, 'g');
        setPixel(rows, 17, 9, 'g');
        setPixel(rows, 18, 9, 'G');

        setPixel(rows, 10, 10, 'G');
        setPixel(rows, 11, 10, 'G');
        setPixel(rows, 12, 10, 'g');
        setPixel(rows, 13, 10, 'g');
        setPixel(rows, 14, 10, 'G');
        setPixel(rows, 15, 10, 'G');
        setPixel(rows, 16, 10, 'g');
        setPixel(rows, 17, 10, 'g');
        setPixel(rows, 18, 10, 'G');
        return rows;
    }

    function addBlazer(rows) {
        // Blazer overlays the outer edge of torso with X color
        // Rows 17-25, the outer 2px on each side of the shirt
        for (var y = 17; y <= 25; y++) {
            var row = rows[y];
            // Find first non-dot and last non-dot in the shirt area
            for (var x = 0; x < row.length; x++) {
                if (row[x] === 'T' || row[x] === 't' || row[x] === 'A' || row[x] === 'a') {
                    setPixel(rows, x, y, 'X');
                    if (x + 1 < row.length && (row[x + 1] === 'T' || row[x + 1] === 't' || row[x + 1] === 'A' || row[x + 1] === 'a')) {
                        setPixel(rows, x + 1, y, 'X');
                    }
                    break;
                }
            }
            // Right side
            for (var x2 = row.length - 1; x2 >= 0; x2--) {
                if (row[x2] === 'T' || row[x2] === 't' || row[x2] === 'A' || row[x2] === 'a') {
                    setPixel(rows, x2, y, 'X');
                    if (x2 - 1 >= 0 && (row[x2 - 1] === 'T' || row[x2 - 1] === 't' || row[x2 - 1] === 'A' || row[x2 - 1] === 'a')) {
                        setPixel(rows, x2 - 1, y, 'X');
                    }
                    break;
                }
            }
        }
        return rows;
    }

    function applyTierModifications(tier, rows) {
        var modified = cloneRows(rows);
        if (tier === 'formal') {
            addTie(modified);
        } else if (tier === 'formal-coat') {
            addTie(modified);
            addBlazer(modified);
        } else if (tier === 'graduate') {
            addGraduationCap(modified);
        } else if (tier === 'senior') {
            addGlasses(modified);
            addBlazer(modified);
        } else if (tier === 'final') {
            addGlasses(modified);
            addBlazer(modified);
            addTie(modified);
        }
        return modified;
    }

    // =========================================================================
    // CHARACTER TEXTURE GENERATION
    // =========================================================================

    GAME.generateCharacterTextures = function (renderer) {
        var tiers = ['base', 'freshman', 'mid', 'formal', 'formal-coat', 'graduate', 'senior', 'final'];
        var result = {};

        var baseFrames = {
            idle: [BASE_IDLE_0, BASE_IDLE_1],
            walk: [BASE_WALK_0, BASE_WALK_1, BASE_WALK_2, BASE_WALK_3]
        };

        for (var ti = 0; ti < tiers.length; ti++) {
            var tier = tiers[ti];
            var palette = PALETTES[tier];
            result[tier] = { idle: [], walk: [] };

            // Idle frames
            for (var i = 0; i < baseFrames.idle.length; i++) {
                var modifiedRows = applyTierModifications(tier, baseFrames.idle[i]);
                result[tier].idle.push(renderSpriteData(modifiedRows, palette));
            }

            // Walk frames
            for (var w = 0; w < baseFrames.walk.length; w++) {
                var modifiedWalkRows = applyTierModifications(tier, baseFrames.walk[w]);
                result[tier].walk.push(renderSpriteData(modifiedWalkRows, palette));
            }
        }

        return result;
    };

    // =========================================================================
    // TILE TEXTURE GENERATION (16x16 each)
    // =========================================================================

    GAME.generateTileTextures = function () {
        var tiles = {};

        // --- grass ---
        tiles['grass'] = renderCanvasTexture(16, 16, function (ctx) {
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(0, 0, 16, 16);
            var shades = ['#3bce6f', '#5aee90', '#45d878'];
            for (var i = 0; i < 30; i++) {
                ctx.fillStyle = shades[Math.floor(Math.random() * shades.length)];
                ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
            }
        });

        // --- grass-dark ---
        tiles['grass-dark'] = renderCanvasTexture(16, 16, function (ctx) {
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(0, 0, 16, 16);
            var shades = ['#1aab50', '#28d466', '#1fb854'];
            for (var i = 0; i < 30; i++) {
                ctx.fillStyle = shades[Math.floor(Math.random() * shades.length)];
                ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
            }
        });

        // --- path-stone ---
        tiles['path-stone'] = renderCanvasTexture(16, 16, function (ctx) {
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(0, 0, 16, 16);
            // Grid lines
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(0, 7, 16, 1);
            ctx.fillRect(0, 15, 16, 1);
            ctx.fillRect(7, 0, 1, 8);
            ctx.fillRect(3, 8, 1, 8);
            ctx.fillRect(11, 8, 1, 8);
            // Noise
            for (var i = 0; i < 10; i++) {
                ctx.fillStyle = Math.random() > 0.5 ? '#a3abb8' : '#8b929e';
                ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
            }
        });

        // --- wood-floor ---
        tiles['wood-floor'] = renderCanvasTexture(16, 16, function (ctx) {
            ctx.fillStyle = '#a0845c';
            ctx.fillRect(0, 0, 16, 16);
            // Wood grain lines every 4px
            ctx.fillStyle = '#8b7050';
            for (var y = 3; y < 16; y += 4) {
                ctx.fillRect(0, y, 16, 1);
            }
            // Knots
            ctx.fillStyle = '#7a6045';
            ctx.fillRect(5, 1, 2, 2);
            ctx.fillRect(12, 9, 2, 2);
            // Highlights
            ctx.fillStyle = '#b09468';
            for (var i = 0; i < 8; i++) {
                ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
            }
        });

        // --- wood-floor-dark ---
        tiles['wood-floor-dark'] = renderCanvasTexture(16, 16, function (ctx) {
            ctx.fillStyle = '#7a6040';
            ctx.fillRect(0, 0, 16, 16);
            ctx.fillStyle = '#6b5235';
            for (var y = 3; y < 16; y += 4) {
                ctx.fillRect(0, y, 16, 1);
            }
            ctx.fillStyle = '#5c4530';
            ctx.fillRect(3, 5, 2, 2);
            ctx.fillRect(10, 12, 2, 2);
            ctx.fillStyle = '#8a7050';
            for (var i = 0; i < 8; i++) {
                ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
            }
        });

        // --- carpet-blue ---
        tiles['carpet-blue'] = renderCanvasTexture(16, 16, function (ctx) {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(0, 0, 16, 16);
            // Diamond pattern
            ctx.fillStyle = '#2563eb';
            for (var y = 0; y < 16; y += 4) {
                for (var x = 0; x < 16; x += 4) {
                    ctx.fillRect(x + 1, y, 2, 1);
                    ctx.fillRect(x, y + 1, 1, 2);
                    ctx.fillRect(x + 3, y + 1, 1, 2);
                    ctx.fillRect(x + 1, y + 3, 2, 1);
                }
            }
            // Subtle texture
            ctx.fillStyle = '#4a90f8';
            for (var i = 0; i < 12; i++) {
                ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
            }
        });

        // --- carpet-red ---
        tiles['carpet-red'] = renderCanvasTexture(16, 16, function (ctx) {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(0, 0, 16, 16);
            ctx.fillStyle = '#dc2626';
            for (var y = 0; y < 16; y += 4) {
                for (var x = 0; x < 16; x += 4) {
                    ctx.fillRect(x + 1, y, 2, 1);
                    ctx.fillRect(x, y + 1, 1, 2);
                    ctx.fillRect(x + 3, y + 1, 1, 2);
                    ctx.fillRect(x + 1, y + 3, 2, 1);
                }
            }
            ctx.fillStyle = '#f87171';
            for (var i = 0; i < 12; i++) {
                ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
            }
        });

        // --- tile-white ---
        tiles['tile-white'] = renderCanvasTexture(16, 16, function (ctx) {
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(0, 0, 16, 16);
            // Grid
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(0, 0, 16, 1);
            ctx.fillRect(0, 0, 1, 16);
            ctx.fillRect(15, 0, 1, 16);
            ctx.fillRect(0, 15, 16, 1);
            // Slight sheen
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(3, 3, 2, 1);
            ctx.fillRect(10, 8, 2, 1);
        });

        // --- tile-dark ---
        tiles['tile-dark'] = renderCanvasTexture(16, 16, function (ctx) {
            ctx.fillStyle = '#334155';
            ctx.fillRect(0, 0, 16, 16);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, 16, 1);
            ctx.fillRect(0, 0, 1, 16);
            ctx.fillRect(15, 0, 1, 16);
            ctx.fillRect(0, 15, 16, 1);
            ctx.fillStyle = '#475569';
            ctx.fillRect(5, 5, 1, 1);
            ctx.fillRect(11, 11, 1, 1);
        });

        // --- concrete ---
        tiles['concrete'] = renderCanvasTexture(16, 16, function (ctx) {
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(0, 0, 16, 16);
            var shades = ['#8b97a8', '#9dabb8', '#a3b1be', '#8894a5'];
            for (var i = 0; i < 40; i++) {
                ctx.fillStyle = shades[Math.floor(Math.random() * shades.length)];
                ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
            }
            // Crack
            ctx.fillStyle = '#7a8898';
            ctx.fillRect(3, 2, 1, 1);
            ctx.fillRect(4, 3, 1, 1);
            ctx.fillRect(5, 3, 1, 1);
            ctx.fillRect(6, 4, 1, 1);
        });

        return tiles;
    };

    // =========================================================================
    // PROP TEXTURE GENERATION
    // =========================================================================

    GAME.generatePropTextures = function () {
        var props = {};

        // --- desk-wood (32x24) ---
        props['desk-wood'] = renderCanvasTexture(32, 24, function (ctx) {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(2, 21, 30, 3);
            // Desktop surface (top)
            ctx.fillStyle = '#a0845c';
            ctx.fillRect(0, 2, 32, 14);
            // Desktop surface highlight
            ctx.fillStyle = '#b09468';
            ctx.fillRect(1, 3, 30, 2);
            // Front edge
            ctx.fillStyle = '#8b7050';
            ctx.fillRect(0, 16, 32, 4);
            // Legs
            ctx.fillStyle = '#7a6045';
            ctx.fillRect(2, 16, 3, 8);
            ctx.fillRect(27, 16, 3, 8);
            // Drawer handle
            ctx.fillStyle = '#c4a878';
            ctx.fillRect(14, 17, 4, 1);
            // Wood grain
            ctx.fillStyle = '#96784e';
            ctx.fillRect(3, 6, 26, 1);
            ctx.fillRect(3, 10, 26, 1);
        });

        // --- desk-modern (32x24) ---
        props['desk-modern'] = renderCanvasTexture(32, 24, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(2, 21, 30, 3);
            // Sleek dark surface
            ctx.fillStyle = '#334155';
            ctx.fillRect(0, 2, 32, 14);
            ctx.fillStyle = '#475569';
            ctx.fillRect(1, 3, 30, 1);
            // Front
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 16, 32, 4);
            // Metal legs
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(2, 16, 2, 8);
            ctx.fillRect(28, 16, 2, 8);
            // LED strip on front
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(8, 16, 16, 1);
        });

        // --- chair (12x16) ---
        props['chair'] = renderCanvasTexture(12, 16, function (ctx) {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(1, 14, 10, 2);
            // Seat (from above)
            ctx.fillStyle = '#374151';
            ctx.fillRect(1, 5, 10, 8);
            // Backrest
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(2, 0, 8, 6);
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(3, 1, 6, 1);
            // Seat cushion
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(2, 6, 8, 6);
            // Armrests
            ctx.fillStyle = '#374151';
            ctx.fillRect(0, 4, 2, 8);
            ctx.fillRect(10, 4, 2, 8);
            // Base/wheels
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(4, 13, 4, 2);
            ctx.fillRect(2, 14, 1, 1);
            ctx.fillRect(9, 14, 1, 1);
        });

        // --- laptop (14x10) ---
        props['laptop'] = renderCanvasTexture(14, 10, function (ctx) {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(1, 8, 13, 2);
            // Screen (open, tilted)
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(1, 0, 12, 5);
            ctx.fillStyle = '#1e40af';
            ctx.fillRect(2, 1, 10, 3);
            // Screen glow
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(3, 1, 4, 1);
            ctx.fillRect(8, 2, 3, 1);
            // Keyboard base
            ctx.fillStyle = '#475569';
            ctx.fillRect(0, 5, 14, 4);
            ctx.fillStyle = '#334155';
            ctx.fillRect(1, 5, 12, 1);
            // Keyboard dots
            ctx.fillStyle = '#64748b';
            for (var y = 6; y < 9; y++) {
                for (var x = 2; x < 12; x += 2) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
            // Trackpad
            ctx.fillStyle = '#5a6577';
            ctx.fillRect(5, 8, 4, 1);
        });

        // --- monitor (16x20) ---
        props['monitor'] = renderCanvasTexture(16, 20, function (ctx) {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(2, 18, 14, 2);
            // Bezel
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, 16, 14);
            // Screen
            ctx.fillStyle = '#1e3a5f';
            ctx.fillRect(1, 1, 14, 11);
            // Screen content
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(2, 2, 6, 1);
            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(2, 4, 10, 1);
            ctx.fillRect(2, 6, 8, 1);
            ctx.fillRect(2, 8, 11, 1);
            // Power LED
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(8, 13, 1, 1);
            // Stand
            ctx.fillStyle = '#334155';
            ctx.fillRect(6, 14, 4, 3);
            // Base
            ctx.fillStyle = '#475569';
            ctx.fillRect(3, 17, 10, 2);
        });

        // --- dual-monitors (30x20) ---
        props['dual-monitors'] = renderCanvasTexture(30, 20, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(2, 18, 28, 2);
            // Left monitor bezel
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, 14, 14);
            ctx.fillStyle = '#1e3a5f';
            ctx.fillRect(1, 1, 12, 11);
            // Left screen content
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(2, 2, 5, 1);
            ctx.fillRect(2, 4, 9, 1);
            ctx.fillRect(2, 6, 7, 1);
            // Right monitor bezel
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(16, 0, 14, 14);
            ctx.fillStyle = '#1e3a5f';
            ctx.fillRect(17, 1, 12, 11);
            // Right screen content (code)
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(18, 2, 6, 1);
            ctx.fillStyle = '#f97316';
            ctx.fillRect(18, 4, 8, 1);
            ctx.fillStyle = '#a78bfa';
            ctx.fillRect(18, 6, 5, 1);
            ctx.fillRect(18, 8, 9, 1);
            // Stands
            ctx.fillStyle = '#334155';
            ctx.fillRect(5, 14, 4, 3);
            ctx.fillRect(21, 14, 4, 3);
            // Bases
            ctx.fillStyle = '#475569';
            ctx.fillRect(2, 17, 10, 2);
            ctx.fillRect(18, 17, 10, 2);
        });

        // --- coffee-cup (6x6) ---
        props['coffee-cup'] = renderCanvasTexture(6, 6, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(1, 5, 5, 1);
            // Cup body (from above, circular)
            ctx.fillStyle = '#f5f5f4';
            ctx.fillRect(1, 1, 4, 4);
            ctx.fillRect(0, 2, 1, 2);
            ctx.fillRect(5, 2, 1, 2);
            // Coffee inside
            ctx.fillStyle = '#78350f';
            ctx.fillRect(2, 2, 2, 2);
            // Handle
            ctx.fillStyle = '#e7e5e4';
            ctx.fillRect(5, 2, 1, 1);
            // Rim highlight
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(1, 1, 4, 1);
        });

        // --- pizza-box (14x14) ---
        props['pizza-box'] = renderCanvasTexture(14, 14, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(1, 12, 13, 2);
            // Box
            ctx.fillStyle = '#d4a574';
            ctx.fillRect(0, 0, 14, 12);
            ctx.fillStyle = '#c4956a';
            ctx.fillRect(0, 0, 14, 1);
            ctx.fillRect(0, 0, 1, 12);
            ctx.fillRect(13, 0, 1, 12);
            // Pizza inside (open box)
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(2, 2, 10, 8);
            // Pepperoni
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(4, 3, 2, 2);
            ctx.fillRect(8, 4, 2, 2);
            ctx.fillRect(5, 6, 2, 2);
            ctx.fillRect(9, 7, 2, 1);
            // Cheese highlight
            ctx.fillStyle = '#fcd34d';
            ctx.fillRect(3, 4, 1, 1);
            ctx.fillRect(7, 3, 1, 1);
            ctx.fillRect(10, 6, 1, 1);
        });

        // --- energy-drink (4x8) ---
        props['energy-drink'] = renderCanvasTexture(4, 8, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, 7, 4, 1);
            // Can body
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 1, 4, 6);
            // Top
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(0, 0, 4, 1);
            ctx.fillRect(1, 0, 2, 1);
            // Logo stripe
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(0, 3, 4, 1);
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(1, 2, 2, 1);
            // Highlight
            ctx.fillStyle = '#334155';
            ctx.fillRect(0, 1, 1, 6);
        });

        // --- bed (24x32) ---
        props['bed'] = renderCanvasTexture(24, 32, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(2, 30, 22, 2);
            // Bed frame
            ctx.fillStyle = '#7a6045';
            ctx.fillRect(0, 0, 24, 32);
            // Mattress
            ctx.fillStyle = '#f5f5f4';
            ctx.fillRect(1, 1, 22, 28);
            // Pillow
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(3, 2, 8, 6);
            ctx.fillRect(13, 2, 8, 6);
            ctx.fillStyle = '#e5e7eb';
            ctx.fillRect(4, 3, 6, 4);
            ctx.fillRect(14, 3, 6, 4);
            // Blanket
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(1, 10, 22, 18);
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(1, 10, 22, 1);
            // Blanket fold
            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(3, 12, 18, 2);
            // Wrinkles
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(5, 16, 8, 1);
            ctx.fillRect(10, 20, 10, 1);
            ctx.fillRect(3, 24, 6, 1);
        });

        // --- bookshelf (24x32) ---
        props['bookshelf'] = renderCanvasTexture(24, 32, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(2, 30, 22, 2);
            // Frame
            ctx.fillStyle = '#7a6045';
            ctx.fillRect(0, 0, 24, 32);
            // Shelves (horizontal boards)
            var shelfYs = [0, 8, 16, 24, 31];
            for (var i = 0; i < shelfYs.length; i++) {
                ctx.fillStyle = '#8b7050';
                ctx.fillRect(0, shelfYs[i], 24, 1);
            }
            // Back panel
            ctx.fillStyle = '#5c4530';
            ctx.fillRect(1, 1, 22, 7);
            ctx.fillRect(1, 9, 22, 7);
            ctx.fillRect(1, 17, 22, 7);
            ctx.fillRect(1, 25, 22, 6);
            // Books on shelf 1
            var bookColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
            var bx = 2;
            for (var b = 0; b < 7; b++) {
                ctx.fillStyle = bookColors[b % bookColors.length];
                var bw = 2 + Math.floor(Math.random() * 2);
                ctx.fillRect(bx, 2, bw, 6);
                bx += bw + 1;
                if (bx > 20) break;
            }
            // Books on shelf 2
            bx = 2;
            for (var b2 = 0; b2 < 6; b2++) {
                ctx.fillStyle = bookColors[(b2 + 3) % bookColors.length];
                var bw2 = 2 + Math.floor(Math.random() * 2);
                ctx.fillRect(bx, 10, bw2, 6);
                bx += bw2 + 1;
                if (bx > 20) break;
            }
            // Books on shelf 3
            bx = 2;
            for (var b3 = 0; b3 < 5; b3++) {
                ctx.fillStyle = bookColors[(b3 + 5) % bookColors.length];
                var bw3 = 2 + Math.floor(Math.random() * 2);
                ctx.fillRect(bx, 18, bw3, 6);
                bx += bw3 + 1;
                if (bx > 20) break;
            }
            // Shelf 4 — some books, a small object
            bx = 2;
            for (var b4 = 0; b4 < 4; b4++) {
                ctx.fillStyle = bookColors[(b4 + 1) % bookColors.length];
                var bw4 = 2 + Math.floor(Math.random() * 2);
                ctx.fillRect(bx, 26, bw4, 5);
                bx += bw4 + 1;
                if (bx > 16) break;
            }
            // Small globe on shelf 4
            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(18, 27, 3, 3);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(19, 27, 1, 2);
        });

        // --- whiteboard (28x24) ---
        props['whiteboard'] = renderCanvasTexture(28, 24, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(2, 22, 26, 2);
            // Frame
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(0, 0, 28, 24);
            // White surface
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(2, 2, 24, 18);
            // Marker scribbles
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(4, 4, 8, 1);
            ctx.fillRect(4, 5, 1, 4);
            ctx.fillRect(5, 7, 4, 1);
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(14, 4, 6, 1);
            ctx.fillRect(14, 6, 8, 1);
            ctx.fillRect(14, 8, 5, 1);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(4, 12, 10, 1);
            ctx.fillRect(4, 14, 7, 1);
            // Tray at bottom
            ctx.fillStyle = '#64748b';
            ctx.fillRect(4, 20, 20, 2);
            // Markers in tray
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(6, 20, 3, 1);
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(10, 20, 3, 1);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(14, 20, 3, 1);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(18, 20, 3, 1);
        });

        // --- bean-bag (16x14) ---
        props['bean-bag'] = renderCanvasTexture(16, 14, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.fillRect(2, 12, 14, 2);
            // Main body (rounded blob)
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(3, 2, 10, 10);
            ctx.fillRect(2, 3, 12, 8);
            ctx.fillRect(1, 4, 14, 6);
            // Highlight
            ctx.fillStyle = '#f87171';
            ctx.fillRect(4, 3, 6, 3);
            ctx.fillRect(3, 4, 8, 2);
            // Seam line
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(8, 3, 1, 9);
            // Shadow area
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(3, 9, 10, 2);
        });

        // --- tree (20x32) ---
        props['tree'] = renderCanvasTexture(20, 32, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.fillRect(3, 29, 14, 3);
            // Trunk
            ctx.fillStyle = '#7a6045';
            ctx.fillRect(8, 18, 4, 12);
            ctx.fillStyle = '#6b5235';
            ctx.fillRect(8, 18, 1, 12);
            // Canopy layers (3/4 view, round)
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(3, 4, 14, 16);
            ctx.fillRect(2, 6, 16, 12);
            ctx.fillRect(1, 8, 18, 8);
            // Lighter top
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(4, 2, 12, 6);
            ctx.fillRect(3, 3, 14, 4);
            // Highlights
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(5, 3, 4, 2);
            ctx.fillRect(8, 5, 5, 2);
            ctx.fillRect(4, 8, 3, 2);
            // Depth/shadow on bottom of canopy
            ctx.fillStyle = '#15803d';
            ctx.fillRect(3, 14, 14, 4);
            ctx.fillRect(4, 16, 12, 3);
        });

        // --- gate-pillar (12x40) ---
        props['gate-pillar'] = renderCanvasTexture(12, 40, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(1, 38, 11, 2);
            // Main pillar
            ctx.fillStyle = '#92400e';
            ctx.fillRect(1, 4, 10, 34);
            // Brick pattern
            ctx.fillStyle = '#78350f';
            for (var y = 4; y < 38; y += 4) {
                ctx.fillRect(1, y, 10, 1);
            }
            for (var y2 = 4; y2 < 38; y2 += 8) {
                ctx.fillRect(5, y2, 1, 4);
            }
            for (var y3 = 8; y3 < 38; y3 += 8) {
                ctx.fillRect(3, y3, 1, 4);
                ctx.fillRect(8, y3, 1, 4);
            }
            // Cap
            ctx.fillStyle = '#a3a3a3';
            ctx.fillRect(0, 0, 12, 4);
            ctx.fillStyle = '#d4d4d4';
            ctx.fillRect(1, 0, 10, 2);
            // Highlight
            ctx.fillStyle = '#b45309';
            ctx.fillRect(2, 5, 2, 3);
            ctx.fillRect(2, 13, 2, 3);
        });

        // --- gate-arch (40x12) ---
        props['gate-arch'] = renderCanvasTexture(40, 12, function (ctx) {
            // Arch
            ctx.fillStyle = '#92400e';
            ctx.fillRect(0, 4, 40, 8);
            // Top curve
            ctx.fillStyle = '#92400e';
            ctx.fillRect(4, 2, 32, 2);
            ctx.fillRect(8, 0, 24, 2);
            // Brick lines
            ctx.fillStyle = '#78350f';
            ctx.fillRect(0, 7, 40, 1);
            ctx.fillRect(0, 10, 40, 1);
            // Text area
            ctx.fillStyle = '#a3a3a3';
            ctx.fillRect(10, 4, 20, 4);
            // Text "IIT" (simplified pixel text)
            ctx.fillStyle = '#1e293b';
            // I
            ctx.fillRect(13, 5, 1, 2);
            // I
            ctx.fillRect(15, 5, 1, 2);
            // T
            ctx.fillRect(17, 5, 3, 1);
            ctx.fillRect(18, 5, 1, 2);
            // Bottom highlight
            ctx.fillStyle = '#b45309';
            ctx.fillRect(0, 11, 40, 1);
        });

        // --- trophy (10x16) ---
        props['trophy'] = renderCanvasTexture(10, 16, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.fillRect(1, 14, 8, 2);
            // Cup
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(2, 2, 6, 6);
            ctx.fillRect(1, 3, 8, 4);
            // Handles
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(0, 3, 1, 3);
            ctx.fillRect(9, 3, 1, 3);
            // Interior
            ctx.fillStyle = '#d97706';
            ctx.fillRect(3, 3, 4, 4);
            // Stem
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(4, 8, 2, 3);
            // Base
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(2, 11, 6, 2);
            ctx.fillRect(1, 13, 8, 1);
            // Glint
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(3, 2, 1, 1);
            ctx.fillRect(2, 3, 1, 1);
        });

        // --- diploma (12x10) ---
        props['diploma'] = renderCanvasTexture(12, 10, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(1, 8, 11, 2);
            // Rolled paper
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(1, 1, 10, 7);
            // Roll edges
            ctx.fillStyle = '#fde68a';
            ctx.fillRect(0, 2, 1, 5);
            ctx.fillRect(11, 2, 1, 5);
            ctx.fillRect(1, 1, 10, 1);
            ctx.fillRect(1, 7, 10, 1);
            // Center crease
            ctx.fillStyle = '#f5f0d0';
            ctx.fillRect(1, 4, 10, 1);
            // Ribbon
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(5, 3, 2, 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(4, 5, 1, 2);
            ctx.fillRect(7, 5, 1, 2);
            // Bow
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(4, 3, 4, 1);
        });

        // --- nameplate (20x8) ---
        props['nameplate'] = renderCanvasTexture(20, 8, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(1, 6, 19, 2);
            // Plate
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, 20, 6);
            // Gold border
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(0, 0, 20, 1);
            ctx.fillRect(0, 5, 20, 1);
            ctx.fillRect(0, 0, 1, 6);
            ctx.fillRect(19, 0, 1, 6);
            // Text "RANABIR" simplified
            ctx.fillStyle = '#f5f5f4';
            // R
            ctx.fillRect(3, 2, 1, 3);
            ctx.fillRect(4, 2, 1, 1);
            ctx.fillRect(4, 3, 1, 1);
            // B
            ctx.fillRect(6, 2, 1, 3);
            ctx.fillRect(7, 2, 1, 1);
            ctx.fillRect(7, 3, 1, 1);
            ctx.fillRect(7, 4, 1, 1);
            // Dots for rest of name
            ctx.fillRect(9, 3, 1, 1);
            ctx.fillRect(11, 3, 1, 1);
            ctx.fillRect(13, 3, 1, 1);
            ctx.fillRect(15, 3, 1, 1);
        });

        // --- ppo-badge (12x12) ---
        props['ppo-badge'] = renderCanvasTexture(12, 12, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(1, 10, 10, 2);
            // Badge body (circular-ish)
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(2, 1, 8, 9);
            ctx.fillRect(1, 2, 10, 7);
            // Inner circle
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(3, 2, 6, 7);
            ctx.fillRect(2, 3, 8, 5);
            // "PPO" text
            ctx.fillStyle = '#7c2d12';
            // P
            ctx.fillRect(3, 4, 1, 3);
            ctx.fillRect(4, 4, 1, 1);
            ctx.fillRect(4, 5, 1, 1);
            // P
            ctx.fillRect(6, 4, 1, 3);
            ctx.fillRect(7, 4, 1, 1);
            ctx.fillRect(7, 5, 1, 1);
            // O
            ctx.fillRect(9, 4, 1, 3);
            ctx.fillRect(10, 5, 1, 1);
            // Glint
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(3, 2, 2, 1);
            // Ribbon at bottom
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(3, 10, 3, 2);
            ctx.fillRect(6, 10, 3, 2);
        });

        // --- bloomberg-terminal (20x24) ---
        props['bloomberg-terminal'] = renderCanvasTexture(20, 24, function (ctx) {
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(2, 22, 18, 2);
            // Monitor body
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, 20, 16);
            // Screen
            ctx.fillStyle = '#020617';
            ctx.fillRect(1, 1, 18, 13);
            // Green chart line going up
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(2, 10, 1, 1);
            ctx.fillRect(3, 9, 1, 1);
            ctx.fillRect(4, 9, 1, 1);
            ctx.fillRect(5, 8, 1, 1);
            ctx.fillRect(6, 7, 1, 1);
            ctx.fillRect(7, 8, 1, 1);
            ctx.fillRect(8, 6, 1, 1);
            ctx.fillRect(9, 5, 1, 1);
            ctx.fillRect(10, 4, 1, 1);
            ctx.fillRect(11, 5, 1, 1);
            ctx.fillRect(12, 3, 1, 1);
            ctx.fillRect(13, 2, 1, 1);
            ctx.fillRect(14, 3, 1, 1);
            ctx.fillRect(15, 2, 1, 1);
            ctx.fillRect(16, 3, 1, 1);
            ctx.fillRect(17, 2, 1, 1);
            // Red line
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(2, 11, 1, 1);
            ctx.fillRect(3, 11, 1, 1);
            ctx.fillRect(4, 10, 1, 1);
            ctx.fillRect(5, 11, 1, 1);
            ctx.fillRect(6, 10, 1, 1);
            ctx.fillRect(7, 10, 1, 1);
            ctx.fillRect(8, 9, 1, 1);
            ctx.fillRect(9, 9, 1, 1);
            ctx.fillRect(10, 8, 1, 1);
            ctx.fillRect(11, 9, 1, 1);
            ctx.fillRect(12, 8, 1, 1);
            ctx.fillRect(13, 7, 1, 1);
            ctx.fillRect(14, 8, 1, 1);
            ctx.fillRect(15, 7, 1, 1);
            ctx.fillRect(16, 7, 1, 1);
            ctx.fillRect(17, 6, 1, 1);
            // Bloomberg text
            ctx.fillStyle = '#f97316';
            ctx.fillRect(2, 2, 6, 1);
            // Ticker data
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(2, 12, 4, 1);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(7, 12, 3, 1);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(11, 12, 3, 1);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(15, 12, 3, 1);
            // Stand
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(7, 16, 6, 2);
            // Keyboard
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(1, 19, 18, 4);
            ctx.fillStyle = '#334155';
            // Keys
            for (var ky = 20; ky < 23; ky++) {
                for (var kx = 2; kx < 18; kx += 2) {
                    ctx.fillRect(kx, ky, 1, 1);
                }
            }
            // Bloomberg special keys (colored)
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(2, 20, 2, 1);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(15, 20, 2, 1);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(2, 22, 2, 1);
        });

        return props;
    };

})();
