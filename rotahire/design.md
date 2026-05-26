# RotaHire UI Implementation Guide

_Last updated: 28 Nov 2025_

This document translates the current RotaHire codebase into a practical UI reference so new pages and features match the shipped experience. It complements the higher-level `DESIGN_SYSTEM.md` by describing what is actually implemented in `src/` today.

- [1. Design Foundations](#1-design-foundations)
- [2. Global Layout & Navigation](#2-global-layout--navigation)
- [3. Component Standards](#3-component-standards)
- [4. Interaction & Motion](#4-interaction--motion)
- [5. Accessibility & Responsiveness](#5-accessibility--responsiveness)
- [6. Implementation Checklist](#6-implementation-checklist)
- [7. Reference Files](#7-reference-files)

## 1. Design Foundations

### 1.1 Typography
- **Fonts loaded globally** via `next/font` in `src/app/layout.js`:
  - `Bebas Neue` → CSS var `--font-bebas`; used sparingly for oversized hero text.
  - `Poppins` (weights 100-900) → `--font-poppins`; default for navigation, headings, buttons, pills.
- `Inter` is referenced directly via utility classes (e.g., `font-['Inter']`) for secondary copy, metadata, and inputs.
- **Line height & hierarchy**: hero/section headings run 1.2–1.3 line-height; body copy 1.4–1.6. Maintain text clamping (`line-clamp-2`) for cards as in `JobCard.jsx`.

### 1.2 Color System (from `src/app/globals.css`)
| Token | OKLCH value | Approx Hex | Usage |
| --- | --- | --- | --- |
| `--primary` | oklch(0.205 0 0) | #0D0D0D | Body text, default button background. |
| `--primary-foreground` | oklch(0.985 0 0) | #FDFDFD | Text on dark fills. |
| `--secondary` | oklch(0.97 0 0) | #F9F9F9 | Neutral backgrounds (filters, chips). |
| `--muted-foreground` | oklch(0.556 0 0) | #6F6F6F | Secondary copy.
| `--border`/`--input` | oklch(0.922 0 0) | #EAEAEA | Card/input outlines.
| `--ring` | oklch(0.708 0 0) | #B3B3B3 | Focus ring.
| `--destructive` | oklch(0.577 0.245 27.325) | #E25A3C | Errors/danger actions.
| `--color-cranberry` | oklch(0.57 0.2173 8.97) | #D81B5D | Brand accent (CTAs, highlights). |
| `--color-blackD` | #121212 | Used via Tailwind alias `text-blackD`. |

**Brand accent helpers:** Tailwind classes such as `bg-cranberry`, `text-cranberry`, `bg-[#FFF8FA]`, `border-[#FFDDE6]` are defined inline for quick gradients.

### 1.3 Radius, Shadows & Spacing
- Base radius (`--radius`) = 10px; derived tokens (sm/md/lg/xl) auto-calculated in CSS and reused in components.
- Cards & CTAs usually use `rounded-[12px]` – `rounded-[32px]` to maintain soft edges.
- Shadows stay subtle: `shadow-sm`, `hover:shadow-lg`, or custom `shadow-[0_12px_24px_-18px_rgba(216,27,93,0.45)]` on filters.
- Spacing follows an 8px grid. Common wrappers use `px-4 md:px-8` with `max-w-7xl mx-auto`. Vertical rhythm uses `py-6`, `pt-20` (to clear the floating nav), and section padding from 40–80px.

### 1.4 Theme & Mode
- Light mode only. `globals.css` forces `color-scheme: light` even when the OS prefers dark.
- Custom `@theme inline` exposes CSS variables so Tailwind classes (e.g., `bg-card`, `text-muted-foreground`) remain in sync.

## 2. Global Layout & Navigation

-### 2.1 Root Layout (`src/app/layout.js`)
- Wraps every page with `SessionProvider`, global `<NavBar />`, and `<Toaster richColors />`.
- `body` carries `antialiased dark` classes plus font variables; `pt-20` offsets the floating nav height.
- **NavBar visibility**: Because `RootLayout` sits above every route segment, the public navigation renders by default everywhere. When a surface must hide it (e.g., admin dashboards), wrap that subtree in a layout that excludes `NavBar` from its output. The admin stack does this via `src/app/admin/layout.js`, which conditionally returns children without re-rendering `NavBar` when the URL starts with `/admin/**`.

### 2.2 Public Navigation (`src/components/NavBar.jsx`)
- **Floating glass bar**: `fixed` at center, `bg-white/50`, blur, border, and transitions from rounded pill (`top-5 w-11/12 rounded-2xl`) to flat full-width bar when scrolled >20px.
- **Nav links**: lowercase Poppins, letter-spaced, with cranberry gradient underline on hover. Use `group` hover to animate `span` width.
- **Actions**: two `Button` components.
  - External link button: outline style with `border border-gray-400`, neutral colors.
  - Primary CTA: `bg-cranberry/80` with `Plus` icon.
- Always keep nav height consistent (~56px). On public pages, plan `padding-top` to avoid content being covered.

### 2.3 Page Layout Patterns
- **Hero sections** (e.g., `src/app/jobs/page.jsx`): gradient backgrounds (`bg-gradient-to-br from-[#FFF8FA] via-white`), blurred circular accents, centered text, and search bars stacked below.
- **Content width**: use `max-w-7xl mx-auto` plus responsive paddings.
- **Grid usage**: cards often flow within `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` for resilient layouts.

-### 2.4 Admin Surfaces
- `src/app/admin/layout.js` guards routes with `PrivateRoute` but leaves rendering to nested layouts.
- The admin layout also **suppresses the global NavBar**: the file simply returns `{children}` when the path is `/admin/login` and wraps other pages in `PrivateRoute`, meaning no header is added above admin content. This is why admin views rely solely on the Sidebar for navigation.
- `src/app/admin/dashboard/layout.js` sets the canonical admin shell:
  - Flex row, light gray background, 100vh height.
  - `<SideNav />` fixed at 256px (lg breakpoint) with mobile overlay fallback.
  - Content area adds `lg:ml-64` to account for the fixed sidebar.
- **Rule of thumb**: Admin pages inside `/admin/dashboard/**` should assume there is **no public NavBar**. Use just the sidebar + internal headers for nav.

### 2.5 Side Navigation (`src/app/admin/dashboard/components/SideNav.jsx`)
- Uses GSAP for load-in animation and micro interactions.
- **Desktop**: fixed column with border, brand lockup, nav list, and user summary. Active item → `bg-[#D81B5D] text-white`.
- **Mobile**: hamburger toggles a slide-in drawer; overlay dims background (`bg-black/40`). Buttons maintain 44px height for touch compliance.
- Logout card uses hover states (`hover:bg-red-50 hover:text-red-600`) for clarity.

## 3. Component Standards

### 3.1 Buttons (`src/components/ui/button.jsx`)
- **Base class**: `inline-flex items-center gap-2 rounded-md text-sm font-medium transition-all cursor-pointer`. SVGs auto-size to 16px.
- **Focus**: `focus-visible:border-ring` + `focus-visible:ring-ring/50` with 3px halo.
- **Variants**:
  - `default`: solid `bg-primary text-primary-foreground` (nearly black background + white text). Override to cranberry for marketing CTAs.
  - `destructive`: orange-red background, tinted ring for error paths.
  - `outline`: border-only, inherits background, lifts slightly on hover.
  - `secondary`: light filled neutral.
  - `ghost`: text-only with hover fill.
  - `link`: inline text link with underline-on-hover.
- **Sizes**: `sm` (32px), `default` (36px), `lg` (40px), icon-only (`size-9`). Always use `cursor-pointer` and `transition-all duration-200` to keep parity with nav interactions.
- **Usage tips**: Compose new CTA styles by passing `className` overrides (e.g., Job card apply button sets `bg-[#D81B5D]`). Keep icons at 16px and align text with Poppins.

### 3.2 Links & Filters
- Plain `Link` components (NavBar) use `hover:text-cranberry` plus underline animation. Keep font-weight medium and uppercase/lowercase as specified.
- Filter chips on the jobs page: `px-4 py-2 rounded-full border` with boolean toggles. Active state is cranberry fill; inactive uses gray border with hover change.
- `Badge` component (`src/components/ui/badge.jsx`): rounded-full, border by default. Use `variant="secondary"` for pill backgrounds (e.g., job field tags) and `outline` for neutral metadata.

### 3.3 Cards
- Generic `Card` (`src/components/ui/card.jsx`): `rounded-xl border py-6 shadow-sm` with horizontal padding at the header/content level. Use `CardHeader`, `CardContent`, `CardFooter` to maintain spacing.
- **Job Card** (`src/app/jobs/components/JobCard.jsx`):
  - Outer container: `rounded-[16px] p-6 pb-16 border` with hover state (border + shadow + pointer cursor).
  - Header: 56px logo block with gradient background; fallback monogram uses brand cranberry text.
  - Title + metadata: Poppins for titles, Inter for supporting info.
  - Tags: `Badge` variations for field/mode/experience.
  - Apply button: absolutely positioned between `left-6 right-6 bottom-6`, rounded 12px, toggles `Check` vs `ExternalLink` icon.
  - Keep clickable area accessible by wrapping entire card with navigation handler and preventing propagation inside CTAs.

### 3.4 Forms & Inputs
- `Input` (`src/components/ui/input.jsx`) baseline:
  - `h-9` (increase to `h-12+` when necessary), `rounded-md`, border `var(--input)`, `selection:bg-primary`.
  - Focus state: `focus-visible:ring-[3px]` tinted by `--ring`.
  - `aria-invalid` automatically paints ring/destructive border.
- Search bars (jobs page) extend native inputs with `rounded-[12px]`, icons, and absolute `Button` for search.
- Textareas follow the same border/focus styling; keep padding 16–20px.
- Validation errors displayed with `text-red-600` Inter, 14px.

### 3.5 Layout Helpers
- **Sections**: wrap in `<section className="px-4 md:px-8 py-10">` and include `aria-label` when relevant.
- **Containers**: `max-w-4xl` for forms, `max-w-7xl` for content heavy views. Maintain `space-y-6` to match existing rhythm.
- **Sticky/Floating elements**: NavBar is `fixed`. Admin side nav is `fixed` on desktop and `translateX` on mobile. Always add padding/margin as done in `DashboardLayout` to prevent overlap.

### 3.6 Feedback & Status
- Notifications: use `sonner` `Toaster` already configured (`richColors`). Trigger via `toast.success|error` for user flows.
- Loading skeletons: see jobs page fallback grid (rounded cards with `animate-pulse`). Reuse this pattern by stacking neutral blocks within card outlines.
- Empty states: treat as centered column with icon circle, heading, body copy, and CTA (jobs page example).

## 4. Interaction & Motion

### 4.1 Scroll & Entrance Animations
- GSAP (`gsap`, `ScrollTrigger`) is registered inside views that need animation (jobs page, sidebar). Use `useEffect` to initialize and clean up contexts.
- Hero sections: timeline reveals `.hero-title`, `.hero-subtitle`, and search bar sequentially.
- Job cards: `gsap.fromTo(jobCardRefs.current, { opacity:0, y:30 }, { opacity:1, y:0, stagger:0.08 })` on data load.
- Sidebar: entrance animation translates nav items from left with stagger; mobile drawer slides in from `-100%` X translation.

### 4.2 Micro-interactions
- Buttons scale to 0.98 on admin nav click (`gsap.to(..., { scale:0.98, yoyo:true })`). Keep micro interactions under 120ms.
- Hover states rely on Tailwind transitions: `hover:bg-gray-50`, `group-hover:text-[#D81B5D]`, `hover:shadow-md`.
- CSS `@keyframes shake` is available via `.shake` class for inline error emphasis.

### 4.3 Duration & Easing
- Standard `transition-all duration-300 ease-in-out` for nav + CTAs.
- GSAP uses `power2.out`, `power3.out`, etc., for polished easing.
- Keep toast durations default (sonner handles) to match product expectations.

## 5. Accessibility & Responsiveness

### 5.1 Keyboard & Focus
- Components rely on `focus-visible` styling defined in button/input primitives. Maintain `outline-offset:2px` and ring thickness of 3px.
- Pills/toggles that are `button` elements set `aria-pressed` for stateful controls.
- Provide `aria-label` for icon-only buttons (hamburger menu, search, advanced filters toggle).

### 5.2 Semantics
- Use `<nav aria-label="Main navigation">` for the primary nav (wrap `NavBar` links if extending).
- Job cards should be `<article>` wrappers when rendered in lists for screen reader clarity (currently `div`; wrap when creating new list views).
- Filters grouped with `<fieldset>` + `<legend>` as shown in jobs page advanced filters.

### 5.3 Responsive Behavior
- Tailwind breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`.
- Public nav has no dedicated mobile variant yet; ensure future work either collapses to hamburger or ensures items fit within `w-11/12`.
- Admin sidebar: `lg:hidden` for top bar, `lg:flex` for desktop column. Keep content scrollable via `overflow-y-auto`.
- Cards stack single column on mobile (`grid-cols-1`) and expand to multi-column for md/lg.
- Touch targets: maintain `min-h-[44px]` on pills, mobile nav buttons, and CTA chips.

## 6. Implementation Checklist

1. **Start from a layout**:
   - Public route → wrap sections in `<div className="max-w-7xl mx-auto px-4 md:px-8">` and include hero/search patterns as needed.
   - Admin route → place content inside `DashboardLayout` so the existing sidebar applies.
2. **Pick the right primitives**:
   - Buttons, badges, inputs, cards from `src/components/ui/**` ensure consistent focus, spacing, and tokens.
3. **Match colors**:
   - Use CSS variables or existing Tailwind color utilities (`bg-[#FFF8FA]`, `text-[#D81B5D]`) instead of ad‑hoc hex codes.
4. **Spacing & radius**:
   - Reuse `rounded-[12px]`, `rounded-[32px]`, `gap-6`, `py-6`. Keep outer sections multiples of 8px.
5. **State handling**:
   - Add `hover:`, `focus-visible:`, and `disabled:` states mirroring button/input defaults.
   - For interactive rows (cards, nav items) include `cursor-pointer` and `transition-all`.
6. **Animation**:
   - Register GSAP only inside client components. Clean up contexts to prevent memory leaks.
   - Prefer subtle translation/opacity combos; avoid jarring scaling.
7. **Test**:
   - Verify on mobile width, ensure nav/top spacing holds, confirm focus order, and run through screen-reader labels for new controls.

## 7. Reference Files
- Global styles: `src/app/globals.css`
- Root layout: `src/app/layout.js`
- Public nav: `src/components/NavBar.jsx`
- Button primitive: `src/components/ui/button.jsx`
- Badge primitive: `src/components/ui/badge.jsx`
- Card primitive: `src/components/ui/card.jsx`
- Input primitive: `src/components/ui/input.jsx`
- Job listing UI: `src/app/jobs/page.jsx`, `src/app/jobs/components/JobCard.jsx`
- Admin shell: `src/app/admin/dashboard/layout.js`, `src/app/admin/dashboard/components/SideNav.jsx`
- Admin auth page: `src/app/admin/login/page.jsx`
- Notifications: `src/components/ui/sonner.jsx` & usage via `toast` throughout services.

Use this guide whenever you add or refactor UI so the experience stays cohesive across public, portal, and admin contexts.