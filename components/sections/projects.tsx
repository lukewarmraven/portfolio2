import { useState } from "react";
import { vw } from "@/lib/utils";
import PopupCarousel, {
  type PopupCarouselItem,
} from "@/components/ui/reusable-ui/PopupCarousel";

const PROJECTS: PopupCarouselItem[] = [
  {
    title: "Resbac — Web Dashboard",
    description: "Full-stack rescue management platform",
    image: "/assets/projects/resbac/web0.png",
  },
  {
    title: "Resbac — Mobile View",
    description: "Responsive mobile experience",
    image: "/assets/projects/resbac/mob0.jpg",
  },
  {
    title: "Resbac — Analytics Module",
    description: "Data visualization & reporting",
    image: "/assets/projects/resbac/web1.png",
  },
  {
    title: "Resbac — Team Management",
    description: "Role-based access & coordination",
    image: "/assets/projects/resbac/web2.png",
  },
  {
    title: "Resbac — Mobile Detail View",
    description: "Field-optimized data entry",
    image: "/assets/projects/resbac/mob1.jpg",
  },
  {
    title: "Resbac — Dispatch Console",
    description: "Real-time emergency coordination hub",
    image: "/assets/projects/resbac/web3.png",
  },
];

export default function Projects() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <section
      className="flex flex-col"
      style={{ height: "100%", gap: vw(16) }}
    >
      <h1
        className="font-league-gothic m-0"
        style={{ fontSize: vw(64) }}
      >
        PROJECTS
      </h1>

      {/* ── Current project info ── */}
      <div style={{ textAlign: "center" }}>
        <h3
          className="font-league-gothic m-0"
          style={{ fontSize: vw(40), lineHeight: 0.9 }}
        >
          {PROJECTS[currentIndex].title}
        </h3>
        <p
          className="font-rajdhani m-0 text-muted-foreground"
          style={{ fontSize: vw(24), lineHeight: 1.1, marginTop: vw(4) }}
        >
          {PROJECTS[currentIndex].description}
        </p>
      </div>

      <PopupCarousel
        items={PROJECTS}
        currentIndex={currentIndex}
        onCurrentChange={setCurrentIndex}
      />
    </section>
  );
}
