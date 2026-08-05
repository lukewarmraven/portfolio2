# PopupCarousel — Design & Integration

## Overview

`PopupCarousel` is a reusable image carousel built for the portfolio's **Projects** section. It displays a stack of images: one centered "current" item and a spread of preceding/following items below. Hovering the current image for 3 seconds opens a preview that "pops forward" from the exact screen position of the image — same size, but portaled to `document.body` with a deeper shadow to simulate depth.

## Files involved

| File | Role |
|---|---|
| `components/ui/reusable-ui/PopupCarousel.tsx` | Reusable carousel component (wheel nav, hover preview, layout) |
| `components/sections/projects.tsx` | Section-specific: owns `PROJECTS` data array, title/description rendering, lifts `currentIndex` state |
| `app/page.tsx` | Registers `<Projects />` as a snap-scroll section inside `RightMain` |
| `components/ui/page-ui/right-main.tsx` | Scroll container (`overflow-y: auto`, width `vw(635)`, snap host) |
| `lib/utils.ts` | `vw()` / `vh()` viewport-scaling helpers used for all dimensions |

## What lives where

### In the reusable `PopupCarousel` (generic, no project knowledge)

- **Item layout**: current at `top: 10%`, others fanned at `top: 78%` with `SPREAD_X = 36` horizontal offset
- **Z-index stacking**: current on top (`total + 1`), preceding stacked above following
- **Opacity falloff**: current = 1, others = `max(0.25, 1 - |offset| × 0.4)`
- **Wheel navigation**: native `wheel` listener with 500 ms debounce, blocked when no valid next item
- **Click-to-switch**: clicking a non-current item calls `goTo(index)`
- **Hover preview**: 3-second hold on current → portals a clone of the image to `document.body`
- **Scroll indicator**: gradient-overlay "Scroll for more" / "End" text at bottom
- **Keyboard a11y**: `role="button"`, `tabIndex`, `aria-label` per item

### In `projects.tsx` (section-specific, owned by the parent)

- **`PROJECTS` array** — the data: `title`, `description`, `image` per project (Resbac dashboards, mobile views, etc.)
- **`currentIndex` state** — lifted from the carousel so the parent can render the current project's title/description above
- **Title + description** rendered outside the carousel from `PROJECTS[currentIndex]`

```tsx
// projects.tsx — the section owns data + currentIndex, carousel is just the view
const PROJECTS: PopupCarouselItem[] = [ /* 6 items */ ];

export default function Projects() {
  const [currentIndex, setCurrentIndex] = useState(0);
  return (
    <section>
      <h1>PROJECTS</h1>
      <h3>{PROJECTS[currentIndex].title}</h3>
      <p>{PROJECTS[currentIndex].description}</p>
      <PopupCarousel
        items={PROJECTS}
        currentIndex={currentIndex}
        onCurrentChange={setCurrentIndex}
      />
    </section>
  );
}
```

## Props interface

```ts
interface PopupCarouselItem {
  image: string;       // path to image asset
  title: string;       // used for alt text + aria-label
  description: string; // not rendered by carousel — parent uses this
}

interface PopupCarouselProps {
  items: PopupCarouselItem[];
  currentIndex: number;           // controlled by parent
  onCurrentChange: (i: number) => void;
  className?: string;
}
```

The carousel is **fully controlled** — it never owns `currentIndex`. The parent (`projects.tsx`) passes it in and receives updates via `onCurrentChange`. This lets the parent render metadata (title, description) for the current item without the carousel knowing about it.

## Preview / hover effect

### Trigger

