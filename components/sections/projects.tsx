import { useState, useEffect, useRef } from "react";
import { vw } from "@/lib/utils";
import PopupCarousel, {
  type PopupCarouselItem,
  WHEEL_DEBOUNCE,
} from "@/components/ui/reusable-ui/PopupCarousel";
import { useExpanded } from "@/contexts/expanded-context";

const PROJECTS: PopupCarouselItem[] = [
  {
    title: "Resbac — Web Dashboard",
    description: "Full-stack rescue management platform",
    image: "/assets/projects/resbac/web0.png",
    body: "A comprehensive web dashboard built for Resbac, a rescue operations management platform. The dashboard provides real-time situational awareness with live maps, resource tracking, and incident management. Built with React and Next.js on the frontend, with a Node.js/Express backend and PostgreSQL database. Features include role-based access control, real-time WebSocket updates, and an interactive data visualization suite powered by D3.js. The system handles 500+ concurrent rescue operations and serves 12 agencies across the region.",
  },
  {
    title: "Resbac — Mobile View",
    description: "Responsive mobile experience",
    image: "/assets/projects/resbac/mob0.jpg",
    body: "The mobile view of Resbac delivers a streamlined, field-optimized experience for first responders. Built as a progressive web app (PWA) with offline support, it allows rescue teams to receive dispatch notifications, update incident statuses, and capture field data even in low-connectivity environments. The interface prioritizes one-handed operation with large touch targets and gesture-based navigation. GPS tracking enables command centers to monitor team positions in real time. The mobile client syncs seamlessly with the web dashboard when connectivity is restored.",
  },
  {
    title: "Resbac — Analytics Module",
    description: "Data visualization & reporting",
    image: "/assets/projects/resbac/web1.png",
    body: "The analytics module transforms raw rescue operation data into actionable insights. Custom-built chart components render incident heatmaps, response time histograms, and resource utilization trends. Administrators can generate automated weekly reports or drill down with custom date ranges and filters. The module uses a combination of pre-aggregated materialized views for dashboard performance and ad-hoc query capabilities for deep dives. Export options include PDF reports, CSV data dumps, and scheduled email delivery to stakeholders.",
  },
  {
    title: "Resbac — Team Management",
    description: "Role-based access & coordination",
    image: "/assets/projects/resbac/web2.png",
    body: "The team management interface enables administrators to orchestrate rescue personnel across multiple agencies and jurisdictions. Features include shift scheduling with conflict detection, certification tracking with expiration alerts, and dynamic team assembly based on incident requirements. A drag-and-drop organizational chart visualizes reporting structures, while the availability matrix shows at-a-glance who is on duty, on call, or off rotation. Integration with external HR systems ensures personnel records stay synchronized across platforms.",
  },
  {
    title: "Resbac — Mobile Detail View",
    description: "Field-optimized data entry",
    image: "/assets/projects/resbac/mob1.jpg",
    body: "The mobile detail view focuses on rapid, accurate field data capture. Custom form components minimize typing with smart defaults, barcode scanning for equipment tracking, and voice-to-text for incident notes. Photo attachments are automatically geotagged and compressed for efficient upload over cellular networks. The form validation layer handles partial submissions gracefully — responders can save drafts and complete reports later. All field data flows into the central analytics pipeline, ensuring command staff work with the most current information available.",
  },
  {
    title: "Resbac — Dispatch Console",
    description: "Real-time emergency coordination hub",
    image: "/assets/projects/resbac/web3.png",
    body: "The dispatch console serves as the nerve center for emergency coordination. Operators manage incoming incident reports through a triage queue with severity classification and automated resource suggestions. A split-pane layout shows active incidents on one side and available resources on the other, with drag-and-drop assignment. The integrated communication panel supports SMS, push notifications, and radio bridge for reaching teams across different communication systems. An audit log records every dispatch decision for post-incident review and continuous improvement of response protocols.",
  },
];

export default function Projects() {
  const { expand } = useExpanded();
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const currentRef = useRef(currentIndex);
  currentRef.current = currentIndex;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Wheel handler on the snap wrapper (#projects) to cover padding area too ──
  useEffect(() => {
    const el = sectionRef.current?.parentElement;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const dir = e.deltaY > 0 ? 1 : -1;
      const next = currentRef.current + dir;

      // At carousel boundary → let event bubble to RightMain for snap-scroll
      if (next < 0 || next >= PROJECTS.length) return;

      e.preventDefault();
      e.stopPropagation();

      // Within debounce window → consume the event but don't navigate again
      if (debounceRef.current) return;

      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
      }, WHEEL_DEBOUNCE);
      setCurrentIndex(next);
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <section
      ref={sectionRef}
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
        onItemClick={(item) => expand({ title: item.title, body: item.body ?? "No details available.", sourceSection: "projects" })}
      />
    </section>
  );
}
