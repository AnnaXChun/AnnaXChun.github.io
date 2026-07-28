"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, Html, RoundedBox } from "@react-three/drei";
import { useCallback, useRef, useState } from "react";
import * as THREE from "three";

const chapters = [
  {
    kicker: "01 / SIGNAL",
    title: "About",
    accent: "#b9ff4f",
    statement:
      "I turn ambitious research ideas into systems people can run, measure, and trust.",
    detail:
      "My sweet spot sits between learning algorithms, research infrastructure, and interactive product thinking.",
    meta: ["AGENTIC RL", "SYSTEMS", "PROTOTYPING"],
  },
  {
    kicker: "02 / CURIOSITY",
    title: "Research",
    accent: "#ff784f",
    statement:
      "How can agents learn from environments, feedback, and the useful shape of failure?",
    detail:
      "I care about tool-using agents, reliable evaluation, scalable learning loops, and experiments that reveal why something works.",
    meta: ["TOOL USE", "EVALUATION", "LEARNING LOOPS"],
  },
  {
    kicker: "03 / CRAFT",
    title: "Build",
    accent: "#7b75ff",
    statement:
      "I like research code with product instincts: observable, composable, and made to survive iteration.",
    detail:
      "From training pipelines to playful 3D interfaces, I build the connective tissue that turns a compelling demo into repeatable progress.",
    meta: ["RESEARCH INFRA", "3D WEB", "DX"],
  },
  {
    kicker: "04 / CURRENT",
    title: "Now",
    accent: "#ffda45",
    statement:
      "Exploring better ways for agents to plan, act, and improve across long horizons.",
    detail:
      "Open to thoughtful research collaborations, strange prototypes, and hard problems with clear evidence at the end.",
    meta: ["OPEN TO COLLAB", "UTC+8", "2026"],
  },
] as const;

const work = [
  {
    index: "01",
    title: "Learning systems",
    type: "RESEARCH ENGINEERING",
    text: "Training loops, reward design, and evaluation surfaces for agents that learn through action.",
    color: "#b9ff4f",
  },
  {
    index: "02",
    title: "Interactive worlds",
    type: "EXPERIENCE DESIGN",
    text: "Interfaces that turn complex technical ideas into something people can see, touch, and remember.",
    color: "#ff784f",
  },
  {
    index: "03",
    title: "Reliable evidence",
    type: "TOOLS & EVALUATION",
    text: "Instrumentation and experiments that make progress legible—and failure genuinely useful.",
    color: "#7b75ff",
  },
] as const;

type AvatarProps = {
  activeIndex: number;
  onSelect: (index: number) => void;
};

function Eye({
  position,
  pointer,
}: {
  position: [number, number, number];
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const pupil = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!pupil.current) return;
    pupil.current.position.x = THREE.MathUtils.lerp(
      pupil.current.position.x,
      pointer.current.x * 0.085,
      0.16,
    );
    pupil.current.position.y = THREE.MathUtils.lerp(
      pupil.current.position.y,
      pointer.current.y * 0.065,
      0.16,
    );
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.145, 24, 24]} />
        <meshStandardMaterial color="#f8f5ed" roughness={0.25} />
      </mesh>
      <mesh ref={pupil} position={[0, 0, 0.125]}>
        <sphereGeometry args={[0.058, 20, 20]} />
        <meshStandardMaterial color="#16151c" roughness={0.15} />
      </mesh>
    </group>
  );
}

function Sticker({
  index,
  label,
  position,
  rotation,
  activeIndex,
  onSelect,
}: {
  index: number;
  label: string;
  position: [number, number, number];
  rotation: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <Html
      center
      transform
      sprite
      position={position}
      distanceFactor={7.2}
      style={{ pointerEvents: "auto" }}
    >
      <button
        className={`mesh-sticker ${activeIndex === index ? "is-active" : ""}`}
        onClick={() => onSelect(index)}
        style={
          {
            "--sticker-color": chapters[index].accent,
            "--sticker-rotate": `${rotation}deg`,
          } as React.CSSProperties
        }
        aria-label={`Show ${label} chapter`}
      >
        <span>0{index + 1}</span>
        {label}
      </button>
    </Html>
  );
}

