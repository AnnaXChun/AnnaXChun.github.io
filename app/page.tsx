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
    kicker: "01 / 职业定位",
    title: "高级开发工程师",
    accent: "#b9ff4f",
    statement:
      "把复杂业务需求，转化为可靠、可演进、能长期维护的软件系统。",
    detail:
      "具备扎实的后端与系统设计能力，也理解产品目标；能够从方案评审、核心开发一路推进到稳定上线。",
    meta: ["后端开发", "系统架构", "产品思维"],
  },
  {
    kicker: "02 / 规模化",
    title: "大规模系统",
    accent: "#ff784f",
    statement:
      "面向高并发场景，设计可观测、可恢复、可预测的服务体系。",
    detail:
      "覆盖服务边界、数据一致性、消息队列、缓存、限流、降级与容量治理，针对规模化运行中的真实故障进行设计。",
    meta: ["微服务", "消息队列与缓存", "性能优化"],
  },
  {
    kicker: "03 / 智能化",
    title: "人工智能工程",
    accent: "#7b75ff",
    statement:
      "把人工智能作为工程能力，而不是停留在演示层。",
    detail:
      "将大语言模型、检索增强生成、工具型智能体、评测体系与辅助开发流程融入产品，并明确质量、延迟和成本边界。",
    meta: ["大语言模型", "智能体", "评测体系"],
  },
  {
    kicker: "04 / 交付",
    title: "交付与带领",
    accent: "#ffda45",
    statement:
      "在持续交付的同时，提高团队的工程质量。",
    detail:
      "通过架构评审、务实规范、自动化交付、可观测性、故障复盘与开发体验建设，推动团队稳定交付耐用的软件。",
    meta: ["云原生", "持续交付", "技术领导力"],
  },
] as const;

const work = [
  {
    index: "01",
    title: "分布式后端",
    type: "系统架构",
    text: "围绕服务边界、数据一致性、异步流程、故障隔离与接口演进，构建可长期维护的后端系统。",
    stack: ["后端语言", "远程调用", "领域驱动设计", "多类型数据库"],
    color: "#b9ff4f",
  },
  {
    index: "02",
    title: "高并发工程",
    type: "性能与稳定性",
    text: "通过缓存、消息队列、背压、限流、性能分析和监控告警，保障高负载下的稳定运行。",
    stack: ["分布式消息", "内存缓存", "异步输入输出", "指标监控"],
    color: "#ff784f",
  },
  {
    index: "03",
    title: "生产级智能应用",
    type: "人工智能工程",
    text: "建设包含检索、工具调用、评测、护栏和链路追踪的智能应用，并控制延迟与成本。",
    stack: ["大语言模型", "检索增强生成", "智能体", "自动化评测"],
    color: "#7b75ff",
  },
  {
    index: "04",
    title: "云端交付",
    type: "平台与研发效能",
    text: "以容器化、自动化质量门禁、渐进式发布和反馈闭环，帮助团队更安全地交付。",
    stack: ["容器编排", "容器化", "持续集成与交付", "可观测性"],
    color: "#ffda45",
  },
] as const;

const traits = [
  { label: "调停者型人格", note: "性格", className: "trait-one", color: "#b9ff4f" },
  { label: "双鱼座", note: "星座", className: "trait-two", color: "#ffda45" },
  { label: "人工智能原生", note: "思维方式", className: "trait-three", color: "#7b75ff" },
  { label: "系统设计", note: "专业能力", className: "trait-four", color: "#ff784f" },
  { label: "实干派", note: "行动风格", className: "trait-five", color: "#f2eee6" },
  { label: "高并发", note: "核心专长", className: "trait-six", color: "#b9ff4f" },
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
        aria-label="互动式个人简历首页"
      >
        <header className="site-header">
          <a className="wordmark" href="#top" aria-label="返回个人简历首页">
            简历<span>°</span>
          </a>
          <div className="availability">
            <span />
            高级软件开发工程师 · 人工智能与分布式系统
          </div>
          <a className="header-link" href="#work">
            核心能力 ↓
          </a>
        </header>

        <div
          className="scene-wrap"
          id="top"
          ref={sceneRef}
          aria-label="被个人特质与工程能力标签环绕的互动三维人物"
        >
          <Canvas
            camera={{ position: [0, 0.12, 7.45], fov: 38 }}
            dpr={[1, 1.6]}
            gl={{ antialias: true, alpha: true }}
          >
            <Avatar activeIndex={activeIndex} />
          </Canvas>
          <div className="trait-cloud" aria-label="个人特质与工程能力">
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
          aria-label="个人能力章节，可上下滚动切换"
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
            <span>滚动 / 滑动</span>
            <i />
          </div>
          <div className="panel-controls">
            <button onClick={() => move(-1)} aria-label="上一项个人能力">
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
                  aria-label={`查看“${item.title}”章节`}
                />
              ))}
            </div>
            <button onClick={() => move(1)} aria-label="下一项个人能力">
              ↓
            </button>
          </div>
        </aside>
      </section>

      <section className="work-section" id="work">
        <div className="section-heading">
          <p>工程能力矩阵</p>
          <h2>
            面向真实
            <br />
            <span>生产环境。</span>
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
        <p>系统需要扩展？</p>
        <h2>把它做对，做稳。</h2>
        <div className="footer-row">
          <span>高级软件开发工程师</span>
          <span>人工智能 · 分布式系统 · 云原生</span>
          <a href="#top">返回顶部 ↑</a>
        </div>
      </footer>
    </main>
  );
}
