# Portfolio Website Revamp — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the old Adobe Muse portfolio with a modern, scroll-driven narrative personal brand site for Ranabir Basu.

**Architecture:** Single-page static site using vanilla HTML/CSS/JS with GSAP ScrollTrigger for scroll-driven animations. Dark cinematic aesthetic, five narrative sections, deployed on Vercel.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, clamp), vanilla JS (ES modules), GSAP 3 + ScrollTrigger (CDN), Google Fonts (Inter), Vercel for hosting.

---

## Task 1: Clean Up Old Files & Scaffold New Structure

**Files:**
- Delete: `css/index.css`, `css/site_global.css`
- Delete: `scripts/` (entire directory)
- Delete: `fonts/` (entire directory — using Google Fonts instead)
- Delete: `phone/` (entire directory)
- Delete: `muse_manifest.xml`, `sitemap.xml`, `_config.yml`
- Delete: `images/u112-6.png`, `images/u115-5.png`, `images/u121-6.png` (rasterized text)
- Delete: `images/asset 1.png`, `images/asset 2@2x.png` (old assets)
- Delete: `images/facebook_logos_png19754.png`, `images/instagram-png-instagram-logo-512.png`, `images/linkedin_png38.png` (old social icons — using inline SVG instead)
- Delete: `assets/facebook_logos_png19754.png`
- Delete: `assets/ranabirbasu_internshalaresume.pdf` (will be replaced with updated CV)
- Keep: `images/42467743_1961809980578234_486514709671968768_n.jpg` (Ranabir's photo, keep until replaced)
- Keep: `.gitattributes`, `README.md`
- Create: `css/style.css`
- Create: `js/main.js`

**Step 1: Delete old Muse files**

```bash
cd /Users/ranabirbasu/GitHub/ranabirbasu12.github.io
rm -rf scripts/ fonts/ phone/
rm muse_manifest.xml sitemap.xml _config.yml
rm css/index.css css/site_global.css
rm "images/u112-6.png" "images/u115-5.png" "images/u121-6.png"
rm "images/asset 1.png" "images/asset 2@2x.png"
rm "images/facebook_logos_png19754.png" "images/instagram-png-instagram-logo-512.png" "images/linkedin_png38.png"
rm assets/facebook_logos_png19754.png
rm assets/ranabirbasu_internshalaresume.pdf
```

**Step 2: Create new empty files**

```bash
touch css/style.css
mkdir -p js
touch js/main.js
```

**Step 3: Verify structure**

```bash
find . -not -path './.git/*' -not -path './docs/*' -not -name '.git' -not -name 'docs' | sort
```

Expected output should show: `.gitattributes`, `README.md`, `index.html`, `css/style.css`, `js/main.js`, `images/42467743...jpg`, `assets/` (empty)

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old Adobe Muse files, scaffold new structure"
```

---

## Task 2: Write the HTML Shell

**Files:**
- Rewrite: `index.html`

**Step 1: Write the complete HTML**

Replace `index.html` entirely with semantic HTML5. Structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ranabir Basu</title>
  <meta name="description" content="From a monastery school to private credit — the story of Ranabir Basu.">
  <meta property="og:title" content="Ranabir Basu">
  <meta property="og:description" content="From a monastery school to private credit — a story of curiosity.">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Section 1: Hero -->
  <section id="hero" class="hero">
    <div class="hero__content">
      <h1 class="hero__name" aria-label="Ranabir Basu">
        <span class="char">R</span><span class="char">a</span><span class="char">n</span><span class="char">a</span><span class="char">b</span><span class="char">i</span><span class="char">r</span>
        <span class="char space"> </span>
        <span class="char">B</span><span class="char">a</span><span class="char">s</span><span class="char">u</span>
      </h1>
      <p class="hero__tagline"></p> <!-- filled by typewriter JS -->
      <div class="hero__scroll-indicator">
        <span>Scroll</span>
        <div class="hero__scroll-line"></div>
      </div>
    </div>
  </section>

  <!-- Section 2: The Arc -->
  <section id="arc" class="arc">
    <div class="arc__timeline-line"></div>

    <article class="arc__chapter arc__chapter--left" data-year="2010">
      <span class="arc__year">Narendrapur, 2010</span>
      <h2>Eight years in a monastery school.</h2>
      <p>Ramakrishna Mission Vidyalaya — a 150-acre ashram campus built on Swami Vivekananda's idea of "man-making education." Wake up at 5:15 AM. Evening meditation. A gurukul in the truest sense.</p>
      <p>Somewhere between the prayers and the physics labs, a kid won ISRO's Space Quiz, qualified for the National Astronomy Olympiad, and took first place in drawing competitions. Discipline and curiosity — baked in from day one.</p>
    </article>

    <article class="arc__chapter arc__chapter--right" data-year="2019">
      <span class="arc__year">Kharagpur, 2019</span>
      <h2>IIT, and everything that followed.</h2>
      <p>Dropped a year to get here. Started building websites — you're looking at what replaced that first one. Went through a competitive coding phase. Then discovered Financial Engineering, and became one of 30 selected from 1,500+ students.</p>
      <p>Led a 70-person International Relations Cell under the Dean of Outreach. Directed Hult Prize on campus. Won Gold at Inter IIT Tech Meet building an ML framework for portfolio optimization. Published research in an international finance journal.</p>
    </article>

    <article class="arc__chapter arc__chapter--left" data-year="2022">
      <span class="arc__year">The Range Years, 2022–2024</span>
      <h2>Product. Strategy. Investment Banking.</h2>
      <p>Built features at Snapdeal. Designed vendor systems at Venwiz. Evaluated life insurance firms and scraped 39,000 government tenders at DC Advisory — and earned a full-time offer in investment banking.</p>
      <p>The thread connecting it all? An inability to sit still, and a habit of building things in every domain.</p>
      <img class="arc__photo" src="images/42467743_1961809980578234_486514709671968768_n.jpg" alt="Ranabir Basu" loading="lazy">
    </article>

    <article class="arc__chapter arc__chapter--right" data-year="2024">
      <span class="arc__year">Joka, 2024</span>
      <h2>Full circles.</h2>
      <p>IIM Calcutta. Won the CFA Institute Research Challenge nationally and represented India at the Asia-Pacific finals. Became president of the Finance &amp; Investments Club — then found himself conducting the campus round of the very competition he'd won.</p>
      <p>Competed in Hult Prize regionals, years after directing it at KGP. Some things just come back around.</p>
    </article>

    <article class="arc__chapter arc__chapter--left" data-year="2026">
      <span class="arc__year">What's Next</span>
      <h2>Private credit.</h2>
      <p>Joining Ascertis Credit as Associate in the India Credit Division. Evaluating deals, building models, structuring terms — deciding which investment opportunities get a go and which get a pass.</p>
      <p>The curiosity continues. Just with bigger numbers now.</p>
    </article>
  </section>

  <!-- Section 3: Highlights -->
  <section id="highlights" class="highlights">
    <div class="highlights__grid">
      <div class="highlight-card">
        <span class="highlight-card__label">National Winner</span>
        <p>CFA Institute Research Challenge. Represented India at APAC.</p>
      </div>
      <div class="highlight-card">
        <span class="highlight-card__label">Published Researcher</span>
        <p>North American Journal of Economics &amp; Finance. 29K+ citation journal.</p>
      </div>
      <div class="highlight-card">
        <span class="highlight-card__label">Top 5 / 800+</span>
        <p>Hult Prize global nominee. Nairobi, 2022.</p>
      </div>
      <div class="highlight-card">
        <span class="highlight-card__label">Gold Medal</span>
        <p>Inter IIT Tech Meet. ML framework for portfolio optimization.</p>
      </div>
      <div class="highlight-card">
        <span class="highlight-card__label">150+ Internships</span>
        <p>Led IIT KGP's International Relations Cell. Stanford, Yale, INR 9.8M in funding.</p>
      </div>
    </div>
  </section>

  <!-- Section 4: The Interesting Bits -->
  <section id="bits" class="bits">
    <h2 class="bits__heading">The interesting bits.</h2>
    <div class="bits__content">
      <p>I directed the Hult Prize at IIT Kharagpur in 2022. Three years later, I was competing in it at IIM Calcutta.</p>
      <p>I won the CFA Institute Research Challenge as a student. Then as president of the Finance Club, I ended up conducting its campus round.</p>
      <p>I built a portfolio website during my sophomore year of engineering. You're on the site that replaced it.</p>
      <p>I won Illumination at Inter-Hall, placed in Rangoli, took first in a drawing competition at school. The creative side never quite left — it just learned to read balance sheets.</p>
    </div>
  </section>

  <!-- Section 5: Contact -->
  <footer id="contact" class="contact">
    <h2 class="contact__name">Ranabir Basu</h2>
    <p class="contact__cta">Let's talk.</p>
    <div class="contact__links">
      <a href="mailto:ranabirbasu12@gmail.com" class="contact__link" aria-label="Email">
        <!-- inline SVG: mail icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      </a>
      <a href="https://www.linkedin.com/in/ranabir-b-ab2374113/" target="_blank" rel="noopener" class="contact__link" aria-label="LinkedIn">
        <!-- inline SVG: linkedin icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
      </a>
      <a href="https://www.instagram.com/arubbas_mirani/" target="_blank" rel="noopener" class="contact__link" aria-label="Instagram">
        <!-- inline SVG: instagram icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
      </a>
    </div>
    <a href="assets/ranabir_basu_cv.pdf" target="_blank" class="contact__cv-btn">Download CV</a>
    <p class="contact__footer-note">Built by Ranabir Basu. With a little help from Claude.</p>
  </footer>

  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

**Step 2: Verify HTML renders (unstyled but structurally correct)**

Open in browser: `open index.html`

Should see all text content in default browser styling — all 5 sections visible, SVG icons render, photo loads.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: rewrite index.html with semantic narrative structure"
```

---

## Task 3: Write the CSS — Reset, Custom Properties & Typography

**Files:**
- Create: `css/style.css`

**Step 1: Write CSS reset, custom properties, base typography, and body styles**

```css
/* ============================================
   RESET & CUSTOM PROPERTIES
   ============================================ */

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* Colors */
  --bg: #0a0a0a;
  --bg-card: #141414;
  --text: #f0f0f0;
  --text-muted: #888;
  --accent: #c9a84c; /* warm gold — stands out on dark without screaming */
  --accent-glow: rgba(201, 168, 76, 0.15);
  --timeline-line: rgba(201, 168, 76, 0.3);

  /* Typography */
  --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --fs-hero: clamp(3rem, 8vw, 7rem);
  --fs-h2: clamp(1.75rem, 4vw, 3rem);
  --fs-body: clamp(1rem, 1.5vw, 1.25rem);
  --fs-small: clamp(0.75rem, 1vw, 0.875rem);
  --fs-label: clamp(1.25rem, 2vw, 1.75rem);
  --lh-body: 1.7;

  /* Spacing */
  --section-pad: clamp(4rem, 10vw, 8rem);
  --content-max: 900px;
}

html {
  scroll-behavior: auto; /* GSAP handles smooth scrolling */
}

body {
  font-family: var(--font);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  color: var(--text);
  background-color: var(--bg);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: var(--accent);
  text-decoration: none;
  transition: opacity 0.3s ease;
}

a:hover {
  opacity: 0.7;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

::selection {
  background: var(--accent);
  color: var(--bg);
}
```

**Step 2: Verify in browser**

Open `index.html` — should see dark background, off-white text, Inter font loading, warm gold links.

**Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add CSS reset, custom properties, and base typography"
```

---

## Task 4: Write the CSS — Hero Section

**Files:**
- Modify: `css/style.css` (append)

**Step 1: Append hero styles to style.css**

```css
/* ============================================
   HERO
   ============================================ */

.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero__content {
  text-align: center;
  padding: 0 2rem;
}

.hero__name {
  font-size: var(--fs-hero);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.hero__name .char {
  display: inline-block;
  opacity: 0;
  transform: translateY(40px);
}

.hero__name .char.space {
  width: 0.3em;
}

.hero__tagline {
  font-size: clamp(1rem, 2vw, 1.375rem);
  color: var(--text-muted);
  font-weight: 300;
  min-height: 2em;
  letter-spacing: 0.01em;
}

.hero__scroll-indicator {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  opacity: 0;
}

.hero__scroll-indicator span {
  font-size: var(--fs-small);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 500;
}

.hero__scroll-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, var(--accent), transparent);
  animation: scrollPulse 2s ease-in-out infinite;
}