Hover on the **current** (centered) image → 3-second timer → `expandedIndex` set → preview opens. Mouse leave cancels the timer (if preview hasn't opened) or closes it (once open).

### Why a portal?

The preview overlay originally rendered inside the carousel's `position: relative` wrapper with `position: absolute; inset: 0`. This trapped it inside:
- `RightMain`'s fixed width (`vw(635)`)
- The page-level `overflow: hidden` on the flex container in `page.tsx`

Moving to a `ReactDOM.createPortal(..., document.body)` escapes all container clipping.

### Positioning — bounding rect snapshot

When the preview opens, we snapshot the current image's screen position via `getBoundingClientRect()`:

```ts
const currentImageRef = useRef<HTMLImageElement | null>(null);
const [imageRect, setImageRect] = useState<DOMRect | null>(null);

useEffect(() => {
  if (expandedIndex !== null && currentImageRef.current) {
    setImageRect(currentImageRef.current.getBoundingClientRect());
  } else {
    setImageRect(null);
  }
}, [expandedIndex]);
```

The portal overlay is then positioned at those exact coordinates with `position: fixed`:

```tsx
{expandedIndex !== null && imageRect !== null &&
  createPortal(
    <div style={{
      position: "fixed",
      left: imageRect.left,
      top: imageRect.top,
      width: imageRect.width,
      height: imageRect.height,
      zIndex: 9999,
    }}>
      <img src={items[expandedIndex].image} /* ... */ />
    </div>,
    document.body
  )
}
```

This creates the illusion that the image itself "popped forward" — it sits at the exact same screen position and size, just with a heavier shadow and above all other content.

### Portrait scaling

Portrait (taller-than-wide) images get a **1.35×** scale to make them more visible in the preview:

```tsx
const isPortrait = imageRect.height > imageRect.width;
const scale = isPortrait ? 1.35 : 1;
// … applied as transform: `scale(${scale})` with transformOrigin: "center center"
```

The scale grows from center, so the image stays centered on its original position.

### Visual details

| Property | Original image | Preview overlay |
|---|---|---|
| Size | `height: vw(450)`, `width: auto` | Exact same (from bounding rect) |
| Border radius | `vw(16)` | `vw(16)` |
| Box shadow | `0 4px 24px + 0 12px 48px` | `0 8px 48px + 0 16px 64px` (deeper) |
| Position | Inside carousel stacking context | `fixed`, portaled to body, `z-index: 9999` |
| Scale | 1 | 1 (landscape) or 1.35 (portrait) |
| Backdrop | None | None |

No backdrop is used — just the image itself with a stronger shadow, making it feel like a card lifted off the pile.

## Wheel navigation

A native non-passive `wheel` listener on the carousel container handles scrolling:

- Only intercepts when `|deltaY| > |deltaX|` (vertical scroll, not trackpad horizontal)
- Validates `next >= 0 && next < total` — if at the boundary, lets the event bubble so RightMain scrolls to the next section
- 500 ms debounce via `canNavigate` ref to prevent rapid-fire
- `preventDefault()` + `stopPropagation()` blocks the scroll from reaching RightMain when navigating within the carousel

This creates a smooth "scroll to cycle" feel: scrolling down advances to the next item, scrolling up goes back, and at the last item scrolling down passes through to the next portfolio section.

## Visual layout

```
┌─ PopupCarousel (flex: 1, position: relative) ──────────────┐
│ ┌─ Pile container (position: absolute, inset: 0) ────────┐ │
│ │                                                        │ │
│ │              ┌──────────────┐  ← current (z: highest)   │ │
│ │              │   Image[0]   │     top: 10%, left: 50%   │ │
│ │              └──────────────┘     scale: 1               │ │
│ │                                                        │ │
│ │     ┌────┐  ┌────┐  ┌────┐  ← previous items           │ │
│ │     │ -3 │  │ -2 │  │ -1 │     top: 78%, scale: 0.84    │ │
│ │     └────┘  └────┘  └────┘     z-index: descending      │ │
│ │                                                        │ │
│ │     ┌────┐  ┌────┐  ┌────┐  ← next items               │ │
│ │     │ +1 │  │ +2 │  │ +3 │     top: 78%, scale: 0.84    │ │
│ │     └────┘  └────┘  └────┘     z-index: negative        │ │
│ │                                                        │ │
│ │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← scroll indicator         │ │
│ │        "Scroll for more"          gradient overlay       │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## Integration chain

```
page.tsx
  └─ RightMain
       └─ <div id="projects" style="height: 100%">
            └─ <Projects />
                 ├─ <h1> PROJECTS </h1>
                 ├─ Title + Description (from PROJECTS[currentIndex])
                 └─ <PopupCarousel
                       items={PROJECTS}
                       currentIndex={currentIndex}
                       onCurrentChange={setCurrentIndex}
                     />
```

## Key design decisions

1. **Controlled component** — `currentIndex` is owned by the parent so it can display metadata. The carousel only renders images.
2. **Portal over state lifting** — the preview needed to escape container clipping. Using `createPortal` to `document.body` touched one file; lifting state to `page.tsx` would have touched three.
3. **Bounding rect over calculated position** — instead of reverse-engineering the carousel's %-based layout to compute the image's screen position, we just ask the DOM via `getBoundingClientRect()`. Simpler and always accurate.
4. **Portrait scaling** — detected from the bounding rect (not from loading image metadata). No extra network requests, no layout shift.
5. **Wheel debounce** — prevents rapid-fire wheel events from jumping multiple items. 500 ms feels responsive but constrained.
6. **No backdrop** — the preview is the image itself with a deeper shadow. This keeps the effect subtle and focused — it's a "card lift," not a lightbox.
