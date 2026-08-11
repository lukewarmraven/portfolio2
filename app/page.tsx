"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { vw, vh } from "@/lib/utils";
import LeftMain from "@/components/ui/page-ui/left-main";
import RightMain from "@/components/ui/page-ui/right-main";
import NavSections, { type SectionId } from "@/components/ui/page-ui/navigation";
import { PERSONAL, SECTION_TITLES, SECTIONS_ORDER, NAV_SECTIONS } from "@/lib/content";
import HomePage from "@/components/sections/home";
import Experience from "@/components/sections/experience";
import Projects from "@/components/sections/projects";
import Seminars from "@/components/sections/seminars";
import Contact from "@/components/sections/contact";
import Socials from "@/components/ui/page-ui/socials";
import DottedBg from "@/components/ui/page-ui/dotted-bg";
import Expanded from "@/components/sections/expanded";
import { ExpandedProvider, useExpanded } from "@/contexts/expanded-context";

const SECTION_COMPONENTS: Record<SectionId, () => React.JSX.Element> = {
  home: HomePage,
  experience: Experience,
  projects: Projects,
  seminars: Seminars,
  contact: Contact,
};


export default function Home() {
  return (
    <ExpandedProvider>
      <HomeContent />
    </ExpandedProvider>
  );
}

function HomeContent() {
  const [active, setActive] = useState<SectionId>("home");
  const scrollingRef = useRef(false);
  const { expandedData, close } = useExpanded();
  const activeRef = useRef(active);
  activeRef.current = active;
  const expandedRef = useRef(expandedData);
  expandedRef.current = expandedData;
  const navInProgressRef = useRef(false);

  const scrollToSection = useCallback((id: SectionId) => {
    close(); // dismiss expanded view if open
    scrollingRef.current = true;
    setActive(id);
    // Wait for React to commit the close + section visibility before scrolling
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    setTimeout(() => {
      scrollingRef.current = false;
    }, 900);
  }, [close]);

  useEffect(() => {
    document.title = `${SECTION_TITLES[active]} | Portfolio`;
  }, [active]);

  // ── Global wheel: cursor anywhere on the page drives RightMain ──
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // Let Projects/Seminars handlers consume first (they stopPropagation)
      if (e.defaultPrevented) return;
      // Expanded overlay open → let native scroll handle its inner areas
      if (expandedRef.current) return;
      // Horizontal-dominant gestures → ignore
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const target = e.target as Node;
      if (!(target instanceof Node)) return;

      // Which section is the cursor physically over?
      let sectionEl: HTMLElement | null = null;
      for (const id of SECTIONS_ORDER) {
        const el = document.getElementById(id);
        if (el && el.contains(target)) { sectionEl = el; break; }
      }

      if (sectionEl) {
        // Branch 1: section has an inner scroll container that can still scroll
        const scrollEl =
          sectionEl.querySelector<HTMLElement>("[data-scroll-container]");
        if (scrollEl) {
          const { scrollTop, scrollHeight, clientHeight } = scrollEl;
          const atTop = scrollTop <= 0;
          const atBottom = scrollHeight - scrollTop - clientHeight <= 1;
          const down = e.deltaY > 0;
          const up = e.deltaY < 0;
          if ((down && !atBottom) || (up && !atTop)) {
            e.preventDefault();
            scrollEl.scrollTop += e.deltaY;
            return;
          }
        }
        // Branch 2: cursor inside a section but no inner scroll to consume
        // → let native wheel scroll [data-right-main] with snap
        return;
      }

      // Branch 3: cursor outside all sections (LeftMain / background)
      // → drive the active section's inner content first, then advance
      const activeEl = document.getElementById(activeRef.current);
      if (activeEl) {
        // 3a) Inner scroll container (Experience cards)
        const innerScroll =
          activeEl.querySelector<HTMLElement>("[data-scroll-container]");
        if (innerScroll) {
          const { scrollTop, scrollHeight, clientHeight } = innerScroll;
          const atTop = scrollTop <= 0;
          const atBottom = scrollHeight - scrollTop - clientHeight <= 1;
          const down = e.deltaY > 0;
          const up = e.deltaY < 0;
          if ((down && !atBottom) || (up && !atTop)) {
            e.preventDefault();
            innerScroll.scrollTop += e.deltaY;
            return;
          }
        }

        // 3b) Delegate to section wheel handlers (Projects/Seminars pagination)
        const synthetic = new WheelEvent("wheel", {
          deltaY: e.deltaY,
          deltaX: e.deltaX,
          deltaMode: e.deltaMode,
          bubbles: true,
          cancelable: true,
        });
        activeEl.dispatchEvent(synthetic);
        if (synthetic.defaultPrevented) {
          e.preventDefault();
          return;
        }
      }

      // 3c) At inner-content boundary → advance to next/prev section
      if (scrollingRef.current || navInProgressRef.current) return;
      const idx = SECTIONS_ORDER.indexOf(activeRef.current);
      const nextIdx = idx + (e.deltaY > 0 ? 1 : -1);
      if (nextIdx < 0 || nextIdx >= SECTIONS_ORDER.length) return;
      e.preventDefault();
      navInProgressRef.current = true;
      document
        .getElementById(SECTIONS_ORDER[nextIdx])
        ?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        navInProgressRef.current = false;
      }, 800);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id as SectionId);
          }
        }
      },
      { threshold: 0.5 }
    );

    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <DottedBg />
      <div
        className="flex justify-center items-stretch h-screen overflow-hidden"
        style={{ gap: vw(20) }}
      >
      <LeftMain>
        <section className="flex flex-col" style={{gap: vw(46)}}>
          <div>
            <h1 className="font-league-gothic m-0 p-0 leading-[0.7]" style={{ fontSize: vw(110) }}>{PERSONAL.name.toUpperCase()}</h1>
            <h3 className="font-league-gothic m-0" style={{ fontSize: vw(40) }}>{PERSONAL.title} | {PERSONAL.course}</h3>
          </div>
          <p className="font-rajdhani" style={{ fontSize: vw(32) }}>{PERSONAL.description}</p>

          <NavSections active={active} onSelect={scrollToSection} />
          <Socials/>
        </section>
      </LeftMain>
      <RightMain>
        <RightContent />
      </RightMain>
    </div>
    </>
  );
}

