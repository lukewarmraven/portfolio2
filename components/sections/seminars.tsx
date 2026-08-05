import { vw } from "@/lib/utils";
import FloatingTextBtn from "@/components/ui/reusable-ui/FloatingTextBtn";

const stats = [
  { number: "001", title: "Projects" },
  { number: "002", title: "Seminars" },
  { number: "003", title: "Experience" },
  { number: "004", title: "Certificates" },
  { number: "005", title: "Workshops" },
  { number: "006", title: "Hackathons" },
  { number: "007", title: "Webinars" },
  { number: "008", title: "Competitions" },
  { number: "009", title: "Publications" },
  { number: "010", title: "Volunteering" },
];

export default function Seminars() {
  return (
    <section
      className="flex flex-col"
      style={{ height: "100%", gap: vw(16) }}
    >
      <h1 className="font-league-gothic m-0" style={{ fontSize: vw(64) }}>SEMINARS & EVENTS</h1>

      <FloatingTextBtn
        items={stats}
        onItemClick={(item) => console.log(item.number)}
      />
    </section>
  );
}
