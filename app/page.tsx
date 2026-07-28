"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, RoundedBox } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef, useState } from "react";
import * as THREE from "three";

gsap.registerPlugin(useGSAP);

const chapters = [
  {
    kicker: "01 / PROFILE",
    title: "Senior Engineer",
    accent: "#b9ff4f",
    statement:
      "I turn complex product requirements into reliable software that teams can evolve with confidence.",
    detail:
      "A senior software engineer with strong product instincts, deep backend experience, and the range to move from architecture to production delivery.",
    meta: ["BACKEND", "ARCHITECTURE", "PRODUCT THINKING"],
  },
  {
    kicker: "02 / SCALE",
    title: "Systems at Scale",
    accent: "#ff784f",
    statement:
      "I design high-concurrency services that remain observable, resilient, and predictable under pressure.",
    detail:
      "From API boundaries and data consistency to queues, caching, rate limiting, and graceful degradation, I build for the failure modes that appear at scale.",
    meta: ["MICROSERVICES", "KAFKA · REDIS", "PERFORMANCE"],
  },
  {
    kicker: "03 / INTELLIGENCE",
    title: "AI-Native",
    accent: "#7b75ff",
    statement:
      "I use AI as an engineering capability—not a demo layer.",
    detail:
      "I integrate LLMs, RAG, tool-using agents, evaluation pipelines, and AI-assisted development into systems with clear quality, latency, and cost boundaries.",
    meta: ["LLM · RAG", "AGENTS", "EVALUATION"],
  },
  {
    kicker: "04 / DELIVERY",
    title: "Ship & Lead",
    accent: "#ffda45",
    statement:
      "I raise the engineering bar while keeping delivery moving.",
    detail:
      "Architecture reviews, pragmatic standards, CI/CD, observability, incident learning, and developer experience are all part of shipping durable software.",
    meta: ["CLOUD NATIVE", "CI/CD", "TECH LEADERSHIP"],
  },
] as const;

const work = [
  {
    index: "01",
    title: "Distributed backend",
    type: "SYSTEM ARCHITECTURE",
    text: "Service boundaries, data consistency, asynchronous workflows, fault isolation, and APIs designed for long-term change.",
    stack: ["GO / JAVA", "GRPC", "DDD", "SQL / NOSQL"],
    color: "#b9ff4f",
  },
  {
    index: "02",
    title: "High concurrency",
    type: "PERFORMANCE ENGINEERING",
    text: "Caching, message queues, backpressure, rate limiting, profiling, and observability for stable performance under load.",
    stack: ["KAFKA", "REDIS", "ASYNC I/O", "PROMETHEUS"],
    color: "#ff784f",
  },
  {
    index: "03",
    title: "Production AI",
    type: "AI ENGINEERING",
    text: "LLM applications with retrieval, tools, evaluation, guardrails, tracing, and deliberate latency and cost controls.",
    stack: ["LLM", "RAG", "AGENTS", "EVALS"],
    color: "#7b75ff",
  },
  {
    index: "04",
    title: "Cloud delivery",
    type: "PLATFORM & DEVEX",
    text: "Containerized delivery, automated quality gates, progressive releases, and feedback loops that help teams ship safely.",
    stack: ["KUBERNETES", "DOCKER", "CI/CD", "OPEN TELEMETRY"],
    color: "#ffda45",
  },
] as const;

const traits = [
  { label: "INFP", note: "PERSONALITY", className: "trait-one", color: "#b9ff4f" },
  { label: "双鱼座", note: "PISCES", className: "trait-two", color: "#ffda45" },
  { label: "AI-NATIVE", note: "MINDSET", className: "trait-three", color: "#7b75ff" },
  { label: "SYSTEM DESIGN", note: "CRAFT", className: "trait-four", color: "#ff784f" },
  { label: "BUILDER", note: "ENERGY", className: "trait-five", color: "#f2eee6" },
  { label: "HIGH CONCURRENCY", note: "SPECIALTY", className: "trait-six", color: "#b9ff4f" },
] as const;