function RightContent() {
  const { expandedData, close } = useExpanded();
  const scrollPosRef = useRef(0);
  const expandedRef = useRef(expandedData);
  expandedRef.current = expandedData;

  const handleBack = useCallback(() => {
    close();
  }, [close]);

  // Continuously track RightMain scroll position (ignore collapse events when expanded)
  useEffect(() => {
    const el = document.querySelector<HTMLElement>("[data-right-main]");
    if (!el) return;
    const onScroll = () => {
      if (!expandedRef.current) scrollPosRef.current = el.scrollTop;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Restore scroll position when expanded closes
  useEffect(() => {
    if (!expandedData && scrollPosRef.current > 0) {
      const el = document.querySelector<HTMLElement>("[data-right-main]");
      if (el) {
        requestAnimationFrame(() => {
          el.scrollTop = scrollPosRef.current;
        });
      }
    }
  }, [expandedData]);

  return (
    <>
      {/* Sections — always mounted so DOM IDs exist for scrollIntoView */}
      <div style={{ display: expandedData ? "none" : "contents" }}>
        {NAV_SECTIONS.map(({ id }) => {
          const Section = SECTION_COMPONENTS[id];
          return (
            <div key={id} id={id} style={{ height: "100%", scrollSnapAlign: "start", paddingTop: vh(300), paddingBottom: vh(300), boxSizing: "border-box" }}>
              <Section />
            </div>
          );
        })}
      </div>

      {/* Expanded overlay */}
      {expandedData && (
        <div style={{ height: "100%", paddingTop: vh(300), paddingBottom: vh(300), boxSizing: "border-box" }}>
          <Expanded
            title={expandedData.title}
            body={expandedData.body}
            images={expandedData.images}
            link={expandedData.link}
            onBack={handleBack}
          />
        </div>
      )}
    </>
  );
}
