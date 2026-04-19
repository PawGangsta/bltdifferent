# BLT DFRNT Website — Locked Design System

This file is law. Every edit must comply. No exceptions, no "close enough."

---

## Grid System

**8px grid. Non-negotiable.**

Every size, spacing, padding, margin, gap, width, height, top, left, right, bottom must be a multiple of 8.

Valid values: 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128...

If you're tempted to use 5px, 10px, 12px, 14px, 18px, 20px, 22px, 30px — stop. Round to the nearest multiple of 8.

Exception: 1px borders and hairlines are fine. Font sizes are exempt (11px, 13px, 14px are OK). Line-height and letter-spacing are exempt.

---

## Color Tokens

Never invent colors. Use only these:

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#f5f5f5` | Page background |
| `--bg-surface` | `#fbfbfb` | Cards, nav bar, surfaces |
| `--text-primary` | `#0d0d0d` | Headings, strong text, brand black |
| `--text-secondary` | `#555555` | Body text |
| `--text-muted` | `#888888` | Labels, captions, muted |
| `--border` | `rgba(0,0,0,0.1)` | All borders |
| `--border-strong` | `rgba(0,0,0,0.4)` | Hover borders |

Use CSS variables where possible: `var(--bg)`, `var(--text-primary)` etc.

---

## Typography

- **Font**: IBM Plex Mono (primary), Fira Code (secondary), Courier New (fallback)
- **All headings and labels**: uppercase, tracked (`letter-spacing: 0.05em` to `0.1em`)
- **Body**: regular weight, monospace
- **Never**: serif fonts, sans-serif fonts, Google Fonts outside what's already imported

---

## Component Rules

### Cards
- Background: `#fbfbfb` (NOT pure white, NOT `#f5f5f5`)
- Border: `1px solid rgba(0,0,0,0.1)`
- Border radius: `0` — no rounded corners anywhere on this site
- Hover border: `rgba(0,0,0,0.4)`

### Navigation Bar
- `position: fixed; top: 16px; left: 16px; right: 16px` — floating, not edge-to-edge
- Background: `#fbfbfb`
- Border: `1px solid rgba(0,0,0,0.1)`
- Padding: `8px` uniform
- Layout: flex row, `justify-content: space-between`
- Nav items: `position: absolute; left: 50%; transform: translateX(-50%)` — always centered, never moves
- **Mobile first**: `.nav-items` and `.nav-cta` are `display: none` by default, shown at `min-width: 768px`
- **Burger button**: shown on mobile, hidden at `min-width: 768px`

### Logo
- Full logo: `/full-white.svg` — white SVG on the dark logo block
- Symbol: `/symbol-white.svg` — shown after scroll >40px via squish animation
- Logo block: `background: #0d0d0d; padding: 8px 16px`
- Logo image height: `24px`, width: `auto`
- Squish transition: `transform: scaleX(0)` → swap src → `transform: scaleX(1)` at 180ms

### Burger Menu Overlay
- Background: `#fbfbfb` — LIGHT, not dark
- `position: fixed; inset: 0; z-index: 99; padding-top: 72px`
- Items: full-width rows using `flex: 1`, centered text, `border-bottom: 1px solid rgba(0,0,0,0.08)`
- Item text: 14px, regular weight, `color: #888888`
- CTA row at bottom: `background: #0d0d0d; color: #fbfbfb; min-height: 72px`

### Buttons (primary)
- Border: `1px solid #0d0d0d`
- Text: `#0d0d0d`
- Background: transparent
- Hover: `background: #0d0d0d; color: #f5f5f5`
- Border radius: `0`

---

## CSS Rules

- **No inline styles.** All static styles go in `globals.css` as named classes.
- The only acceptable inline styles are dynamically set via JS refs at runtime (e.g. `transform`, `opacity` on animation elements).
- **Mobile first.** Write base styles for mobile, override at `@media (min-width: 768px)` for desktop.
- All CSS lives in `globals.css` under the appropriate `@layer` block.

---

## Design Language

- Blueprint grid background — always present on the page
- Crosshair cursor (full-width H line + full-height V line) with `+` at intersection
- On clickable elements: cursor becomes a filled dot (`8px`, `border-radius: 50%`)
- `cursor: none !important` on all elements — no system cursors anywhere
- Thin borders everywhere, no shadows (exception: very subtle `box-shadow` only if explicitly requested)
- No rounded corners
- All text uppercase where it's a label/nav/button
- Monospace everywhere

---

## Viewport Layout

Each section is `min-h-screen` with content centered (`flex items-center justify-center`). Every viewport feels like its own standalone page. Do not break this.

---

## What NOT to Do

- Do not use `position: sticky` for the nav — it's `position: fixed`
- Do not give the nav a dark (`#0d0d0d`) background — the nav is `#fbfbfb`
- Do not make the burger menu overlay dark — it's `#fbfbfb` with bordered rows
- Do not use `1fr` grid columns for the nav layout — use `auto 1fr auto` or flex
- Do not make `.nav-items` visible on mobile — `display: none` by default
- Do not add `border-radius` to anything
- Do not use colors outside the token table above
- Do not use spacing values that aren't multiples of 8
- Do not add comments explaining what the code does — only add comments for non-obvious WHY
