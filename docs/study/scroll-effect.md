# Scroll-to-Section with Snap — How It Works

## The problem

A one-pager portfolio with two columns:
- **LeftMain**: fixed branding + navigation (never scrolls)
- **RightMain**: 5 sections stacked vertically — Home, Experience, Projects, Seminars, Contact

Goal: clicking a nav link smoothly scrolls to that section, manual scrolling snaps between sections, and the active nav link highlights as you scroll.

## The stack

| Concern | Technology | Where |
|---|---|---|
| Scroll container | `overflow-y: auto` | [right-main.tsx](../../components/ui/page-ui/right-main.tsx) |
| Snap behavior | `scroll-snap-type: y mandatory` | right-main.tsx |
| Snap points | `scroll-snap-align: start` | Each section wrapper in [page.tsx](../../app/page.tsx) |
| Programmatic scroll | `scrollIntoView({ behavior: "smooth" })` | page.tsx |
| Active tracking | `IntersectionObserver` at 50% threshold | page.tsx |
| Scrollbar hidden | `.no-scrollbar` utility | [globals.css](../../app/globals.css) |

## Height — the critical piece

Each section is given `height: 100%` of the RightMain container. This is what makes the scroll feel substantial:

```
page.tsx flex container (h-screen, overflow-hidden)
├── LeftMain (natural height — doesn't scroll)
└── RightMain (height: 100%, overflow-y: auto)
    ├── <div id="home"       height: 100% >  ← one full viewport
    ├── <div id="experience" height: 100% >  ← one full viewport
    ├── <div id="projects"   height: 100% >  ← one full viewport
    ├── <div id="seminars"   height: 100% >  ← one full viewport
    └── <div id="contact"    height: 100% >  ← one full viewport
```

Why `height: 100%` works:
1. The flex parent is `h-screen` with `overflow-hidden` — the parent fills the viewport and traps overflow
2. RightMain has `height: 100%` — it fills the available vertical space (viewport minus `paddingTop`)
3. Each child div has `height: 100%` — 100% of RightMain's height
4. So each section is exactly one viewport-height "page"
5. Five sections at 100% each = the scrollable area is 5× the visible area

Without the full-height sections, the scroll would be a cramped inch of movement — feels cheap. Full-height gives each section its own "screen" and the snap creates a slide-deck feel.

## Scroll snap — how it locks

CSS Scroll Snap is a native browser feature, no JavaScript library:

```css
/* On the scroll container */
scroll-snap-type: y mandatory;

/* On each child */
scroll-snap-align: start;
```

- `y mandatory` — the browser MUST snap to a snap point on the y-axis after every scroll gesture
- `start` — snap each child's top edge to the container's top edge

When the user flicks the scroll wheel or trackpad, the browser calculates the nearest snap point and animates to it. It's hardware-accelerated and smoother than any JS `scrollTo` can achieve on its own.

`mandatory` vs `proximity`:
- `mandatory`: always snaps, even for tiny scrolls. Feels strict/precise — good for this one-pager.
- `proximity`: only snaps if the scroll lands near a snap point. Would feel sloppy here.

## Nav click → scroll

```tsx
const scrollToSection = (id: SectionId) => {
  scrollingRef.current = true;       // ① lock the observer
  setActive(id);                      // ② update highlight immediately
  document.getElementById(id)
    ?.scrollIntoView({ behavior: "smooth" });  // ③ trigger scroll
  setTimeout(() => {
    scrollingRef.current = false;    // ④ unlock after scroll completes
  }, 800);
};
```

① **The lock** — we set a ref to `true` before scrolling. Without this, the IntersectionObserver would fire as the first section scrolls out of view and briefly flash the wrong nav item. The lock tells the observer "this scroll is intentional, don't update state."

② **Instant highlight** — the user clicked, so we update the active state immediately. No waiting for the scroll to finish.

③ **`scrollIntoView`** — the browser's native smooth scroll. The target is the `<div id="home">` wrapper around each section.

④ **Unlock** — after 800ms (enough time for the smooth scroll to complete), we disable the lock so the observer resumes normal tracking.

## IntersectionObserver — active tracking

```tsx
const observer = new IntersectionObserver(
  (entries) => {
    if (scrollingRef.current) return;  // skip if we're in a programmatic scroll
    for (const entry of entries) {
      if (entry.isIntersecting) {
        setActive(entry.target.id);    // this section is now in view
      }
    }
  },
  { threshold: 0.5 }  // fire when 50% of the section is visible
);
```

- **threshold 0.5**: the callback fires when 50% of a section enters or leaves the viewport. This means the nav updates roughly when you're halfway through scrolling into the next section, which feels natural.
- **The lock**: `scrollingRef.current` prevents the observer from competing with `scrollIntoView` during nav clicks. Without it, scrolling from section 1 → section 5 would briefly flash sections 2, 3, and 4 as they pass through the viewport.
- Each section `<div>` is registered with `observer.observe(el)`.
- On unmount: `observer.disconnect()` — standard React cleanup.

## Preventing page scroll

The flex parent has two defenses:
1. `h-screen` — matches the viewport exactly, no overflow
2. `overflow-hidden` — any overflow from LeftMain's content is clipped

This ensures the browser never shows a page-level scrollbar. The ONLY scrollable area is RightMain.

## What makes it feel good

1. **Full-height sections** — scrolling feels like turning pages, not shuffling divs
2. **CSS snap** — browser-native, GPU-accelerated, always lands perfectly
3. **Immediate nav feedback** — highlight changes on click, not after scroll
4. **IntersectionObserver at 50%** — nav updates at the right moment during manual scroll
5. **No scrollbar** — `.no-scrollbar` removes the visual clutter without breaking functionality
