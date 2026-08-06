import { useState, useEffect, useRef } from "react";
import { vw } from "@/lib/utils";
import FloatingTextBtn, {
  WHEEL_DEBOUNCE,
} from "@/components/ui/reusable-ui/FloatingTextBtn";
import { useExpanded } from "@/contexts/expanded-context";

const stats = [
  { number: "001", title: "Projects", body: "Led the development of a full-stack e-commerce platform serving 5,000+ monthly active users. Architected the database schema, built a RESTful API with Node.js and Express, and implemented a React frontend with server-side rendering. The platform reduced page load times by 60% compared to the legacy system and maintained 99.9% uptime over 12 months. Collaborated with a team of 4 developers using Agile methodology with bi-weekly sprints." },
  { number: "002", title: "Seminars", body: "Attended and participated in over 15 industry seminars covering topics from cloud architecture to AI/ML integration. Notable events include Google I/O Extended Manila, AWS Summit Singapore, and ReactJS Philippines meetups. Each seminar provided hands-on workshops and networking opportunities with industry professionals. Key takeaways included best practices for microservices architecture and containerization strategies using Docker and Kubernetes." },
  { number: "003", title: "Experience", body: "Three years of professional experience spanning frontend, backend, and DevOps roles. Started as a junior frontend developer building React components, then transitioned to full-stack work with Node.js and PostgreSQL. Most recently focused on infrastructure — setting up CI/CD pipelines with GitHub Actions and managing cloud deployments on AWS. Consistently delivered projects on schedule and received positive performance reviews from team leads." },
  { number: "004", title: "Certificates", body: "Earned professional certifications validating expertise across multiple technology domains. Certifications include AWS Solutions Architect Associate, MongoDB Developer Associate, and Meta Frontend Developer Professional Certificate. Each certification required rigorous preparation — the AWS exam alone demanded 120+ hours of study and hands-on lab work. These credentials demonstrate a commitment to continuous learning and industry-recognized skill standards." },
  { number: "005", title: "Workshops", body: "Facilitated and participated in numerous technical workshops focused on practical skill development. Led a 3-day React workshop for 30 junior developers, covering hooks, context API, and performance optimization. Attended workshops on GraphQL, TypeScript advanced patterns, and WebAssembly. The hands-on format of these sessions accelerated learning — participants built real projects under guided supervision and left with production-ready code." },
  { number: "006", title: "Hackathons", body: "Competed in 8 hackathons, placing in the top 3 in four of them. Most notable was a 48-hour fintech hackathon where the team built a P2P lending prototype using Solidity smart contracts and a React Native mobile app. The project won Best Technical Implementation. Hackathons sharpened rapid prototyping skills and taught the value of scoping features aggressively under tight deadlines while maintaining code quality." },
  { number: "007", title: "Webinars", body: "Hosted and attended webinars covering emerging technology trends and career development. Presented a webinar on 'Getting Started with Next.js' that attracted 200+ live attendees. Attended sessions on system design interviews, blockchain fundamentals, and accessibility engineering. Webinars provided a flexible learning format — recorded sessions served as reference material long after the live events concluded." },
  { number: "008", title: "Competitions", body: "Participated in programming competitions that tested algorithmic thinking and problem-solving under pressure. Achieved a top 50 national ranking in a competitive programming league. Solved 300+ problems across platforms like LeetCode, Codeforces, and HackerRank. Competition experience strengthened fundamentals in data structures, dynamic programming, and graph algorithms — skills that directly translate to writing efficient production code." },
  { number: "009", title: "Publications", body: "Authored technical articles and research papers contributing to the developer community. Published a well-received Medium article on React performance patterns that garnered 10,000+ reads. Co-authored a conference paper on accessible web design presented at a national IT symposium. Writing has honed the ability to explain complex technical concepts clearly — a skill that proves invaluable in code reviews and documentation." },
  { number: "010", title: "Volunteering", body: "Dedicated over 200 hours to tech-for-good initiatives and community outreach. Volunteered as a coding mentor for underserved high school students through a local nonprofit. Helped organize a regional tech conference that drew 500+ attendees. Built a donation management system pro bono for a charitable foundation. These experiences reinforced the importance of using technology as a force for positive social impact." },
];

const PAGE_SIZE = 4;
const totalPages = Math.ceil(stats.length / PAGE_SIZE);

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
        items={stats}
        page={page}
        onPageChange={setPage}
        onItemClick={(item) => expand({ title: item.title, body: item.body ?? "No details available.", sourceSection: "seminars" })}
      />
    </section>
  );
}
