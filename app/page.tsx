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
  "人工智能原生体系",
  "国家级项目",
  "人工智能科研",
  "SOP 工作流",
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
  {
    label: "武汉大学",
    note: "学校",
    className: "trait-one",
    color: "#c7ff4a",
    meaning: "软件工程专业，接受系统的软件工程训练。",
    evidence: "GPA 3.80 / 4.00，专业排名 4 / 25。",
    value: "证明扎实的计算机基础、学习能力与长期稳定投入。",
  },
  {
    label: "已保研",
    note: "学业",
    className: "trait-two",
    color: "#f4d84d",
    meaning: "获得推荐免试研究生资格。",
    evidence: "专业排名 4 / 25，并持续积累科研与工程项目。",
    value: "体现自驱力、研究潜力和对复杂问题的长期专注。",
  },
  {
    label: "人工智能原生工程",
    note: "方法",
    className: "trait-three",
    color: "#8a7dff",
    meaning: "把人工智能嵌入开发全生命周期，而不只是辅助问答。",
    evidence: "使用提示工程、Skill 技能、智能体与 GSD 协同开发。",
    value: "个人项目从开发到部署的周期缩短 40% 以上。",
  },
  {
    label: "全国一等奖队长",
    note: "领导力",
    className: "trait-four",
    color: "#ff704f",
    meaning: "计算机系统能力大赛小米杯全国一等奖团队负责人。",
    evidence: "以队长身份推进方案设计、协作分工与最终交付。",
    value: "验证复杂任务拆解、技术决策和团队推进能力。",
  },
  {
    label: "中级软件设计师",
    note: "认证",
    className: "trait-five",
    color: "#f5f0e7",
    meaning: "通过国家计算机技术与软件专业技术资格考试。",
    evidence: "2024 年取得中级软件设计师资格。",
    value: "软件工程、系统设计与项目管理知识得到标准化验证。",
  },
  {
    label: "全栈闭环交付",
    note: "工作能力",
    className: "trait-six",
    color: "#c7ff4a",
    meaning: "能够从需求、研发、测试到部署独立完成闭环。",
    evidence: "持续维护国家级官网，并独立交付多个个人项目。",
    value: "不止完成代码，还能把产品可靠地交付上线。",
  },
  {
    label: "复杂问题排障",
    note: "工作能力",
    className: "trait-seven",
    color: "#f4d84d",
    meaning: "用证据链定位性能、数据与业务链路问题。",
    evidence: "实践链路日志复核、疑难缺陷定位和 MySQL 慢查治理。",
    value: "快速收敛根因，降低线上风险与接口延迟。",
  },
  {
    label: "SOP 工作流设计",
    note: "工作能力",
    className: "trait-eight",
    color: "#ff704f",
    meaning: "把开发经验沉淀成可重复执行的人机协作流程。",
    evidence: "串联需求澄清、计划、Skill 执行、验证、部署与复盘。",
    value: "让个人效率可复制，让交付质量可检查、可追溯。",
  },
] as const;

const technologyRows = [
  {
    label: "AI 协同开发",
    items: "提示工程 · Skill 技能 · 上下文工程 · 任务拆解 · 代码重构 · 单元测试",
  },
  {
    label: "智能体研发",
    items: "Verl · Tool Agent Loop · 工具调用 · Python Markdown 解析 · Docker 安全沙箱",
  },
  {
    label: "后端与数据",
    items: "Java · Python · C++ · Spring Boot · MySQL · Explain · 锁机制 · 状态机",
  },
  {
    label: "SOP 工作流",
    items: "需求澄清 · 计划拆分 · Skill 执行 · 自动验证 · 部署交付 · 复盘沉淀",
  },
] as const;

const deliverySteps = [
  { index: "01", title: "上下文", text: "读取需求、代码图谱与历史决策" },
  { index: "02", title: "计划", text: "拆分任务并定义验收与风险边界" },
  { index: "03", title: "执行", text: "调用 Skill 与智能体协同开发" },
  { index: "04", title: "验证", text: "单测、页面验收与链路日志复核" },
  { index: "05", title: "交付", text: "完成部署、文档与回滚预案" },
  { index: "06", title: "沉淀", text: "把经验写回 Skill 与可复用 SOP" },
] as const;

type Trait = (typeof traits)[number];

