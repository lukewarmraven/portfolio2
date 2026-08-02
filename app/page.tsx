"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { vw, vh } from "@/lib/utils";
import LeftMain from "@/components/ui/page-ui/left-main";
import RightMain from "@/components/ui/page-ui/right-main";
import NavSections, { sections, type SectionId } from "@/components/ui/page-ui/navigation";
import HomePage from "@/components/sections/home-page";
import Experience from "@/components/sections/experience";
import Projects from "@/components/sections/projects";
import Seminars from "@/components/sections/seminars";
import Contact from "@/components/sections/contact";
import Socials from "@/components/ui/page-ui/socials";

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
  const [active, setActive] = useState<SectionId>("home");
  const scrollingRef = useRef(false);

  const scrollToSection = useCallback((id: SectionId) => {
    scrollingRef.current = true;
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      scrollingRef.current = false;
    }, 800);
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

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
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
        {sections.map(({ id }) => {
          const Section = SECTION_COMPONENTS[id];
          return (
            <div key={id} id={id} style={{ height: "100%", scrollSnapAlign: "start", paddingTop: vh(300), paddingBottom: vh(300), boxSizing: "border-box" }}>
              <Section />
            </div>
          );
        })}
      </RightMain>
    </div>
  );
}