@keyframes scrollPulse {
  0%, 100% { opacity: 0.3; transform: scaleY(0.6); }
  50% { opacity: 1; transform: scaleY(1); }
}
```

**Step 2: Verify — hero should be centered, full viewport, dark background**

**Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add hero section CSS"
```

---

## Task 5: Write the CSS — Arc Section

**Files:**
- Modify: `css/style.css` (append)

**Step 1: Append arc styles**

```css
/* ============================================
   ARC (TIMELINE)
   ============================================ */

.arc {
  position: relative;
  padding: var(--section-pad) 2rem;
  max-width: var(--content-max);
  margin: 0 auto;
}

.arc__timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--timeline-line);
  transform: translateX(-50%);
  transform-origin: top;
}

.arc__chapter {
  position: relative;
  width: 45%;
  margin-bottom: clamp(4rem, 8vw, 8rem);
  opacity: 0;
  transform: translateY(60px);
}

.arc__chapter--left {
  margin-right: auto;
  text-align: left;
}

.arc__chapter--right {
  margin-left: auto;
  text-align: left;
}

.arc__year {
  display: inline-block;
  font-size: var(--fs-small);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--accent);
  margin-bottom: 1rem;
}

.arc__chapter h2 {
  font-size: var(--fs-h2);
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.arc__chapter p {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.arc__chapter p:last-of-type {
  margin-bottom: 0;
}

.arc__photo {
  margin-top: 2rem;
  border-radius: 8px;
  opacity: 0;
  transform: translateX(-40px);
}

/* ============================================
   RESPONSIVE: ARC
   ============================================ */

@media (max-width: 768px) {
  .arc__timeline-line {
    left: 1rem;
  }

  .arc__chapter {
    width: 100%;
    padding-left: 2.5rem;
  }

  .arc__chapter--right {
    margin-left: 0;
  }
}
```

