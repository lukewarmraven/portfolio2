import { useState, useEffect, useRef, useCallback } from "react";
import { vw } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/reusable-ui/Card";
import { EXPERIENCE_CARDS, UI_STRINGS } from "@/lib/content";

export default function Experience() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showExperience, setShowExperience] = useState(true);
  const [showEducation, setShowEducation] = useState(true);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredCards = EXPERIENCE_CARDS.filter(
    (c) => (c.category === "experience" && showExperience) || (c.category === "education" && showEducation),
  );

  // Scroll the opened card into view after expand animation starts
  useEffect(() => {
    if (openIndex !== null) {
      const el = cardRefs.current[openIndex];
      if (el) {
        // Brief delay so layout has updated before computing scroll target
        const timeout = setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 100);
        return () => clearTimeout(timeout);
      }
    }
  }, [openIndex]);

  // ── Scroll indicator ──────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<"hidden" | "more" | "end">("hidden");

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 2) {
      setScrollState("hidden");
      return;
    }
    setScrollState(scrollHeight - scrollTop - clientHeight < 16 ? "end" : "more");
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollState]);

  return (
    <section
      className="flex flex-col"
      style={{ height: "100%", gap: vw(16) }}
    >
      <h1
        className="font-league-gothic m-0"
        style={{ fontSize: vw(64) }}
      >
        <span
          onClick={() => {
            if (showExperience && !showEducation) {
              setShowExperience(false);
              setShowEducation(true);
            } else {
              setShowExperience(!showExperience);
            }
          }}
          style={{ cursor: "pointer", color: showExperience ? "inherit" : "var(--color-muted-foreground)" }}
        >
          EXPERIENCE
        </span>
        {/* <span style={{ color: "var(--color-muted-foreground)" }}>/ </span> */}
        <span
          onClick={() => {
            if (showEducation && !showExperience) {
              setShowEducation(false);
              setShowExperience(true);
            } else {
              setShowEducation(!showEducation);
            }
          }}
          style={{ cursor: "pointer", color: showEducation ? "inherit" : "var(--color-muted-foreground)" }}
        >
          / EDUCATION
        </span>
      </h1>

      <div
        ref={scrollRef}
        data-scroll-container
        onScroll={updateScrollState}
        className="no-scrollbar"
        style={{ overflowY: "auto", flex: "1 1 0", minHeight: 0 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: vw(16) }}>
          {filteredCards.map((item, i) => (
            <Card
              key={item.title}
              ref={(el) => { cardRefs.current[i] = el; }}
              grid
              open={openIndex === i}
              onOpenChange={(open) => setOpenIndex(open ? i : null)}
            >
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p
                  className="font-rajdhani m-0"
                  style={{ fontSize: vw(22) }}
                >
                  {item.content}
                </p>
              </CardContent>
              <CardFooter>
                <span
                  className="font-rajdhani text-muted-foreground"
                  style={{ fontSize: vw(18) }}
                >
                  {item.footer}
                </span>
              </CardFooter>
            </Card>
          ))}
          {scrollState !== "hidden" && (
            <div
              style={{
                position: "sticky",
                bottom: 0,
                display: "flex",
                justifyContent: "center",
                padding: vw(32),
                paddingBottom: vw(32),
                background: "linear-gradient(transparent, var(--color-card, #fff) 60%)",
                pointerEvents: "none",
              }}
            >
              <span
                className="font-rajdhani text-muted-foreground"
                style={{ fontSize: vw(32), position: "relative", top: 20 }}
              >
                {scrollState === "more" ? UI_STRINGS.scrollMore : UI_STRINGS.scrollEnd}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
