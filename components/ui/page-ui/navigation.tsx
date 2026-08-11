import { vw } from "@/lib/utils";
import { NAV_SECTIONS, type SectionId } from "@/lib/content";

export type { SectionId };

interface NavSectionsProps {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}

export default function NavSections({ active, onSelect }: NavSectionsProps) {
  return (
    <nav>
      {NAV_SECTIONS.map((item) => (
        <a
          className={`font-rajdhani no-underline cursor-pointer transition-all duration-300 ease-in-out ${
            active === item.id ? "text-black font-semibold" : "text-black font-normal"
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