**Step 2: Verify — chapters should be alternating left/right with a center line on desktop, left-aligned on mobile**

**Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add arc/timeline section CSS"
```

---

## Task 6: Write the CSS — Highlights, Bits & Contact

**Files:**
- Modify: `css/style.css` (append)

**Step 1: Append remaining section styles**

```css
/* ============================================
   HIGHLIGHTS
   ============================================ */

.highlights {
  padding: var(--section-pad) 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.highlights__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.highlight-card {
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 2rem;
  opacity: 0;
  transform: translateY(40px);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.highlight-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 30px var(--accent-glow);
}

.highlight-card__label {
  display: block;
  font-size: var(--fs-label);
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.75rem;
}

.highlight-card p {
  color: var(--text-muted);
  font-size: var(--fs-body);
}

/* ============================================
   THE INTERESTING BITS
   ============================================ */

.bits {
  padding: var(--section-pad) 2rem;
  max-width: var(--content-max);
  margin: 0 auto;
}

.bits__heading {
  font-size: var(--fs-h2);
  font-weight: 600;
  margin-bottom: 2.5rem;
  opacity: 0;
  transform: translateY(30px);
}

.bits__content p {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  font-size: clamp(1.05rem, 1.6vw, 1.3rem);
  line-height: 1.8;
  opacity: 0;
  transform: translateY(20px);
}

/* ============================================
   CONTACT
   ============================================ */

.contact {
  padding: var(--section-pad) 2rem;
  text-align: center;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.contact__name {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.contact__cta {
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  color: var(--text-muted);
  font-weight: 300;
}

.contact__links {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.contact__link {
  color: var(--text);
  transition: color 0.3s ease, transform 0.3s ease;
}

.contact__link:hover {
  color: var(--accent);
  transform: translateY(-2px);
  opacity: 1;
}

.contact__link svg {
  width: 28px;
  height: 28px;
}

.contact__cv-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.85rem 2rem;
  border: 1px solid var(--accent);
  border-radius: 8px;
  color: var(--accent);
  font-size: var(--fs-body);
  font-weight: 500;
  letter-spacing: 0.03em;
  transition: background 0.3s ease, color 0.3s ease;
}

.contact__cv-btn:hover {
  background: var(--accent);
  color: var(--bg);
  opacity: 1;
}

.contact__footer-note {
  margin-top: 3rem;
  font-size: var(--fs-small);
  color: var(--text-muted);
  opacity: 0.5;
}
```

**Step 2: Verify all sections render correctly in browser**

**Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add highlights, bits, and contact section CSS"
```

---

## Task 7: Write the JavaScript — GSAP Animations

**Files:**
- Create: `js/main.js`

**Step 1: Write all GSAP animation logic**

```js
/* ============================================
   MAIN.JS — GSAP SCROLL ANIMATIONS
   ============================================ */

gsap.registerPlugin(ScrollTrigger);

// ---- Hero: staggered letter reveal ----

function initHero() {
  const chars = document.querySelectorAll('.hero__name .char');
  const scrollIndicator = document.querySelector('.hero__scroll-indicator');

  // Staggered letter animation
  gsap.to(chars, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.05,
    ease: 'power3.out',
    delay: 0.3,
    onComplete: () => {
      typeTagline();
      gsap.to(scrollIndicator, { opacity: 1, duration: 1, delay: 1 });
    }
  });

  // Parallax fade out on scroll
  gsap.to('.hero__content', {
    y: -100,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
}

// ---- Hero: typewriter effect ----

function typeTagline() {
  const el = document.querySelector('.hero__tagline');
  const text = 'From a monastery school to private credit — a story of curiosity.';
  let i = 0;

  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, 30);
    }
  }

  type();
}

// ---- Arc: chapter reveals ----

function initArc() {
  // Draw the timeline line as user scrolls
  gsap.fromTo('.arc__timeline-line',
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.arc',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: true
      }
    }
  );

  // Each chapter fades and slides in
  document.querySelectorAll('.arc__chapter').forEach((chapter) => {
    const isLeft = chapter.classList.contains('arc__chapter--left');

    gsap.fromTo(chapter,
      { opacity: 0, x: isLeft ? -60 : 60, y: 40 },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: chapter,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Photo parallax
  const photo = document.querySelector('.arc__photo');
  if (photo) {
    gsap.fromTo(photo,
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: photo,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  }
}

// ---- Highlights: staggered card reveal ----

function initHighlights() {
  gsap.fromTo('.highlight-card',
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.highlights__grid',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );
}

// ---- Bits: paragraph fade-ins ----

function initBits() {
  gsap.fromTo('.bits__heading',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.bits__heading',
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    }
  );

  document.querySelectorAll('.bits__content p').forEach((p) => {
    gsap.fromTo(p,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: p,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
}

// ---- Contact: fade in ----

function initContact() {
  gsap.fromTo('.contact',
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.contact',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );
}

// ---- Initialize everything ----

document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initArc();
  initHighlights();
  initBits();
  initContact();
});
```

**Step 2: Test in browser**

Open `index.html`, scroll through. Verify:
- Hero letters animate in on load
- Tagline types itself out
- Scroll indicator appears
- Hero fades on scroll
- Arc chapters slide in from alternating sides
- Timeline line draws itself
- Photo slides in
- Highlight cards stagger in
- Bits paragraphs fade in
- Contact fades in

**Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: add GSAP scroll-driven animations"
```

---

## Task 8: Visual Polish & Responsive Fixes

**Files:**
- Modify: `css/style.css` (adjust as needed)
- Modify: `index.html` (minor tweaks if needed)

**Step 1: Open in browser at various widths and fix any layout issues**

Test at: 1440px, 1024px, 768px, 375px

Key things to check and fix:
- Hero name doesn't overflow on mobile
- Arc chapters stack properly on mobile (single column, left-aligned)
- Highlight cards grid collapses to single column on small screens
- Contact section spacing works on all sizes
- Font sizes are readable everywhere (clamp should handle this)
- No horizontal overflow anywhere

**Step 2: Add any needed responsive tweaks**

Append to `css/style.css`:

```css
/* ============================================
   GLOBAL RESPONSIVE TWEAKS
   ============================================ */

@media (max-width: 768px) {
  .hero__name {
    letter-spacing: -0.03em;
  }

  .highlights__grid {
    grid-template-columns: 1fr;
  }

  .contact__links {
    gap: 1.5rem;
  }
}
```

**Step 3: Commit**

```bash
git add css/style.css index.html
git commit -m "fix: responsive layout adjustments for mobile and tablet"
```

---

## Task 9: Deploy to Vercel

**Files:**
- None created (Vercel config via CLI)

**Step 1: Ensure all changes are committed**

```bash
cd /Users/ranabirbasu/GitHub/ranabirbasu12.github.io
git status
```

**Step 2: Push to GitHub**

```bash
git push origin master
```

**Step 3: Deploy via Vercel CLI (or connect repo in Vercel dashboard)**

```bash
npx vercel --prod
```

Follow prompts — select the project root, no framework, no build command, output directory is `.` (root).

**Step 4: Verify the live site**

Open the Vercel URL in browser. Test scroll animations, mobile view, all links work.

**Step 5: Commit any Vercel config if generated**

```bash
git add -A
git commit -m "chore: add Vercel deployment config"
git push origin master
```

---

## Task 10: Final Content Review & Photo Swap

**Files:**
- Modify: `index.html` (if copy changes needed)
- Add: `assets/ranabir_basu_cv.pdf` (updated CV)
- Potentially replace: `images/42467743...jpg` with a better photo

**Step 1: Review all copy with Ranabir**

Read through the live site together. Adjust any wording that doesn't feel right.

**Step 2: Swap in updated photo**

When Ranabir provides a new photo, replace the old one and update the `src` in `index.html`.

**Step 3: Add updated CV PDF**

Place the new CV at `assets/ranabir_basu_cv.pdf` — the HTML already links to this path.

**Step 4: Commit and redeploy**

```bash
git add -A
git commit -m "feat: update photo, CV, and copy refinements"
git push origin master
npx vercel --prod
```

---

## Summary

| Task | What | Commit |
|------|------|--------|
| 1 | Clean up old files, scaffold | `chore: remove old Adobe Muse files...` |
| 2 | Write complete HTML | `feat: rewrite index.html...` |
| 3 | CSS: reset, variables, typography | `feat: add CSS reset...` |
| 4 | CSS: hero section | `feat: add hero section CSS` |
| 5 | CSS: arc/timeline section | `feat: add arc/timeline section CSS` |
| 6 | CSS: highlights, bits, contact | `feat: add highlights, bits, and contact...` |
| 7 | JS: all GSAP animations | `feat: add GSAP scroll-driven animations` |
| 8 | Responsive polish | `fix: responsive layout adjustments...` |
| 9 | Deploy to Vercel | `chore: add Vercel deployment config` |
| 10 | Content review, photo, CV swap | `feat: update photo, CV, and copy...` |
