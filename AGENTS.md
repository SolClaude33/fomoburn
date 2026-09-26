# Repository Guidelines

## Project
Fomo Burn: a site built around fomo.family where people post their thesis. For each thesis posted, the dev buys back and burns the token using trading fees (the token has a 3% tax on buy and sell). The site is a static HTML landing page.

## Structure
- `assets/`: final served assets. Logo: `fomo-burn-logo.svg` (navy background) and `fomo-burn-mark.svg` (transparent), plus PNGs at 256/512/1024.
- `assets/` also holds the Higgsfield photos as responsive WebP: `hero-earth-*` (the Earth horizon on fire, hero), `ledger-thesis-*` (a burning thesis, Burn log) and `cta-astronaut-*` (an astronaut with a torch, final CTA).
- `assets-src/`: originals and working files, not served. It holds PNG originals `*-v01.png`, `fomo-logo-original.png` and `logo-lab.html`, and it is listed in `.vercelignore`.

## Logo construction
- The fomo mark is two ellipses (rx 112.5, ry 125, skewX -10.8°) centred at (168, 256) and (340.75, 256) on a 512 grid. Their counters are parallelograms spanning y 196.25–316.25.
- The **right O sits on top of the left O**: its counter cuts into the left O.
- The fire is flat, two-tone and sheared at the same -10.8°. A navy halo is made as a stroke on the ellipses, not a filter.
- Palette: navy `#0b091f`, lavender `#eaedff`, fire `#ff4d1f`, core `#ffb021`.

## Landing site (static HTML: `index.html`, `styles.css`, `main.js`; the page is in English)
- Direction: "Orbital burn". It borrows fomo.family's space look (Earth from orbit, an astronaut) with the horizon on fire, uses the flat logo and brand shapes on top of photo-real space, and keeps fire as the only warm accent. The -10.8° skew is the recurring motif (buttons, stamps, numbers, canvas sparks). Avoid gradients on the logo and generic crypto neon.
- Motion (`main.js`, CSS): a staggered entrance on load, sparks on a canvas that pause when off-screen, parallax on the Earth and the astronaut, a fuse in How it works that burns with scroll and lights the steps, `.rv` reveals via IntersectionObserver (they use `translate`, not `transform`, so they don't clash with the skew), marquee bands and grain. Everything turns off under `prefers-reduced-motion`.
- Tokens live in `:root` in `styles.css`. Fonts: Bricolage Grotesque (display), Instrument Sans (body), Martian Mono (data). Spacing is on an 8pt grid. Radii are 10/20/28px. Easing is `--ease-out` / `--ease-snap`.
- Launch data: the CA, ticker, fomo URL and socials come from Vercel env vars `FOMO_CA`, `FOMO_TICKER`, `FOMO_TOKEN_URL`, `FOMO_X_URL` and `FOMO_TELEGRAM_URL` (URLs must be https). `scripts/build.mjs` has no dependencies: it copies the site to `dist/` and writes `dist/config.js`. The committed `config.js` holds null defaults for local work. `STATS` and `RECEIPTS` in `main.js` stay empty, which keeps the empty state; never invent numbers.

## Commands
- Local preview: the `fomo-burn` config in the parent repo's `.claude/launch.json` runs `python -m http.server 5173`.
- Production build: `node scripts/build.mjs` writes `dist/` (Vercel runs it via `vercel.json`). Env var changes only take effect after a redeploy.
- PNG export: headless Edge with `--screenshot` over the SVG.

## Limits
Work locally only. Do not push or deploy until Nicol gives the target repo. Images come only from Higgsfield, with a cap of 3 credits per image.
