# Portfolio Website Revamp — Design Document

## Vision

A single-page personal brand website that tells Ranabir Basu's story as a scroll-driven narrative. Not a resume site. Not a corporate portfolio. A story someone stumbles onto and can't stop scrolling through.

**Tone:** First-person, conversational, slightly witty. Like telling your story at a party.
**Aesthetic:** Dark, cinematic, Apple-inspired. Smooth scroll animations, generous whitespace, premium typography. B's structure (Dynamic Storyteller) with A's taste (Quietly Powerful).

## Tech Stack

- **Vanilla HTML/CSS/JS** — no framework, no build step
- **GSAP + ScrollTrigger** — scroll-driven animations (the same library Apple uses)
- **Modern CSS** — custom properties, grid, clamp() for responsive typography
- **Google Fonts** — likely Inter or a similar clean sans-serif
- **Deploy on Vercel** — static site, instant loads

## Color Palette

- Background: near-black (#0a0a0a)
- Primary text: off-white (#f0f0f0)
- Accent: a muted teal or warm gold (TBD during implementation, something that pops against dark without screaming)
- Secondary text: medium gray (#888)
- Highlight cards: subtle lighter dark (#141414) with border or glow on hover

## Typography

- Headings: bold, large, confident — likely Inter or Space Grotesk
- Body: clean, readable at 18-20px, generous line-height
- Accent text (dates, labels): smaller, uppercase tracked, muted color
- All responsive via clamp() — no breakpoint spaghetti

## Site Structure (Scroll Sequence)

### 1. Hero (100vh)

Full viewport. Dark.

- "Ranabir Basu" animates in with staggered letter reveal
- A one-liner types itself out below: something like "From a monastery school to private credit — a story of curiosity."
- Subtle scroll indicator pulses at bottom
- On scroll: hero content parallax-fades upward and out
- No photo here — pure typography and atmosphere

### 2. The Arc (scrollytelling narrative)

The centerpiece. A scroll-driven journey through life chapters. Each chapter fades/slides in as you reach it. A subtle vertical thread (thin glowing line) connects them visually. Text blocks alternate left/right alignment.

**Chapter: "Narendrapur, 2010"**
Eight years at Ramakrishna Mission Vidyalaya — a 150-acre ashram campus, 5 AM wake-ups, evening meditation, Vivekananda's gurukul model. This is where it started: ISRO Space Quiz winner, Astronomy Olympiad qualifier, drawing competition champion. Discipline and curiosity baked in from day one.

**Chapter: "Kharagpur, 2019"**
Dropped a year to get into IIT. Built websites (this very site is what replaced his first one). Competitive coding phase. Then the pivot: Financial Engineering — one of 30 selected from 1,500+. Led a 70-person International Relations Cell under the Dean of Outreach. Directed Hult Prize on campus. Gold at Inter IIT Tech Meet.

**Chapter: "The Range Years, 2022–2024"**
Product & user growth at Snapdeal. Strategy at Venwiz. Investment banking at DC Advisory (earned a PPO). Published research in an international finance journal. Branding work for a funded startup. The thread: building things in every domain he touched.

**Chapter: "Joka, 2024"**
IIM Calcutta. Won the CFA Institute Research Challenge nationally, represented India at APAC. Became president of the Finance & Investments Club — then conducted the CFA IRC campus round himself. Competed in Hult Prize regionals after spending years directing it. Full circles everywhere.

**Chapter: "What's Next"**
Joining Ascertis Credit as Associate in the India Credit Division. Evaluating investment opportunities, building models, structuring deals in private credit. The curiosity continues — just with bigger numbers.

Ranabir's photo appears in chapter 2 or 3, sliding in with a slight parallax offset. Not a formal headshot — something natural.

### 3. Highlights (staggered card grid)

4-5 visual tiles that animate in with a stagger effect as you scroll:

- "National Winner" — CFA Institute Research Challenge, represented India at APAC
- "Published Researcher" — North American Journal of Economics & Finance
- "Top 5 / 800+" — Hult Prize global nominee, Nairobi
- "Gold Medal" — Inter IIT Tech Meet, ML for portfolio optimization
- "150+ Internships" — Led IIT KGP International Relations Cell

Cards: dark background (#141414), subtle border or accent glow, bold number/phrase up top, one-liner below. Staggered grid layout.

### 4. The Interesting Bits (editorial section)

Relaxed, personality-forward. Slightly different typography treatment — more editorial.

Full-circle stories:
- Directed Hult Prize at KGP → competed in it at IIM-C
- Won CFA IRC → conducted its campus round as club president
- Built a portfolio website as a sophomore → you're looking at what replaced it
- 1st in Illumination, drawing competitions — the creative side never left

Conversational tone. Maybe presented as short anecdotes or a flowing paragraph with key phrases highlighted.

### 5. Contact (minimal footer)

Dark background. Name displayed large.

- Email link
- LinkedIn icon
- Instagram icon
- "Download CV" button
- A closing line: something simple and inviting

## Animations (GSAP + ScrollTrigger)

- **Hero:** Staggered letter animation on load, type-writer effect for subtitle, parallax fade on scroll-out
- **Arc chapters:** Each fades + slides in (alternating from left/right) when scrolled into view. The vertical timeline thread draws itself as you scroll.
- **Photo:** Parallax offset, slides in from the side
- **Highlight cards:** Stagger animation — cards appear one by one with a slight delay between each
- **Interesting Bits:** Gentle fade-in, key phrases highlight on scroll
- **Contact:** Simple fade-in

All animations are smooth, purposeful, and unhurried. No bouncing, no wobble, no confetti. Every animation serves the narrative pacing.

## Responsive Strategy

- Desktop-first design (the scroll narrative is best experienced on desktop)
- Tablet: same layout, slightly smaller type, cards stack to 2-column
- Mobile: single column, simplified animations (no alternating left/right), timeline becomes edge-aligned, cards stack vertically
- All sizing via clamp() — fluid between breakpoints, no jarring shifts

## What We're NOT Building

- No blog
- No skills section (woven into the narrative)
- No formal education section (woven into the narrative)
- No hamburger menu / navigation (single scroll, no need)
- No dark/light toggle (it's dark, period)
- No analytics (can add later if wanted)
- No contact form (email link is enough)

## Files to Create

```
index.html          — all content, semantic HTML5
css/style.css       — all styles, clean and commented
js/main.js          — GSAP animations and scroll logic
assets/             — photo, updated CV PDF, any icons
```

The old Muse files (scripts/, fonts/, css/index.css, css/site_global.css, muse_manifest.xml, phone/, etc.) will be removed as part of the rewrite.

## Open Questions (to resolve during implementation)

- Exact accent color — will prototype a few options
- Photo selection — Ranabir to provide
- Exact copy/wording — will draft during build, refine with Ranabir
- CV PDF — needs updating with post-internship achievements
- Whether to add a subtle background texture or keep pure flat dark
