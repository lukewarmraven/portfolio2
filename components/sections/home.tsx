import { vw } from "@/lib/utils";
import SkillsPhysics from "@/components/ui/reusable-ui/skills-physics";

const SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Tailwind",
  "Figma",
  "AWS",
];

export default function HomePage() {
  return (
    <section
      className="flex flex-col"
      style={{ height: "100%", gap: vw(16) }}
    >
      <h1
        className="font-league-gothic m-0"
        style={{ fontSize: vw(64) }}
      >
        HOME
      </h1>

      <div
        className="no-scrollbar"
        style={{
          flex: "1 1 0",
          minHeight: 0,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            height: "100%",
          }}
        >
          {/* Page 1 — Skills Physics */}
          <div
            style={{
              width: "100%",
              minWidth: "100%",
              height: "100%",
              scrollSnapAlign: "start",
              display: "flex",
              flexDirection: "column",
              background: "var(--color-card)",
              borderRadius: vw(12),
              padding: vw(24),
            }}
          >
            <SkillsPhysics skills={SKILLS} />
          </div>

          {/* Page 2 — placeholder */}
          <div
            style={{
              width: "100%",
              minWidth: "100%",
              height: "100%",
              scrollSnapAlign: "start",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--color-card)",
              borderRadius: vw(12),
            }}
          >
            <span
              className="font-league-gothic"
              style={{ fontSize: vw(48) }}
            >
              More coming soon
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
