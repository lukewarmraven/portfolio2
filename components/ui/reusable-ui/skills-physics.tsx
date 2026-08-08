"use client";

import { useRef, useEffect, useCallback } from "react";
import Matter from "matter-js";
import { vw } from "@/lib/utils";

const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

const PHYSICS_FONT = '"Darumadrop One", cursive';

const PHYSICS_COLORS = [
  "#DC2626", "#0891B2", "#F59E0B", "#7C3AED",
  "#DB2777", "#2563EB", "#EA580C", "#65A30D",
  "#E11D48", "#0284C7",
];

interface SkillsPhysicsProps {
  skills: string[];
}

export default function SkillsPhysics({ skills }: SkillsPhysicsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const letterBodiesRef = useRef<Matter.Body[]>([]);
  const lastColorRef = useRef<string>("");
  const wordIdsRef = useRef<Map<string, Matter.Body[]>>(new Map());

  // ── Init ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = 700;
    const H = 400;

    const engine = Engine.create();
    engine.gravity.y = 1;
    engineRef.current = engine;

    const render = Render.create({
      canvas,
      engine,
      options: { width: W, height: H, wireframes: false, background: "transparent" },
    });
    Render.run(render);
    renderRef.current = render;

    const runner = Runner.create();
    Runner.run(runner, engine);
    runnerRef.current = runner;

    // Walls
    const wallOpts = { isStatic: true, render: { fillStyle: "transparent" } };
    const floor = Bodies.rectangle(W / 2, H, W * 2, 40, wallOpts);
    const leftWall = Bodies.rectangle(-20, H / 2, 40, H * 2, wallOpts);
    const rightWall = Bodies.rectangle(W + 20, H / 2, 40, H * 2, wallOpts);
    Composite.add(engine.world, [floor, leftWall, rightWall]);

    // Draw text on top of letter bodies
    Events.on(render, "afterRender", () => {
      const ctx = render.context;
      ctx.font = `600 38px ${PHYSICS_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";

      letterBodiesRef.current.forEach((b) => {
        ctx.save();
        ctx.translate(b.position.x, b.position.y);
        ctx.rotate(b.angle);
        ctx.fillText((b as any).letterChar, 0, 1);
        ctx.restore();
      });
    });

    return () => {
      Runner.stop(runner);
      Render.stop(render);
      Engine.clear(engine);
    };
  }, []);

  // ── Spawn word ────────────────────────────────────────────────
  const spawnWord = useCallback((word: string) => {
    const engine = engineRef.current;
    if (!engine) return;

    word = word.trim();
    if (!word) return;

    // Clear previous instance of this word
    const prev = wordIdsRef.current.get(word);
    if (prev) {
      prev.forEach((b) => Composite.remove(engine.world, b));
      letterBodiesRef.current = letterBodiesRef.current.filter((b) => !prev.includes(b));
    }

    const size = 60;
    const boxW = size;
    const boxH = size;
    const chars = word.split("");
    const W = 700;

    // Pick color — never same as previous
    let color: string;
    do {
      color = PHYSICS_COLORS[Math.floor(Math.random() * PHYSICS_COLORS.length)];
    } while (color === lastColorRef.current);
    lastColorRef.current = color;

    const newBodies: Matter.Body[] = [];

    chars.forEach((ch, i) => {
      if (ch === " ") return;

      const x = W / 2 + (i - chars.length / 2) * (boxW + 2) + (Math.random() * 10 - 5);
      const y = -10 - i * 5;

      const body = Bodies.rectangle(x, y, boxW, boxH, {
        restitution: 0.35,
        friction: 0.3,
        angle: Math.random() * 0.4 - 0.2,
        chamfer: { radius: 4 },
        render: { fillStyle: color },
      });

      (body as any).letterChar = ch;
      Composite.add(engine.world, body);
      newBodies.push(body);
    });

    letterBodiesRef.current = [...letterBodiesRef.current, ...newBodies];
    wordIdsRef.current.set(word, newBodies);
  }, []);

  // ── Clear all ─────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    letterBodiesRef.current.forEach((b) => Composite.remove(engine.world, b));
    letterBodiesRef.current = [];
    wordIdsRef.current.clear();
  }, []);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: "1 1 0",
        minHeight: 0,
        gap: vw(4),
      }}
    >
      {/* Title */}
      <h2
        className="font-rajdhani font-bold m-0"
        style={{ fontSize: vw(32), textAlign: "center", flexShrink: 0 }}
      >
        SKILLS
      </h2>

      {/* Clickable skill tags */}
      <p
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: `0 ${vw(15)}`,
          margin: 0,
          flexShrink: 0,
        }}
      >
        {skills.map((skill, i) => (
          <span
            key={skill}
            onClick={() => spawnWord(skill)}
            className="font-rajdhani skill-tag"
            style={{
              fontSize: vw(32),
            }}
          >
            {skill}
            {i < skills.length - 1 ? "," : ""}
          </span>
        ))}
      </p>

      {/* Canvas */}
      <div style={{ flex: "1 1 0", minHeight: 0, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <canvas ref={canvasRef} width={700} height={400} style={{ maxWidth: "100%", maxHeight: "100%" }} />
      </div>

      {/* Clear button */}
      <div style={{ display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <span
          onClick={clearAll}
          className="font-rajdhani"
          style={{
            fontSize: vw(32),
            cursor: "pointer",
            userSelect: "none",
            color: "var(--color-muted-foreground)",
          }}
        >
          [clear]
        </span>
      </div>
    </div>
  );
}