function Avatar({ activeIndex, onSelect }: AvatarProps) {
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;

    if (body.current) {
      body.current.rotation.y = THREE.MathUtils.lerp(
        body.current.rotation.y,
        state.pointer.x * 0.19,
        0.045,
      );
      body.current.rotation.x = THREE.MathUtils.lerp(
        body.current.rotation.x,
        -state.pointer.y * 0.055,
        0.045,
      );
    }

    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.lerp(
        head.current.rotation.y,
        state.pointer.x * 0.24,
        0.08,
      );
      head.current.rotation.x = THREE.MathUtils.lerp(
        head.current.rotation.x,
        -state.pointer.y * 0.16,
        0.08,
      );
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 6, 5]} intensity={4.2} color="#fff7dc" />
      <pointLight position={[-4, 1, 3]} intensity={24} color="#817bff" />
      <pointLight position={[4, -1, 2]} intensity={18} color="#b9ff4f" />

      <Float speed={1.35} rotationIntensity={0.08} floatIntensity={0.22}>
        <group ref={body} position={[0, -0.45, 0]} rotation={[0, -0.04, 0]}>
          <group ref={head}>
            <mesh position={[0, 1.42, 0]}>
              <sphereGeometry args={[0.76, 48, 48]} />
              <meshStandardMaterial color="#c8a4ff" roughness={0.48} />
            </mesh>
            <RoundedBox
              args={[1.25, 0.46, 0.88]}
              radius={0.18}
              smoothness={4}
              position={[0, 1.91, -0.05]}
              rotation={[0, 0, -0.05]}
            >
              <meshStandardMaterial color="#17161d" roughness={0.65} />
            </RoundedBox>
            <mesh position={[0, 1.31, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.09, 0.24, 20]} />
              <meshStandardMaterial color="#aa80e1" roughness={0.5} />
            </mesh>
            <Eye position={[-0.26, 1.52, 0.63]} pointer={pointer} />
            <Eye position={[0.26, 1.52, 0.63]} pointer={pointer} />
            <mesh position={[0, 1.12, 0.68]}>
              <capsuleGeometry args={[0.035, 0.22, 4, 16]} />
              <meshStandardMaterial color="#17161d" />
            </mesh>
          </group>

          <RoundedBox
            args={[1.45, 1.55, 0.72]}
            radius={0.28}
            smoothness={5}
            position={[0, 0.02, 0]}
          >
            <meshStandardMaterial color="#f2eee6" roughness={0.7} />
          </RoundedBox>
          <mesh position={[0, 0.15, 0.39]}>
            <circleGeometry args={[0.28, 40]} />
            <meshStandardMaterial color="#17161d" />
          </mesh>
          <mesh position={[0, 0.15, 0.405]}>
            <ringGeometry args={[0.11, 0.18, 32]} />
            <meshStandardMaterial color={chapters[activeIndex].accent} />
          </mesh>

          <mesh position={[-0.98, 0, 0]} rotation={[0, 0, -0.18]}>
            <capsuleGeometry args={[0.22, 1.12, 8, 20]} />
            <meshStandardMaterial color="#c8a4ff" roughness={0.52} />
          </mesh>
          <mesh position={[0.98, 0, 0]} rotation={[0, 0, 0.18]}>
            <capsuleGeometry args={[0.22, 1.12, 8, 20]} />
            <meshStandardMaterial color="#c8a4ff" roughness={0.52} />
          </mesh>

          <RoundedBox
            args={[1.2, 0.55, 0.68]}
            radius={0.2}
            smoothness={4}
            position={[0, -1.02, 0]}
          >
            <meshStandardMaterial color="#17161d" roughness={0.6} />
          </RoundedBox>
          <mesh position={[-0.36, -1.86, 0]}>
            <capsuleGeometry args={[0.27, 1.18, 8, 20]} />
            <meshStandardMaterial color="#7b75ff" roughness={0.6} />
          </mesh>
          <mesh position={[0.36, -1.86, 0]}>
            <capsuleGeometry args={[0.27, 1.18, 8, 20]} />
            <meshStandardMaterial color="#7b75ff" roughness={0.6} />
          </mesh>

          <Sticker
            index={0}
            label="ABOUT"
            position={[-0.72, 1.77, 0.74]}
            rotation={-8}
            activeIndex={activeIndex}
            onSelect={onSelect}
          />
          <Sticker
            index={1}
            label="RESEARCH"
            position={[0.79, 0.74, 0.74]}
            rotation={7}
            activeIndex={activeIndex}
            onSelect={onSelect}
          />
          <Sticker
            index={2}
            label="BUILD"
            position={[-0.72, -0.37, 0.69]}
            rotation={6}
            activeIndex={activeIndex}
            onSelect={onSelect}
          />
          <Sticker
            index={3}
            label="NOW"
            position={[0.67, -1.12, 0.62]}
            rotation={-6}
            activeIndex={activeIndex}
            onSelect={onSelect}
          />
        </group>
      </Float>

      <mesh position={[0, -2.62, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.45, 0.035, 16, 90]} />
        <meshStandardMaterial color={chapters[activeIndex].accent} emissiveIntensity={0.5} />
      </mesh>
      <ContactShadows
        position={[0, -2.62, 0]}
        opacity={0.48}
        scale={7}
        blur={2.5}
        far={4.5}
        color="#17161d"
      />
    </>
  );
}

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const chapter = chapters[activeIndex];

  const move = useCallback((direction: number) => {
    setActiveIndex((current) => (current + direction + chapters.length) % chapters.length);
  }, []);

  return (
    <main>
      <section
        className="hero"
        aria-label="Interactive portfolio introduction"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return;
          const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
          if (Math.abs(delta) > 55) move(delta > 0 ? -1 : 1);
          touchStart.current = null;
        }}
      >
        <header className="site-header">
          <a className="wordmark" href="#top" aria-label="Chunxiang portfolio home">
            CX<span>°</span>
          </a>
          <div className="availability">
            <span />
            OPEN TO RESEARCH COLLABORATIONS
          </div>
          <a className="header-link" href="#work">
            SELECTED WORK ↓
          </a>
        </header>

        <div className="hero-copy" id="top">
          <p className="eyebrow">AI RESEARCHER · SYSTEM BUILDER · CURIOUS HUMAN</p>
          <h1>
            I BUILD
            <br />
            LEARNING
            <br />
            <em>MACHINES.</em>
          </h1>
          <p className="hero-note">
            Research thinking with builder energy.
            <br />
            Drag your cursor across the face.
          </p>
        </div>

        <div className="scene-wrap" aria-label="Interactive 3D character with portfolio stickers">
          <Canvas
            camera={{ position: [0, 0.1, 6.6], fov: 40 }}
            dpr={[1, 1.6]}
            gl={{ antialias: true, alpha: true }}
          >
            <Avatar activeIndex={activeIndex} onSelect={setActiveIndex} />
          </Canvas>
          <div className="orbit-line orbit-one" />
          <div className="orbit-line orbit-two" />
        </div>

        <aside className="chapter-panel" aria-live="polite">
          <div className="chapter-topline">
            <span style={{ color: chapter.accent }}>{chapter.kicker}</span>
            <span>{String(activeIndex + 1).padStart(2, "0")} — 04</span>
          </div>
          <div key={chapter.title} className="chapter-content">
            <h2>{chapter.title}</h2>
            <p className="chapter-statement">{chapter.statement}</p>
            <p className="chapter-detail">{chapter.detail}</p>
            <div className="meta-row">
              {chapter.meta.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div className="panel-controls">
            <button onClick={() => move(-1)} aria-label="Previous portfolio chapter">
              ←
            </button>
            <div className="progress">
              {chapters.map((item, index) => (
                <button
                  key={item.title}
                  className={index === activeIndex ? "is-active" : ""}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show ${item.title} chapter`}
                />
              ))}
            </div>
            <button onClick={() => move(1)} aria-label="Next portfolio chapter">
              →
            </button>
          </div>
        </aside>

        <div className="scroll-cue">
          <span>SCROLL TO EXPLORE</span>
          <i />
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="section-heading">
          <p>THREE WAYS I CREATE SIGNAL</p>
          <h2>
            SELECTED
            <br />
            <span>directions</span>
          </h2>
        </div>
        <div className="work-grid">
          {work.map((item) => (
            <article key={item.index} className="work-card" style={{ "--card-color": item.color } as React.CSSProperties}>
              <div className="card-index">{item.index}</div>
              <p className="card-type">{item.type}</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="card-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <footer id="contact">
        <p>HAVE A HARD PROBLEM?</p>
        <h2>LET’S MAKE IT LEGIBLE.</h2>
        <div className="footer-row">
          <span>CHUNXIANG · RESEARCH & SYSTEMS</span>
          <span>UTC+8 · AVAILABLE WORLDWIDE</span>
          <a href="#top">BACK TO TOP ↑</a>
        </div>
      </footer>
    </main>
  );
}
