import { useState, useEffect, useRef } from "react";
import { vw } from "@/lib/utils";
import FloatingTextBtn, {
  WHEEL_DEBOUNCE,
} from "@/components/ui/reusable-ui/FloatingTextBtn";
import { useExpanded } from "@/contexts/expanded-context";
import { SEMINARS, UI_STRINGS } from "@/lib/content";

const PAGE_SIZE = 4;
const totalPages = Math.ceil(SEMINARS.length / PAGE_SIZE);

export default function Seminars() {
  const { expand } = useExpanded();
  const [page, setPage] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const pageRef = useRef(page);
  pageRef.current = page;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Wheel handler on the snap wrapper (#seminars) to cover padding area too ──
  useEffect(() => {
    const el = sectionRef.current?.parentElement;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const dir = e.deltaY > 0 ? 1 : -1;
      const next = pageRef.current + dir;

      // At boundary → let event bubble to RightMain for snap-scroll
      if (next < 0 || next >= totalPages) return;

      e.preventDefault();
      e.stopPropagation();

      // Within debounce window → consume the event but don't navigate again
      if (debounceRef.current) return;

      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
      }, WHEEL_DEBOUNCE);
      setPage(next);
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
      <h1 className="font-league-gothic m-0" style={{ fontSize: vw(64) }}>SEMINARS & EVENTS</h1>

      <FloatingTextBtn
        items={SEMINARS}
        page={page}
        onPageChange={setPage}
        onItemClick={(item) => expand({ title: item.title, body: item.body ?? UI_STRINGS.noDetails, images: item.images, sourceSection: "seminars" })}
      />
    </section>
  );
}
