import { vw } from "@/lib/utils";

export const sections = [
  { id: "home", label: "01 HOME" },
  { id: "experience", label: "02 EXPERIENCE" },
  { id: "projects", label: "03 PROJECTS" },
  { id: "seminars", label: "04 SEMINARS & EVENTS" },
  { id: "contact", label: "05 CONTACT ME" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

interface NavSectionsProps {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}

export default function NavSections({ active, onSelect }: NavSectionsProps) {
  return (
    <nav>
      {sections.map((item) => (
        <a
          className={`font-rajdhani no-underline cursor-pointer transition-all duration-500 ease-in-out ${
            active === item.id ? "text-black font-semibold" : "text-black/40 font-normal"
          }`}
          style={{fontSize: vw(32)}}
          key={item.id}
          onClick={(e) => {
            e.preventDefault();
            onSelect(item.id);
          }}
        >
          {item.label} <br />
        </a>
      ))}
    </nav>
  );
}
