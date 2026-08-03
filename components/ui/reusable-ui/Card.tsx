"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { cn, vw } from "@/lib/utils";

// ── Context ──────────────────────────────────────────────────

const CardOpenContext = createContext(true);
const useCardOpen = () => useContext(CardOpenContext);

// ── Root ────────────────────────────────────────────────────

interface CardProps extends ComponentProps<"div"> {
  /** Initial expanded state (uncontrolled). Default: false (collapsed). */
  defaultOpen?: boolean;
  /** Controlled expanded state — wins over internal state when provided. */
  open?: boolean;
  /** Fires on every toggle with the new open state. */
  onOpenChange?: (open: boolean) => void;
  /** Set to false to disable expand/collapse entirely (static card). */
  collapsible?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      style,
      defaultOpen = false,
      open: controlledOpen,
      onOpenChange,
      collapsible = true,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isOpen = controlledOpen ?? internalOpen;

    const toggle = useCallback(() => {
      if (!collapsible) return;
      const next = !isOpen;
      setInternalOpen(next);
      onOpenChange?.(next);
    }, [collapsible, isOpen, onOpenChange]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (!collapsible) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      },
      [collapsible, toggle],
    );

    // Internal ref for cursor-spotlight DOM writes
    const glowRef = useRef<HTMLDivElement>(null);

    // Merge forwarded ref + internal ref so both consumer and glow work
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        glowRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref],
    );

    // Cursor spotlight — writes CSS vars directly to the DOM (zero re-renders)
    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
      const el = glowRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    }, []);

    return (
      <CardOpenContext.Provider value={isOpen}>
        <div
          ref={mergedRef}
          role={collapsible ? "button" : undefined}
          tabIndex={collapsible ? 0 : undefined}
          aria-expanded={collapsible ? isOpen : undefined}
          onClick={toggle}
          onKeyDown={handleKeyDown}
          onMouseMove={handleMouseMove}
          className={cn(
            "group/card relative overflow-hidden border border-border bg-card text-card-foreground",
            "font-rajdhani shadow-card",
            collapsible && "cursor-pointer",
            className,
          )}
          style={{
            ...style,
            borderRadius: vw(20),
            ["--spot-x" as string]: "50%",
            ["--spot-y" as string]: "50%",
          }}
          {...props}
        >
          {/* Spotlight glow overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
            style={{
              background:
                "radial-gradient(circle 220px at var(--spot-x) var(--spot-y), rgba(0,0,0,0.07), transparent 70%)",
            }}
          />
          {children}
        </div>
      </CardOpenContext.Provider>
    );
  },
);
Card.displayName = "Card";

// ── Header ──────────────────────────────────────────────────

const CardHeader = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, style, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn("flex flex-col gap-1", className)}
      style={{ padding: vw(28), paddingBottom: vw(12), ...style }}
      {...props}
    >
      {children}
    </div>
  ),
);
CardHeader.displayName = "CardHeader";

// ── Title ───────────────────────────────────────────────────

const CardTitle = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, style, children, ...props }, ref) => (
    <h3
      ref={ref}
      data-slot="card-title"
      className={cn("font-league-gothic m-0 leading-none", className)}
      style={{ fontSize: vw(40), ...style }}
      {...props}
    >
      {children}
    </h3>
  ),
);
CardTitle.displayName = "CardTitle";

// ── Description ─────────────────────────────────────────────

const CardDescription = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, style, children, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="card-description"
      className={cn("font-rajdhani m-0 text-muted-foreground", className)}
      style={{ fontSize: vw(24), ...style }}
      {...props}
    >
      {children}
    </p>
  ),
);
CardDescription.displayName = "CardDescription";

// ── Content (collapsible body) ──────────────────────────────

const CardContent = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, style, children, ...props }, ref) => {
    const open = useCardOpen();

    return (
      <div
        ref={ref}
        data-slot="card-content"
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          className,
        )}
        {...props}
      >
        <div className="min-h-0 overflow-hidden">
          <div style={{ padding: vw(28), paddingTop: vw(4), ...style }}>
            {children}
          </div>
        </div>
      </div>
    );
  },
);
CardContent.displayName = "CardContent";

// ── Footer (collapsible, same animation as content) ────────

const CardFooter = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, style, children, ...props }, ref) => {
    const open = useCardOpen();

    return (
      <div
        ref={ref}
        data-slot="card-footer"
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          className,
        )}
        {...props}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className="flex items-center gap-2"
            style={{ padding: vw(28), paddingTop: vw(12), ...style }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);
CardFooter.displayName = "CardFooter";

// ── Exports ─────────────────────────────────────────────────

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