type AvatarProps = {
  activeIndex: number;
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

function Avatar({ activeIndex }: AvatarProps) {
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
        <group
          ref={body}
          position={[0, -0.38, 0]}
          rotation={[0, -0.04, 0]}
          scale={0.94}
        >
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
  const panelRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeIndexRef = useRef(0);
  const isAnimating = useRef(false);
  const wheelDistance = useRef(0);
  const touchStart = useRef<number | null>(null);
  const reduceMotion = useRef(false);
  const chapter = chapters[activeIndex];

  const { contextSafe } = useGSAP(
    () => {
      reduceMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      slideRefs.current.forEach((slide, index) => {
        if (!slide) return;
        gsap.set(slide, {
          autoAlpha: index === 0 ? 1 : 0,
          yPercent: index === 0 ? 0 : 100,
          zIndex: index === 0 ? 2 : 0,
        });
      });
    },
    { scope: panelRef },
  );

  const goToChapter = contextSafe(
    (requestedIndex: number, directionHint?: number) => {
      if (isAnimating.current) return;

      const nextIndex =
        (requestedIndex + chapters.length) % chapters.length;
      const currentIndex = activeIndexRef.current;
      if (nextIndex === currentIndex) return;

      const currentSlide = slideRefs.current[currentIndex];
      const nextSlide = slideRefs.current[nextIndex];
      if (!currentSlide || !nextSlide) return;

      const direction =
        directionHint ?? (nextIndex > currentIndex ? 1 : -1);
      const duration = reduceMotion.current ? 0.01 : 0.82;
      const currentParts = currentSlide.querySelectorAll(".chapter-anim");
      const nextParts = nextSlide.querySelectorAll(".chapter-anim");

      isAnimating.current = true;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);

      gsap.set(nextSlide, {
        autoAlpha: 1,
        yPercent: direction * 100,
        zIndex: 3,
      });
      gsap.set(nextParts, {
        autoAlpha: reduceMotion.current ? 1 : 0,
        y: reduceMotion.current ? 0 : direction * 38,
      });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.inOut", overwrite: "auto" },
        onComplete: () => {
          gsap.set(currentSlide, { autoAlpha: 0, zIndex: 0 });
          gsap.set(currentParts, { autoAlpha: 1, y: 0 });
          gsap.set(nextSlide, { zIndex: 2 });
          isAnimating.current = false;
        },
      });

      timeline
        .to(
          currentParts,
          {
            autoAlpha: reduceMotion.current ? 0 : 0,
            y: reduceMotion.current ? 0 : -direction * 26,
            duration: reduceMotion.current ? 0.01 : 0.34,
            stagger: reduceMotion.current ? 0 : 0.025,
          },
          0,
        )
        .to(
          currentSlide,
          {
            yPercent: -direction * 100,
            duration,
          },
          0,
        )
        .to(
          nextSlide,
          {
            yPercent: 0,
            duration,
          },
          reduceMotion.current ? 0 : 0.06,
        )
        .to(
          nextParts,
          {
            autoAlpha: 1,
            y: 0,
            duration: reduceMotion.current ? 0.01 : 0.5,
            stagger: reduceMotion.current ? 0 : 0.055,
            ease: "power3.out",
          },
          reduceMotion.current ? 0 : 0.27,
        );
    },
  );

  const move = contextSafe((direction: number) => {
    goToChapter(activeIndexRef.current + direction, direction);
  });

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 861px)",
        },
        (context) => {
          const { reduceMotion, desktop } = context.conditions as {
            reduceMotion: boolean;
            desktop: boolean;
          };
          const tags = gsap.utils.toArray<HTMLElement>(".trait-tag");

          gsap.from(tags, {
            autoAlpha: 0,
            y: reduceMotion ? 0 : 24,
            scale: reduceMotion ? 1 : 0.78,
            duration: reduceMotion ? 0.01 : 0.72,
            stagger: reduceMotion ? 0 : 0.08,
            ease: "back.out(1.7)",
          });

          if (!reduceMotion) {
            gsap.to(tags, {
              y: (index) => (index % 2 === 0 ? -12 : 11),
              rotation: (index) => (index % 2 === 0 ? "+=2.5" : "-=2"),
              duration: (index) => 2.8 + (index % 3) * 0.45,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              stagger: { each: desktop ? 0.16 : 0.1, from: "random" },
              delay: 0.85,
            });
          }
        },
      );

      return () => media.revert();
    },
    { scope: sceneRef },
  );

  return (
    <main>
      <section
        className="hero"
        aria-label="Interactive portfolio introduction"
      >
        <header className="site-header">
          <a className="wordmark" href="#top" aria-label="Chunxiang portfolio home">
            CX<span>°</span>
          </a>
          <div className="availability">
            <span />
            SENIOR SOFTWARE ENGINEER · AI & DISTRIBUTED SYSTEMS
          </div>
          <a className="header-link" href="#work">
            CAPABILITIES ↓
          </a>
        </header>

        <div
          className="scene-wrap"
          id="top"
          ref={sceneRef}
          aria-label="Interactive 3D character surrounded by personal and engineering traits"
        >
          <Canvas
            camera={{ position: [0, 0.12, 7.45], fov: 38 }}
            dpr={[1, 1.6]}
            gl={{ antialias: true, alpha: true }}
          >
            <Avatar activeIndex={activeIndex} />
          </Canvas>
          <div className="trait-cloud" aria-label="Personal and engineering traits">
            {traits.map((trait) => (
              <div
                key={trait.label}
                className={`trait-tag ${trait.className}`}
                style={
                  { "--trait-color": trait.color } as React.CSSProperties
                }
              >
                <span>{trait.note}</span>
                <strong>{trait.label}</strong>
              </div>
            ))}
          </div>
          <div className="orbit-line orbit-one" />
          <div className="orbit-line orbit-two" />
        </div>

        <aside
          ref={panelRef}
          className="chapter-panel"
          aria-label="Portfolio chapters. Scroll up or down to navigate."
          aria-live="polite"
          tabIndex={0}
          style={
            { "--active-accent": chapter.accent } as React.CSSProperties
          }
          onWheel={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (isAnimating.current) return;

            wheelDistance.current += event.deltaY;
            if (Math.abs(wheelDistance.current) < 28) return;

            move(wheelDistance.current > 0 ? 1 : -1);
            wheelDistance.current = 0;
          }}
          onTouchStart={(event) => {
            touchStart.current = event.touches[0]?.clientY ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStart.current === null) return;
            const endY =
              event.changedTouches[0]?.clientY ?? touchStart.current;
            const delta = endY - touchStart.current;
            if (Math.abs(delta) > 48) move(delta < 0 ? 1 : -1);
            touchStart.current = null;
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "PageDown") {
              event.preventDefault();
              move(1);
            }
            if (event.key === "ArrowUp" || event.key === "PageUp") {
              event.preventDefault();
              move(-1);
            }
          }}
        >
          <div className="chapter-viewport">
            {chapters.map((item, index) => (
              <div
                key={item.title}
                ref={(node) => {
                  slideRefs.current[index] = node;
                }}
                className="chapter-slide"
                aria-hidden={index !== activeIndex}
              >
                <div className="chapter-topline chapter-anim">
                  <span style={{ color: item.accent }}>{item.kicker}</span>
                  <span>{String(index + 1).padStart(2, "0")} — 04</span>
                </div>
                <div className="chapter-content">
                  <h2 className="chapter-anim">{item.title}</h2>
                  <p className="chapter-statement chapter-anim">
                    {item.statement}
                  </p>
                  <p className="chapter-detail chapter-anim">
                    {item.detail}
                  </p>
                  <div className="meta-row chapter-anim">
                    {item.meta.map((meta) => (
                      <span key={meta}>{meta}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="chapter-gesture">
            <span>SCROLL / SWIPE</span>
            <i />
          </div>
          <div className="panel-controls">
            <button onClick={() => move(-1)} aria-label="Previous portfolio chapter">
              ↑
            </button>
            <div className="progress">
              {chapters.map((item, index) => (
                <button
                  key={item.title}
                  className={index === activeIndex ? "is-active" : ""}
                  onClick={() =>
                    goToChapter(index, index > activeIndexRef.current ? 1 : -1)
                  }
                  aria-label={`Show ${item.title} chapter`}
                />
              ))}
            </div>
            <button onClick={() => move(1)} aria-label="Next portfolio chapter">
              ↓
            </button>
          </div>
        </aside>
      </section>

      <section className="work-section" id="work">
        <div className="section-heading">
          <p>ENGINEERING CAPABILITY MATRIX</p>
          <h2>
            BUILT FOR
            <br />
            <span>production.</span>
          </h2>
        </div>
        <div className="work-grid">
          {work.map((item) => (
            <article key={item.index} className="work-card" style={{ "--card-color": item.color } as React.CSSProperties}>
              <div className="card-index">{item.index}</div>
              <p className="card-type">{item.type}</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="card-stack">
                {item.stack.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
              <span className="card-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <footer id="contact">
        <p>HAVE A SYSTEM THAT NEEDS TO SCALE?</p>
        <h2>LET’S BUILD IT RIGHT.</h2>
        <div className="footer-row">
          <span>CHUNXIANG · SENIOR SOFTWARE ENGINEER</span>
          <span>AI · DISTRIBUTED SYSTEMS · CLOUD</span>
          <a href="#top">BACK TO TOP ↑</a>
        </div>
      </footer>
    </main>
  );
}
