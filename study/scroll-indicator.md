# Scroll Indicator Pattern

A sticky pill that appears at the bottom of a scrollable container to tell the user there's more content. Changes text when they reach the end.

## How It Works

Three pieces working together:

### 1. State — what mode is the indicator in?

```ts
const [scrollState, setScrollState] = useState<"hidden" | "more" | "end">("hidden");
```

- `"hidden"` — content fits without scrolling, indicator is invisible
- `"more"` — there's overflow and the user hasn't reached the bottom yet
- `"end"` — scrolled all the way down

### 2. Detection — figure out which state we're in

```ts
const scrollRef = useRef<HTMLDivElement>(null);

const updateScrollState = useCallback(() => {
  const el = scrollRef.current;
  if (!el) return;

  const { scrollTop, scrollHeight, clientHeight } = el;

  // Nothing to scroll? Hide the indicator.
  if (scrollHeight <= clientHeight + 2) {
    setScrollState("hidden");
    return;
  }

  // Within 16px of the bottom = "at the end"
  const atBottom = scrollHeight - scrollTop - clientHeight < 16;
  setScrollState(atBottom ? "end" : "more");
}, []);
```

Key measurements (all from the scroll container element):
| Property | Meaning |
|---|---|
| `scrollHeight` | Total height of all content (including overflow) |
| `clientHeight` | Visible height of the container |
| `scrollTop` | How far the user has scrolled down |

The check `scrollHeight - scrollTop - clientHeight < 16` means "the remaining hidden content is less than 16px" — effectively at the bottom. The 16px is a tolerance so it doesn't have to hit exactly pixel 0.

### 3. Keeping it accurate — ResizeObserver + onScroll

```ts
useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  // Run once on mount
  updateScrollState();

  // ResizeObserver fires when content changes height
  // (e.g., card expand/collapse adds or removes overflow)
  const ro = new ResizeObserver(updateScrollState);
  ro.observe(el);

  return () => ro.disconnect();
}, [updateScrollState]);
```

And on the scroll container:
```tsx
<div ref={scrollRef} onScroll={updateScrollState} ...>
```

Two triggers cover all cases:
- `onScroll` — fires every time the user scrolls
- `ResizeObserver` — fires when content height changes (cards expand/collapse, window resizes)

Without `ResizeObserver`, the indicator would stay stuck on "more" even after all cards collapse and nothing overflows anymore.

### 4. Rendering — the sticky pill

```tsx
{scrollState !== "hidden" && (
  <div
    style={{
      position: "sticky",
      bottom: 0,
      display: "flex",
      justifyContent: "center",
      padding: "32px 0 16px",  // top padding creates room for the gradient
      background: "linear-gradient(transparent, var(--color-card) 60%)",
      pointerEvents: "none",  // doesn't block clicks on cards behind it
    }}
  >
    <span style={{ fontSize: "18px" }}>
      {scrollState === "more" ? "Scroll for more ↓" : "— You're all caught up —"}
    </span>
  </div>
)}
```

Why `position: sticky; bottom: 0`?

- It's placed **inside** the scrollable content (as the last child)
- `sticky` makes it stick to the bottom edge of the **scroll container's visible area**
- As the user scrolls, it stays pinned at the bottom
- When they reach the end, it sits naturally at the end of content — which is also the bottom

The gradient (`transparent → card-bg-color`) makes the pill blend smoothly into the background instead of having a hard edge.

## Full File Reference

See `components/sections/experience.tsx` for the working implementation:
- Scroll ref + state: lines ~82-84
- `updateScrollState` callback: lines ~86-96
- ResizeObserver effect: lines ~98-105
- `ref` + `onScroll` on the container: lines ~118-120
- Sticky indicator render: lines ~153-173

## When to Reuse

This pattern works anywhere you have:
- A container with `overflow-y: auto` (or `scroll`)
- Content that can dynamically change height
- A need to signal "there's more below"

Skip it when:
- The scrollbar is visible (the scrollbar already signals "more")
- Content height is static (you know it always fits or always overflows)
- The container is the main page scroll (users expect pages to scroll)
