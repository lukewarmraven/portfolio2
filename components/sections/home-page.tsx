import LeftMain from "@/components/ui/page-ui/left-main";
import RightMain from "@/components/ui/page-ui/right-main";

const leftContent = {
  name: "Raven Luke Quinto",
  title: "Full Stack Web Engineer",
  course: "BSIT",
  description: "I am Raven Luke E. Quinto, a 4th Year BSIT student and aspiring fullstack / software developer from Polytechnic University of the Philippines-Sta. Mesa, Manila."
}
export default function HomePage() {
  return (
    <div className="relative w-full h-screen">
      <LeftMain>
        <section>
          <h1>{leftContent.name}</h1>
          <h3>{leftContent.title}</h3>
          <p>{leftContent.description}</p>
        </section>
      </LeftMain>
      <RightMain>
        {/* Scrollable content sections */}
      </RightMain>
    </div>
  );
}
