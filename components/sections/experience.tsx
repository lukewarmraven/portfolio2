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

const PLACEHOLDER_CARDS = [
  {
    category: "experience",
    title: "Senior Frontend Engineer",
    description: "Acme Corp. — 2023 to Present",
    content:
      "Led the migration from a legacy jQuery codebase to React 19 and Next.js 16. Built a shared component library used by 4 product teams. Reduced bundle size by 42% through tree-shaking and dynamic imports.",
    footer: "React · Next.js · TypeScript · Tailwind",
  },
  {
    category: "experience",
    title: "Full Stack Developer",
    description: "StartupXYZ — 2021 to 2023",
    content:
      "Designed and implemented a real-time collaboration API with WebSockets. Managed PostgreSQL migrations for a multi-tenant SaaS platform serving 12k daily active users. Mentored 3 junior developers.",
    footer: "Node.js · PostgreSQL · WebSocket · AWS",
  },
  {
    category: "experience",
    title: "UI/UX Developer",
    description: "DesignLab Inc. — 2019 to 2021",
    content:
      "Bridged design and engineering — translated Figma prototypes into pixel-perfect, accessible interfaces. Introduced Storybook and visual regression testing to the team's workflow, catching ~30 visual bugs per release.",
    footer: "Figma · Storybook · Accessibility · CSS",
  },
  {
    category: "education",
    title: "IT Intern",
    description: "Polytechnic University of the Philippines — 2018",
    content:
      "Built an internal attendance tracking system using PHP and MySQL. Automated monthly report generation, saving the admin office roughly 15 hours per month. Received a commendation for code quality.",
    footer: "PHP · MySQL · JavaScript · Bootstrap",
  },
  {
    category: "experience",
    title: "Freelance Web Developer",
    description: "Self-employed — 2017 to 2019",
    content:
      "Delivered 12+ client projects ranging from landing pages to e-commerce sites. Specialized in WordPress theme development and custom PHP plugins. Maintained long-term retainer relationships with 4 recurring clients.",
    footer: "WordPress · PHP · jQuery · SCSS",
  },
  {
    category: "education",
    title: "Open Source Contributor",
    description: "Various Projects — 2016 to Present",
    content:
      "Active contributor to several React and Node.js open-source projects. Maintained a popular form validation library with 2k+ GitHub stars. Reviewed and merged 150+ pull requests across 3 repositories.",
    footer: "React · Node.js · GitHub · CI/CD",
  },
  {
    category: "education",
    title: "Campus Tech Lead",
    description: "PUP Student Organization — 2015 to 2017",
    content:
      "Organized weekly coding workshops for 30+ students covering HTML, CSS, and JavaScript fundamentals. Built the organization's event management portal. Led a team of 5 in a national hackathon (top 10 finish).",
    footer: "Leadership · Teaching · HTML/CSS · JavaScript",
  },
];

export default function Experience() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showExperience, setShowExperience] = useState(true);
  const [showEducation, setShowEducation] = useState(true);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredCards = PLACEHOLDER_CARDS.filter(
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
          onClick={() => setShowExperience((v) => (v && !showEducation ? true : !v))}
          style={{ cursor: "pointer", color: showExperience ? "inherit" : "var(--color-muted-foreground)" }}
        >
          EXPERIENCE
        </span>
        {/* <span style={{ color: "var(--color-muted-foreground)" }}>/ </span> */}
        <span
          onClick={() => setShowEducation((v) => (v && !showExperience ? true : !v))}
          style={{ cursor: "pointer", color: showEducation ? "inherit" : "var(--color-muted-foreground)" }}
        >
          / EDUCATION
        </span>
      </h1>

      <div
        ref={scrollRef}
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
                {scrollState === "more" ? "-- Scroll for more --" : "— End —"}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