function TraitTag({ trait }: { trait: Trait }) {
  const shell = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLButtonElement>(null);
  const detail = useRef<HTMLDivElement>(null);

  const setExpanded = (expanded: boolean) => {
    if (!shell.current || !card.current || !detail.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.killTweensOf([card.current, detail.current]);
    gsap.set(shell.current, { zIndex: expanded ? 40 : 1 });

    if (expanded) {
      gsap
        .timeline({ defaults: { overwrite: "auto" } })
        .to(
          card.current,
          {
            y: reduced ? 0 : -5,
            scale: reduced ? 1 : 1.055,
            duration: reduced ? 0.01 : 0.22,
            ease: "power2.out",
          },
          0,
        )
        .fromTo(
          detail.current,
          { autoAlpha: 0, y: 12, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: reduced ? 0.01 : 0.28,
            ease: "power3.out",
          },
          reduced ? 0 : 0.04,
        );
      return;
    }

    gsap
      .timeline({ defaults: { overwrite: "auto" } })
      .to(
        detail.current,
        {
          autoAlpha: 0,
          y: 8,
          scale: 0.97,
          duration: reduced ? 0.01 : 0.15,
          ease: "power2.in",
        },
        0,
      )
      .to(
        card.current,
        {
          x: 0,
          y: 0,
          scale: 1,
          rotationX: 0,
          rotationY: 0,
          duration: reduced ? 0.01 : 0.2,
          ease: "power2.out",
        },
        0,
      );
  };

  const followPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!card.current || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    gsap.to(card.current, {
      x: x * 5,
      rotationX: -y * 7,
      rotationY: x * 8,
      duration: 0.2,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  return (
    <div
      ref={shell}
      className={`trait-tag ${trait.className}`}
      style={{ "--trait-color": trait.color } as React.CSSProperties}
    >
      <button
        ref={card}
        type="button"
        className="trait-tag-card"
        aria-label={`${trait.label}：${trait.meaning}`}
        onPointerEnter={() => setExpanded(true)}
        onPointerMove={followPointer}
        onPointerLeave={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
      >
        <span>{trait.note}</span>
        <strong>{trait.label}</strong>
        <div ref={detail} className="trait-detail">
          <small>含义</small>
          <p>{trait.meaning}</p>
          <small>来源</small>
          <p>{trait.evidence}</p>
          <small>含金量</small>
          <p>{trait.value}</p>
        </div>
      </button>
    </div>
  );
}

type AvatarProps = {
  accent: string;
};

function Avatar({ accent }: AvatarProps) {
  const body = useRef<THREE.Group>(null);
  const cursor = useRef({ x: 0, y: 0 });
  const { scene } = useGLTF("/models/chunxiang-avatar.glb");
  const avatar = useMemo(() => scene.clone(true), [scene]);
  const head = useRef<THREE.Group | null>(null);
  const leftEye = useRef<THREE.Group | null>(null);
  const rightEye = useRef<THREE.Group | null>(null);

  useEffect(() => {
    head.current =
      (avatar.getObjectByName("HeadRoot") as THREE.Group | undefined) ?? null;
    leftEye.current =
      (avatar.getObjectByName("LeftEye") as THREE.Group | undefined) ?? null;
    rightEye.current =
      (avatar.getObjectByName("RightEye") as THREE.Group | undefined) ?? null;

    const updateCursor = (event: PointerEvent) => {
      cursor.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      cursor.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", updateCursor, { passive: true });
    return () => window.removeEventListener("pointermove", updateCursor);
  }, [avatar]);

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

    const headObject = head.current;
    if (headObject) {
      headObject.rotation.y = THREE.MathUtils.lerp(
        headObject.rotation.y,
        pointerX * 0.38,
        0.12,
      );
      headObject.rotation.x = THREE.MathUtils.lerp(
        headObject.rotation.x,
        -pointerY * 0.3,
        0.12,
      );
      headObject.rotation.z = THREE.MathUtils.lerp(
        headObject.rotation.z,
        -pointerX * 0.06,
        0.1,
      );
    }

    for (const eye of [leftEye.current, rightEye.current]) {
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
          duration: reduceMotion.current ? 0.01 : 0.68,
          stagger: reduceMotion.current ? 0 : 0.055,
          ease: "power4.out",
        });
      }
    },
    { scope: shellRef },
  );

  const goToSlide = contextSafe(
    // GSAP 仅创建事件回调包装器，不会在渲染阶段读取这些引用。
    // eslint-disable-next-line react-hooks/refs
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
      const duration = reduceMotion.current ? 0.01 : 0.68;
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
        y: reduceMotion.current ? 0 : direction * 50,
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
            y: -direction * 40,
            duration: reduceMotion.current ? 0.01 : 0.36,
            stagger: reduceMotion.current ? 0 : 0.014,
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
            duration: reduceMotion.current ? 0.01 : 0.46,
            stagger: reduceMotion.current ? 0 : 0.04,
            ease: "power4.out",
          },
          reduceMotion.current ? 0 : 0.14,
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
            以 Skill 技能、智能体与 SOP 工作流构建后端系统和可验证的交付闭环。
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
              <TraitTag key={trait.label} trait={trait} />
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
          把需求理解、任务计划、Skill 执行、代码验证与部署复盘串成 SOP，让智能体参与
          脚手架、疑难排障、逻辑重构、单元测试与 API 文档，个人项目周期缩短 40% 以上。
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
        <div className="scene-kicker slide-reveal">03 / 人工智能原生体系</div>
        <h2 className="technology-title slide-reveal">
          人工智能原生的
          <br />
          <em>工程工作系统。</em>
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
        <div className="scene-kicker slide-reveal">06 / SOP 工作流</div>
        <h2 className="delivery-title slide-reveal">
          把一次成功，
          <br />
          <em>变成可复用的 SOP。</em>
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
