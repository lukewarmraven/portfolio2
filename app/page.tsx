"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { vw, vh } from "@/lib/utils";
import LeftMain from "@/components/ui/page-ui/left-main";
import RightMain from "@/components/ui/page-ui/right-main";
import NavSections, { sections, type SectionId } from "@/components/ui/page-ui/navigation";

const SECTION_TITLES: Record<SectionId, string> = {
  home: "Home",
  experience: "Experience",
  projects: "Projects",
  seminars: "Seminars & Events",
  contact: "Contact",
};
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

const leftContent = {
  name: "Raven Luke Quinto",
  title: "Full Stack Web Engineer",
  course: "BSIT",
  description: "I am Raven Luke E. Quinto, a 4th Year BSIT student and aspiring fullstack / software developer from Polytechnic University of the Philippines-Sta. Mesa, Manila.",
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
  const { close } = useExpanded();

  const scrollToSection = useCallback((id: SectionId) => {
    close(); // dismiss expanded view if open
    scrollingRef.current = true;
    setActive(id);
    // Wait for React to re-render sections into DOM before scrolling
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
    setTimeout(() => {
      scrollingRef.current = false;
    }, 800);
  }, [close]);

  useEffect(() => {
    document.title = `${SECTION_TITLES[active]} | Portfolio`;
  }, [active]);

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

    sections.forEach(({ id }) => {
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
            <h1 className="font-league-gothic m-0 p-0 leading-[0.7]" style={{ fontSize: vw(110) }}>{leftContent.name.toUpperCase()}</h1>
            <h3 className="font-league-gothic m-0" style={{ fontSize: vw(40) }}>{leftContent.title} | {leftContent.course}</h3>
          </div>
          <p className="font-rajdhani" style={{ fontSize: vw(32) }}>{leftContent.description}</p>

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
        {sections.map(({ id }) => {
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
            onBack={handleBack}
          />
        </div>
      )}
    </>
  );
}
