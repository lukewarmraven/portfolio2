import { vw } from "@/lib/utils";

const leftContent = {
  name: "Raven Luke Quinto",
  title: "Full Stack Web Engineer",
  course: "BSIT",
  description: "I am Raven Luke E. Quinto, a 4th Year BSIT student and aspiring fullstack / software developer from Polytechnic University of the Philippines-Sta. Mesa, Manila.",
};

export default function HomePage() {
  return (
    <section>
      <h1 className="font-league-gothic m-0" style={{ fontSize: vw(110) }}>{leftContent.name.toUpperCase()}</h1>
      <h3 className="font-league-gothic m-0" style={{ fontSize: vw(40) }}>{leftContent.title} | {leftContent.course}</h3>
      <p className="font-rajdhani" style={{ fontSize: vw(32) }}>{leftContent.description}</p>
    </section>
  );
}
