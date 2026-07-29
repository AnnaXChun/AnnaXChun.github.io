"use client";

import { useGSAP } from "@gsap/react";
import { ContactShadows, Float, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

gsap.registerPlugin(useGSAP, Observer);

const slideLabels = [
  "个人定位",
  "工程实践",
  "技术体系",
  "国家级项目",
  "人工智能科研",
  "交付方法",
  "教育荣誉",
] as const;

const slideAccents = [
  "#c7ff4a",
  "#ff6b49",
  "#f4d84d",
  "#ff704f",
  "#8a7dff",
  "#c7ff4a",
  "#8a7dff",
] as const;

const traits = [
  { label: "武汉大学", note: "学校", className: "trait-one", color: "#c7ff4a" },
  { label: "已保研", note: "状态", className: "trait-two", color: "#f4d84d" },
  { label: "人工智能原生", note: "方法", className: "trait-three", color: "#8a7dff" },
  { label: "全国一等奖队长", note: "竞赛", className: "trait-four", color: "#ff704f" },
  { label: "中级软件设计师", note: "认证", className: "trait-five", color: "#f5f0e7" },
] as const;

const technologyRows = [
  {
    label: "后端工程",
    items: "Java · Python · C++ · Spring Boot · ThinkPHP · RESTful API",
  },
  {
    label: "数据与并发",
    items: "MySQL · Explain · 联合索引 · 慢查询治理 · 锁机制 · 状态机",
  },
  {
    label: "智能体工程",
    items: "Verl · SFT · GRPO · Agent Loop · Tool Calling · Prompt Engineering",
  },
  {
    label: "前端与交付",
    items: "Vue 3 · Docker · CI/CD · 自动化测试 · 代码审查 · API 文档",
  },
] as const;

const deliverySteps = [
  { index: "01", title: "评审", text: "澄清业务目标与需求边界" },
  { index: "02", title: "设计", text: "完成技术方案与数据库表结构" },
  { index: "03", title: "研发", text: "独立实现 RESTful API 与业务模块" },
  { index: "04", title: "联调", text: "覆盖接口测试、自动化测试与代码审查" },
  { index: "05", title: "上线", text: "完成部署、验证与持续交付" },
  { index: "06", title: "治理", text: "用 Explain 和索引优化治理慢查询" },
] as const;

type AvatarProps = {
  accent: string;
};

function Avatar({ accent }: AvatarProps) {
  const body = useRef<THREE.Group>(null);
  const cursor = useRef({ x: 0, y: 0 });
  const { scene } = useGLTF("/models/chunxiang-avatar.glb");
  const avatar = useMemo(() => scene.clone(true), [scene]);
  const head = useMemo(
    () => avatar.getObjectByName("HeadRoot") as THREE.Group | undefined,
    [avatar],
  );
  const leftEye = useMemo(
    () => avatar.getObjectByName("LeftEye") as THREE.Group | undefined,
    [avatar],
  );
  const rightEye = useMemo(
    () => avatar.getObjectByName("RightEye") as THREE.Group | undefined,
    [avatar],
  );

  useEffect(() => {
    const updateCursor = (event: PointerEvent) => {
      cursor.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      cursor.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", updateCursor, { passive: true });
    return () => window.removeEventListener("pointermove", updateCursor);
  }, []);

  useFrame((state) => {
    const pointerX = cursor.current.x;
    const pointerY = cursor.current.y;

    if (body.current) {
      const idle = Math.sin(state.clock.elapsedTime * 1.2);
      body.current.rotation.y = THREE.MathUtils.lerp(
        body.current.rotation.y,
        -0.04 + pointerX * 0.28,
        0.075,
      );
      body.current.rotation.x = THREE.MathUtils.lerp(
        body.current.rotation.x,
        -pointerY * 0.12,
        0.075,
      );
      body.current.rotation.z = THREE.MathUtils.lerp(
        body.current.rotation.z,
        -pointerX * 0.045 + idle * 0.008,
        0.06,
      );
      body.current.position.x = THREE.MathUtils.lerp(
        body.current.position.x,
        pointerX * 0.12,
        0.06,
      );
      body.current.position.y = THREE.MathUtils.lerp(
        body.current.position.y,
        -0.02 + pointerY * 0.05,
        0.06,
      );
    }

    if (head) {
      head.rotation.y = THREE.MathUtils.lerp(
        head.rotation.y,
        pointerX * 0.38,
        0.12,
      );
      head.rotation.x = THREE.MathUtils.lerp(
        head.rotation.x,
        -pointerY * 0.3,
        0.12,
      );
      head.rotation.z = THREE.MathUtils.lerp(
        head.rotation.z,
        -pointerX * 0.06,
        0.1,
      );
    }

    for (const eye of [leftEye, rightEye]) {
      if (!eye) continue;
      eye.rotation.y = THREE.MathUtils.lerp(
        eye.rotation.y,
        pointerX * 0.28,
        0.2,
      );
      eye.rotation.x = THREE.MathUtils.lerp(
        eye.rotation.x,
        -pointerY * 0.22,
        0.2,
      );
    }
  });

  return (
    <>
      <ambientLight intensity={1.35} />
      <directionalLight position={[4, 6, 5]} intensity={3.6} color="#fff6e7" />
      <pointLight position={[-4, 1.5, 3]} intensity={18} color="#6f7dff" />
      <pointLight position={[4, -0.5, 2]} intensity={12} color="#c7ff4a" />

      <Float speed={1.25} rotationIntensity={0.07} floatIntensity={0.22}>
        <group
          ref={body}
          position={[0, -0.02, 0]}
          rotation={[0, -0.04, 0]}
          scale={0.74}
        >
          <primitive object={avatar} />
        </group>
      </Float>

      <mesh position={[0, -1.86, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.45, 0.035, 16, 90]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.42} />
      </mesh>
      <ContactShadows
        position={[0, -1.85, 0]}
        opacity={0.42}
        scale={7}
        blur={2.5}
        far={4.5}
        color="#17161d"
      />
    </>
  );
}

useGLTF.preload("/models/chunxiang-avatar.glb");

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const shellRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const activeSlideRef = useRef(0);
  const animating = useRef(false);
  const reduceMotion = useRef(false);

  const { contextSafe } = useGSAP(
    () => {
      reduceMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      slideRefs.current.forEach((slide, index) => {
        if (!slide) return;
        gsap.set(slide, {
          autoAlpha: index === 0 ? 1 : 0,
          clipPath:
            index === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
          zIndex: index === 0 ? 2 : 0,
        });
      });

      const firstParts =
        slideRefs.current[0]?.querySelectorAll(".slide-reveal");
      if (firstParts) {
        gsap.from(firstParts, {
          autoAlpha: 0,
          y: reduceMotion.current ? 0 : 46,
          duration: reduceMotion.current ? 0.01 : 0.9,
          stagger: reduceMotion.current ? 0 : 0.08,
          ease: "power4.out",
        });
      }
    },
    { scope: shellRef },
  );

  const goToSlide = contextSafe(
    (requestedIndex: number, directionHint?: number) => {
      if (animating.current) return;

      const total = slideLabels.length;
      const nextIndex = (requestedIndex + total) % total;
      const currentIndex = activeSlideRef.current;
      if (nextIndex === currentIndex) return;

      const currentSlide = slideRefs.current[currentIndex];
      const nextSlide = slideRefs.current[nextIndex];
      if (!currentSlide || !nextSlide) return;

      const direction =
        directionHint ?? (nextIndex > currentIndex ? 1 : -1);
      const duration = reduceMotion.current ? 0.01 : 1.05;
      const currentParts = currentSlide.querySelectorAll(".slide-reveal");
      const nextParts = nextSlide.querySelectorAll(".slide-reveal");
      const closedClip =
        direction > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)";

      animating.current = true;
      activeSlideRef.current = nextIndex;
      setActiveSlide(nextIndex);

      gsap.set(nextSlide, {
        autoAlpha: 1,
        clipPath: closedClip,
        zIndex: 3,
        scale: 1,
      });
      gsap.set(nextParts, {
        autoAlpha: reduceMotion.current ? 1 : 0,
        y: reduceMotion.current ? 0 : direction * 70,
      });

      gsap
        .timeline({
          defaults: { ease: "power4.inOut", overwrite: "auto" },
          onComplete: () => {
            gsap.set(currentSlide, {
              autoAlpha: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              zIndex: 0,
            });
            gsap.set(currentParts, { autoAlpha: 1, y: 0 });
            gsap.set(nextSlide, { zIndex: 2 });
            animating.current = false;
          },
        })
        .to(
          currentParts,
          {
            autoAlpha: 0.18,
            y: -direction * 54,
            duration: reduceMotion.current ? 0.01 : 0.65,
            stagger: reduceMotion.current ? 0 : 0.02,
          },
          0,
        )
        .to(
          currentSlide,
          { scale: reduceMotion.current ? 1 : 0.94, duration },
          0,
        )
        .to(
          nextSlide,
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration,
          },
          0,
        )
        .to(
          nextParts,
          {
            autoAlpha: 1,
            y: 0,
            duration: reduceMotion.current ? 0.01 : 0.72,
            stagger: reduceMotion.current ? 0 : 0.065,
            ease: "power4.out",
          },
          reduceMotion.current ? 0 : 0.32,
        );
    },
  );

  useGSAP(
    () => {
      const observer = Observer.create({
        target: shellRef.current,
        type: "wheel,touch",
        wheelSpeed: -1,
        tolerance: 24,
        preventDefault: true,
        onUp: () => goToSlide(activeSlideRef.current + 1, 1),
        onDown: () => goToSlide(activeSlideRef.current - 1, -1),
      });

      return () => observer.kill();
    },
    { scope: shellRef },
  );

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const tags = gsap.utils.toArray<HTMLElement>(".trait-tag");
        gsap.from(tags, {
          autoAlpha: 0,
          y: 28,
          scale: 0.82,
          duration: 0.75,
          stagger: 0.08,
          ease: "back.out(1.8)",
        });
        gsap.to(tags, {
          y: (index) => (index % 2 === 0 ? -12 : 12),
          rotation: (index) => (index % 2 === 0 ? "+=2" : "-=2"),
          duration: (index) => 3 + (index % 3) * 0.45,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: { each: 0.15, from: "random" },
          delay: 0.9,
        });
      });

      return () => media.revert();
    },
    { scope: sceneRef },
  );

  const move = (direction: number) => {
    goToSlide(activeSlideRef.current + direction, direction);
  };

  return (
    <main
      ref={shellRef}
      className="resume-shell"
      aria-label="高级软件开发工程师沉浸式个人简历"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === "ArrowDown" ||
          event.key === "PageDown" ||
          event.key === " "
        ) {
          event.preventDefault();
          move(1);
        }
        if (event.key === "ArrowUp" || event.key === "PageUp") {
          event.preventDefault();
          move(-1);
        }
        if (event.key === "Home") {
          event.preventDefault();
          goToSlide(0, -1);
        }
        if (event.key === "End") {
          event.preventDefault();
          goToSlide(slideLabels.length - 1, 1);
        }
      }}
    >
      <header
        className={`global-header ${
          activeSlide === 1 || activeSlide === 6 ? "is-light" : ""
        }`}
      >
        <button
          className="wordmark"
          onClick={() => goToSlide(0, -1)}
          aria-label="返回第一屏"
        >
          椿襄<span>°</span>
        </button>
        <div className="global-role">高级软件开发工程师 · 人工智能与分布式系统</div>
        <div className="global-count" aria-live="polite">
          {String(activeSlide + 1).padStart(2, "0")}
          <span>/</span>
          {String(slideLabels.length).padStart(2, "0")}
        </div>
      </header>

      <section
        ref={(node) => {
          slideRefs.current[0] = node;
        }}
        className="resume-slide hero-slide"
        aria-hidden={activeSlide !== 0}
      >
        <div className="hero-word slide-reveal" aria-hidden="true">
          高级
          <br />
          工程师
        </div>
        <div className="hero-intro slide-reveal">
          <span>椿襄 / 武汉大学软件工程 · 已保研</span>
          <h1>
            让复杂系统
            <br />
            <em>可靠地运行。</em>
          </h1>
          <p>
            用人工智能原生方法构建后端系统、智能体应用与完整交付闭环。
          </p>
        </div>

        <div
          className="hero-stage"
          ref={sceneRef}
          aria-label="眼神跟随光标的互动三维人物"
        >
          <Canvas
            camera={{ position: [0, 0.05, 7.25], fov: 36 }}
            dpr={[1, 1.6]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <Avatar accent={slideAccents[0]} />
            </Suspense>
          </Canvas>
          <div className="trait-cloud" aria-label="个人特质">
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
        </div>

        <div className="hero-foot slide-reveal">
          <span>武汉大学</span>
          <span>GPA 3.80 / 4.00</span>
          <span>专业排名 4 / 25</span>
        </div>
      </section>

      <section
        ref={(node) => {
          slideRefs.current[1] = node;
        }}
        className="resume-slide manifesto-slide"
        aria-hidden={activeSlide !== 1}
      >
        <div className="manifesto-orb" aria-hidden="true" />
        <div className="scene-kicker slide-reveal">02 / 工程实践</div>
        <h2 className="manifesto-title slide-reveal">
          从代码实现。
          <br />
          <em>到价值交付。</em>
        </h2>
        <p className="manifesto-copy slide-reveal">
          贯彻 GSD 工程实践，把人工智能用于脚手架、疑难排障、逻辑重构、单元测试与 API
          文档，让个人项目从开发到部署的周期缩短 40% 以上。
        </p>
        <div className="manifesto-principles slide-reveal">
          <span>
            <b>01</b>
            <strong>闭环</strong>
            从想法到部署
          </span>
          <span>
            <b>02</b>
            <strong>排障</strong>
            从日志到根因
          </span>
          <span>
            <b>03</b>
            <strong>效率</strong>
            人机协同交付
          </span>
        </div>
      </section>

      <section
        ref={(node) => {
          slideRefs.current[2] = node;
        }}
        className="resume-slide technology-slide"
        aria-hidden={activeSlide !== 2}
      >
        <div className="scene-kicker slide-reveal">03 / 技术体系</div>
        <h2 className="technology-title slide-reveal">
          真实项目的
          <br />
          <em>工程工具链。</em>
        </h2>
        <div className="technology-rows">
          {technologyRows.map((row, index) => (
            <div
              className="technology-row slide-reveal"
              key={row.label}
              style={{ "--row-index": index } as React.CSSProperties}
            >
              <span>{row.label}</span>
              <strong>{row.items}</strong>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={(node) => {
          slideRefs.current[3] = node;
        }}
        className="resume-slide concurrency-slide"
        aria-hidden={activeSlide !== 3}
      >
        <div className="scene-kicker slide-reveal">04 / 国家级项目</div>
        <div className="case-number slide-reveal">2年+</div>
        <div className="case-copy slide-reveal">
          <span>中帆协官网开发及维护</span>
          <h2>支付链路稳定性</h2>
          <p>
            以 ThinkPHP 与 Vue 3 持续迭代官网，接入支付宝和微信支付，并通过锁机制、状态机与
            Spring Boot 熔断机制保障关键链路稳定。
          </p>
        </div>
        <div className="case-metrics slide-reveal">
          <span>
            <strong>支付安全</strong>
            锁机制与状态机
          </span>
          <span>
            <strong>熔断降压</strong>
            高并发场景稳定运行
          </span>
          <span>
            <strong>持续交付</strong>
            自动化测试与代码审查
          </span>
        </div>
        <div className="case-stack slide-reveal">
          ThinkPHP · Vue 3 · Spring Boot · 支付宝 / 微信支付 · CI/CD
        </div>
      </section>

      <section
        ref={(node) => {
          slideRefs.current[4] = node;
        }}
        className="resume-slide intelligence-slide"
        aria-hidden={activeSlide !== 4}
      >
        <div className="scene-kicker slide-reveal">05 / 人工智能科研</div>
        <div className="intelligence-copy slide-reveal">
          <span>生命科学推理增强型 Agent</span>
          <h2>
            重构工具调用，
            <br />
            <em>训练垂直推理。</em>
          </h2>
          <p>
            基于 Verl 二次开发并重写 tool agent loop，自动识别 Python Markdown
            代码块并触发工具调用；以 SFT 与 GRPO 联合训练增强多步推理能力。
          </p>
        </div>
        <div className="ai-orbit slide-reveal" aria-label="人工智能科研方法">
          <div className="orbit-ring ring-a" />
          <div className="orbit-ring ring-b" />
          <strong>SFT</strong>
          <span>与 GRPO 联合训练</span>
          <i className="ai-node node-one">Verl</i>
          <i className="ai-node node-two">工具调用</i>
          <i className="ai-node node-three">Docker</i>
          <i className="ai-node node-four">生命科学</i>
        </div>
        <div className="intelligence-stack slide-reveal">
          Verl · Tool Agent Loop · Python Markdown · SFT · GRPO · Docker 安全沙箱
        </div>
      </section>

      <section
        ref={(node) => {
          slideRefs.current[5] = node;
        }}
        className="resume-slide delivery-slide"
        aria-hidden={activeSlide !== 5}
      >
        <div className="scene-kicker slide-reveal">06 / 交付方法</div>
        <h2 className="delivery-title slide-reveal">
          从需求评审，
          <br />
          <em>到上线与慢查治理。</em>
        </h2>
        <div className="delivery-track slide-reveal">
          {deliverySteps.map((step) => (
            <div key={step.index}>
              <span>{step.index}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={(node) => {
          slideRefs.current[6] = node;
        }}
        className="resume-slide final-slide"
        aria-hidden={activeSlide !== 6}
      >
        <div className="scene-kicker slide-reveal">07 / 教育与荣誉</div>
        <h2 className="final-title slide-reveal">
          用真实成果
          <br />
          <em>证明能力。</em>
        </h2>
        <p className="final-copy slide-reveal">
          武汉大学软件工程 · GPA 3.80 / 4.00 · 专业排名 4 / 25 · 已保研
          <br />
          拥有后端实习、国家级项目负责人和人工智能科研经历。
        </p>
        <div className="final-contact slide-reveal">
          <span>
            <b>实践经历</b>
            泰康科技后端实习 · 中帆协国家级项目
          </span>
          <span>
            <b>代表荣誉</b>
            小米杯全国一等奖（队长）· 美赛 F 奖
          </span>
          <span>
            <b>联系邮箱</b>
            mshuwhu@whu.edu.cn
          </span>
        </div>
        <div className="final-signature slide-reveal">椿襄 · 软件工程 · 已保研</div>
      </section>

      <nav
        className={`scene-nav ${
          activeSlide === 1 || activeSlide === 6 ? "is-light" : ""
        }`}
        aria-label="场景导航"
      >
        {slideLabels.map((label, index) => (
          <button
            key={label}
            className={index === activeSlide ? "is-active" : ""}
            onClick={() =>
              goToSlide(index, index > activeSlideRef.current ? 1 : -1)
            }
            aria-label={`查看“${label}”`}
          >
            <i />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div
        className={`scene-actions ${
          activeSlide === 1 || activeSlide === 6 ? "is-light" : ""
        }`}
      >
        <button onClick={() => move(-1)} aria-label="上一屏">
          ↑
        </button>
        <span>{slideLabels[activeSlide]}</span>
        <button onClick={() => move(1)} aria-label="下一屏">
          ↓
        </button>
      </div>
    </main>
  );
}
