# Retro Pixel Portfolio — HD-2D Upgrade Design

## Vision
An 8-bit side-scroller portfolio that tells Ranabir Basu's career story chronologically. The user scrolls left-to-right through 12 scenes. A CSS pixel character walks through time, aging and evolving visually. HD-2D aesthetic: pixel art sprites with modern lighting, blur depth-of-field, glow effects, and ambient particles.

## Tech Stack
- Vanilla HTML/CSS/JS
- GSAP 3 + ScrollTrigger (horizontal pin + scrub)
- Google Fonts: Press Start 2P + VT323
- All sprites/props built in CSS (no image assets for character)
- Additional libs welcome if they enhance animation quality

## 12 Scenes (Left-to-Right, Chronological)

### 1. Intro
Dark void, spotlight, pixel stars. Character waves. Dialogue box: "Hi, I'm Ranabir. Welcome to my timeline." Typewriter effect. Arrow: "SCROLL RIGHT →"

### 2. IIT KGP Arrival (2019)
Campus gate silhouette, trees, hostel. Warm sunset palette. Character walks in with suitcase, looks up in awe. Age 19, messy hair, t-shirt, sneakers.

### 3. The Panic (~2021)
Dorm room. Messy bed, empty desk, laptop showing "CV.pdf — 0 items". Character cycles: head-in-hands, pacing, banging head on desk. Dark moody lighting, flickering tube light. Health bar LOW.

### 4. IIM-B Research (2022)
Academic office. Stacked papers, terminal showing crawler code, professor NPC in background. Character typing fast. Green "hacker" glow from monitor.

### 5. Snapdeal Internship (Summer 2022)
Startup office. Bean bags, pizza boxes, energy drinks, messy whiteboard. Bright chaotic palette. Character in hoodie juggling two laptops.

### 6. Venwiz Internship (Dec 2022 - Feb 2023)
Cleaner startup. Whiteboard with flowcharts, standing desk. Character pointing at charts, more composed.

### 7. DC Advisory (Summer 2023)
Corporate office. Mahogany desk, Bloomberg terminal, coffee cups that keep growing. Night skyline through window. Character in formal clothes, crooked tie, struggling then grinding. Dim warm lighting.

### 8. IIT KGP Graduation + Trophies
Outdoor stage. Trophy shelf: CFA IRC (national winner), Inter IIT Gold, Hult Prize, published paper. Character in graduation cap jumping. Confetti particles. Bright celebratory palette.

### 9. IIM Calcutta (2024)
New campus. Books piling up over time. "President" nameplate, Finance & Investments Club banner. Character confidently leaning back. Mature energy.

### 10. Ascertis Internship (2025)
Private credit office. Financial models on screen. Character working focused. Earns PPO — trophy/badge animation.

### 11. IIM-C Graduation (2026)
Cap throw, degree in hand. Celebration. Similar energy to scene 8 but more mature — calm pride vs youthful excitement.

### 12. Ascertis Full-Time — Current Quest
Sleek modern desk, dual monitors with deal models, city skyline. Character calmly typing, slight smile. Floating ₹ symbols around. Cool-blue palette. HUD: "Current Quest: Structuring private credit deals."

## Character Evolution
- **Scenes 2-3:** Small, messy hair, t-shirt, sneakers. Bouncy/frantic animations.
- **Scenes 4-6:** Same height, neater. Casual shirt. Focused/confused animations.
- **Scene 7:** First formal clothes, crooked tie. Nervous then exhausted animations.
- **Scene 8:** Graduation cap, jumping. Triumphant.
- **Scenes 9-10:** Taller, confident posture, proper clothes. Calm animations.
- **Scenes 11-12:** Final form — clean formal, glasses glint, settled energy.

## HD-2D Visual Layer
- Background layers: CSS `filter: blur(2px)` for depth-of-field
- Foreground props: sharp, no blur
- Soft radial gradient spotlight on character per scene
- Ambient particles per scene: dust, steam, confetti, code chars, ₹ coins
- Parallax: background moves slower than foreground on scroll
- CRT scanline overlay on entire page
- Scene-specific color palettes via CSS custom properties

## HUD System
- LVL = age, updates per scene
- XP bar fills across all scenes
- Class title changes (Student → Intern → Analyst → Associate)
- Quest one-liner per scene
- Health bar (low during panic, full during graduations)

## Floating Collectibles
- ₹ coins near finance scenes
- `{ }` brackets near tech scenes
- Book icons near campus scenes
- Trophy icons near achievement scenes
- All gently bobbing with CSS keyframe animation

## Boot Screen
Fake terminal lines scroll before start:
- "Loading quest log..."
- "Checking inventory..."
- "Mounting timeline..."
- Loading bar fills (stepped 8-bit animation)
- "PRESS [SCROLL] TO START" (blinking)

## Easter Eggs
- Click coffee cup → character chugs it
- Click blank CV in panic scene → sad face appears
- More to discover during implementation

## Sound (Optional Toggle)
- 8-bit blips on scene transitions
- Typing sounds during desk scenes
- Graduation fanfare
- Coin collect sound on ₹ pickups

## Achievements Section (Vertical, After Scroll)
Pixel aesthetic with scanline effect. Cards for: CFA IRC National Winner, Published Scholar, Inter IIT Medals, Hult Prize Global Top 5.

## Contact ("INITIATE CO-OP MODE?")
Pixel buttons: SEND_MESSAGE, LINKEDIN_PROFILE, DOWNLOAD_SAVE_FILE

## Responsive
Mobile: scenes stack vertically, character walks downward instead of rightward.

## Scroll Direction
Left-to-right (past → present). Character walks forward through time.
