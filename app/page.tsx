"use client";

import { useGSAP } from "@gsap/react";
import { ContactShadows, Float, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

gsap.registerPlugin(useGSAP, Observer, ScrollTrigger);

const slideLabels = [
  "个人定位",
  "工程实践",
  "人工智能原生体系",
  "国家级项目",
  "人工智能科研",
  "SOP 工作流",
  "证书画廊",
  "履历成果",
] as const;

const slideAccents = [
  "#b8d97c",
  "#d97a64",
  "#c9ae67",
  "#d97a64",
  "#8f86c8",
  "#b8d97c",
  "#caa66b",
  "#8f86c8",
] as const;

const traits = [
  {
    label: "ENFP",
    note: "主动连接",
    className: "trait-one",
    color: "#b8d97c",
    meaning: "外向不是热闹，而是愿意主动建立连接，让陌生协作快速进入正题。",
    evidence: "组队时先说清每个人擅长的部分，再把讨论整理成可以行动的计划。",
    value: "适合需要跨角色沟通、快速试错和持续推进的团队环境。",
  },
  {
    label: "羽毛球",
    note: "预判与节奏",
    className: "trait-two",
    color: "#d8b66e",
    meaning: "我喜欢它几乎没有延迟的反馈，判断来球、调整步伐，下一拍立刻验证。",
    evidence: "享受单打的节奏控制，也重视双打里的补位、喊球和默契。",
    value: "让我先读局面再出手，也提醒我任何决策都要为下一拍留位置。",
  },
  {
    label: "高并发后端",
    note: "工程能力",
    className: "trait-three",
    color: "#9c8fd4",
    meaning: "围绕高流量场景设计稳定的接口、数据与降级策略。",
    evidence: "实践锁机制、状态机、熔断、MySQL 索引与慢查询治理。",
    value: "保障关键链路在并发压力下保持一致性和可用性。",
  },
  {
    label: "视频剪辑",
    note: "叙事与取舍",
    className: "trait-four",
    color: "#e47e6b",
    meaning: "剪辑不是堆素材，而是决定观众此刻应该看到什么。",
    evidence: "从素材筛选、节奏点和音乐到字幕，把零散片段整理成有落点的叙事。",
    value: "它直接影响我做演示、写文档和设计产品反馈的方式。",
  },
  {
    label: "Codex / Claude Code",
    note: "人工智能协作",
    className: "trait-five",
    color: "#69b7c8",
    meaning: "把人工智能编程工具当成工程协作者，而不是代码补全器。",
    evidence: "用于代码理解、方案拆分、重构、测试、排障、视觉验收与部署交付。",
    value: "缩短反馈链路，同时保留测试、审查和结果验证。",
  },
  {
    label: "健身",
    note: "长期状态",
    className: "trait-six",
    color: "#d69a63",
    meaning: "训练不是证明意志力，而是管理动作质量、恢复和长期状态。",
    evidence: "会根据当天状态调整重量与组数，优先保证动作完成度。",
    value: "不靠短期透支，保持稳定且可持续的工作输出。",
  },
  {
    label: "复杂问题排障",
    note: "工作能力",
    className: "trait-seven",
    color: "#c9ae67",
    meaning: "用证据链定位性能、数据与业务链路问题。",
    evidence: "实践链路日志复核、疑难缺陷定位和 MySQL 慢查治理。",
    value: "快速收敛根因，降低线上风险与接口延迟。",
  },
  {
    label: "SOP 工作流设计",
    note: "工作能力",
    className: "trait-eight",
    color: "#d97a64",
    meaning: "把开发经验沉淀成可重复执行的人机协作流程。",
    evidence: "串联需求澄清、计划、Skill 执行、验证、部署与复盘。",
    value: "让个人效率可复制，让交付质量可检查、可追溯。",
  },
] as const;

const technologyRows = [
  {
    label: "人工智能协同",
    items: "Codex、Claude Code、Gemini、Skill 技能、上下文工程、GSD",
  },
  {
    label: "智能体研发",
    items: "LangChain、Llama、Verl、Agent Loop、工具调用、Docker 安全沙箱",
  },
  {
    label: "后端与数据",
    items: "Java、Python、C++、Spring Boot、MySQL、Explain、锁机制、状态机",
  },
  {
    label: "SOP 工作流",
    items: "需求澄清、计划拆分、Skill 执行、自动验证、部署交付、复盘沉淀",
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

const certificates = [
  {
    title: "小米杯全国一等奖",
    meta: "队长 · 2025",
    image: "/certificates/xiaomi-2025-first.webp",
    description: "全国大学生计算机系统能力大赛智能系统创新设计赛，DeepDog 项目。",
  },
  {
    title: "发明专利申请受理",
    meta: "国家知识产权局 · 2025",
    image: "/certificates/patent-acceptance.webp",
    description: "非接触式货币真伪检测方法、系统、装置及存储介质。",
  },
  {
    title: "MobiCom 论文成果",
    meta: "CCF-A · 学术研究",
    image: "/certificates/mobicom-paper.webp",
    description: "基于眨眼运动学与临床知识蒸馏的居家干眼评估研究。",
  },
  {
    title: "数学建模竞赛 Finalist",
    meta: "MCM · 2025",
    image: "/certificates/mcm-finalist.webp",
    description: "美国大学生数学建模竞赛 Finalist，完成复杂问题建模与协作交付。",
  },
  {
    title: "计算机设计大赛一等奖",
    meta: "中南地区赛 · 2025",
    image: "/certificates/design-digital-twin-first.webp",
    description: "虚实智联：基于数字孪生的三维人体重建系统。",
  },
  {
    title: "计算机设计大赛二等奖",
    meta: "中南地区赛 · 2025",
    image: "/certificates/design-poetry-second.webp",
    description: "诗品：人工智能诗词创作助手。",
  },
  {
    title: "PolarDB 外卡优胜奖",
    meta: "数据库创新设计赛 · 2024",
    image: "/certificates/polardb-award.webp",
    description: "全国大学生计算机系统能力大赛 PolarDB 数据库创新设计赛。",
  },
  {
    title: "小米杯全国三等奖",
    meta: "智能系统创新设计赛 · 2024",
    image: "/certificates/xiaomi-2024-third.webp",
    description: "全国大学生计算机系统能力大赛，持续积累智能系统工程经验。",
  },
] as const;

type Certificate = (typeof certificates)[number];
const CERTIFICATE_CYCLE_COUNT = 3;

function CertificateCard({
  certificate,
  interactive = true,
}: {
  certificate: Certificate;
  interactive?: boolean;
}) {
  const card = useRef<HTMLElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const rule = useRef<HTMLSpanElement>(null);

  const setFocused = (focused: boolean) => {
    if (!card.current || !image.current || !overlay.current || !rule.current) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.killTweensOf([card.current, image.current, overlay.current, rule.current]);
    gsap.to(card.current, {
      y: focused && !reduced ? -12 : 0,
      scale: focused && !reduced ? 1.025 : 1,
      duration: reduced ? 0.01 : 0.32,
      ease: "power3.out",
      overwrite: "auto",
    });
    gsap.to(image.current, {
      scale: focused && !reduced ? 1.045 : 1,
      duration: reduced ? 0.01 : 0.48,
      ease: "power3.out",
      overwrite: "auto",
    });
    gsap.to(overlay.current, {
      autoAlpha: focused ? 1 : 0,
      y: focused || reduced ? 0 : 14,
      duration: reduced ? 0.01 : 0.28,
      ease: focused ? "power3.out" : "power2.in",
      overwrite: "auto",
    });
    gsap.to(rule.current, {
      scaleX: focused ? 1 : 0.18,
      duration: reduced ? 0.01 : 0.34,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  return (
    <article
      ref={card}
      className="certificate-card"
      tabIndex={interactive ? 0 : -1}
      aria-hidden={interactive ? undefined : true}
      aria-label={`${certificate.title}，${certificate.meta}`}
      onPointerEnter={() => setFocused(true)}
      onPointerLeave={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div className="certificate-media">
        {/* eslint-disable-next-line @next/next/no-img-element -- 证书已预压缩为本地 WebP，保留原生图片以避免画廊滑动时额外的图片布局包装。 */}
        <img
          ref={image}
          src={certificate.image}
          alt={certificate.title}
          loading="lazy"
          decoding="async"
        />
        <div ref={overlay} className="certificate-overlay">
          <span>成果说明</span>
          <p>{certificate.description}</p>
        </div>
      </div>
      <footer>
        <div>
          <small>{certificate.meta}</small>
          <h3>{certificate.title}</h3>
        </div>
      </footer>
      <span ref={rule} className="certificate-rule" aria-hidden="true" />
    </article>
  );
}

function CertificateGallery({ onExit }: { onExit: () => void }) {
  const viewport = useRef<HTMLDivElement>(null);
  const cycleWidth = useRef(0);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    let scrollFrame = 0;

    const measureCycle = () => {
      const cards = element.querySelectorAll<HTMLElement>(".certificate-card");
      if (cards.length < certificates.length * 2) return 0;
      return cards[certificates.length].offsetLeft - cards[0].offsetLeft;
    };

    const placeInMiddleCycle = (preserveProgress = false) => {
      const previousWidth = cycleWidth.current;
      const previousProgress =
        preserveProgress && previousWidth > 0
          ? (element.scrollLeft - previousWidth) / previousWidth
          : 0;
      const measuredWidth = measureCycle();
      if (!measuredWidth) return;

      cycleWidth.current = measuredWidth;
      element.scrollLeft =
        measuredWidth + (preserveProgress ? previousProgress * measuredWidth : 0);
    };

    const normalizeScroll = () => {
      const width = cycleWidth.current;
      if (!width) return;

      if (element.scrollLeft < width * 0.75) {
        element.scrollLeft += width;
      } else if (element.scrollLeft > width * 2.25) {
        element.scrollLeft -= width;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(normalizeScroll);
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      event.stopPropagation();
      element.scrollLeft += event.deltaY * 1.05;
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => placeInMiddleCycle(true));
    });

    requestAnimationFrame(() => placeInMiddleCycle());
    element.addEventListener("scroll", onScroll, { passive: true });
    element.addEventListener("wheel", onWheel, { passive: false });
    resizeObserver.observe(element);

    return () => {
      cancelAnimationFrame(scrollFrame);
      resizeObserver.disconnect();
      element.removeEventListener("scroll", onScroll);
      element.removeEventListener("wheel", onWheel);
      gsap.killTweensOf(element);
    };
  }, []);

  const scrollGallery = (direction: number) => {
    const element = viewport.current;
    if (!element) return;
    const width = cycleWidth.current;
    if (!width) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const distance = Math.min(element.clientWidth * 0.72, width * 0.42);
    let start = element.scrollLeft;

    if (direction > 0 && start + distance > width * 2.1) {
      start -= width;
      element.scrollLeft = start;
    } else if (direction < 0 && start - distance < width * 0.9) {
      start += width;
      element.scrollLeft = start;
    }

    gsap.to(element, {
      scrollLeft: start + direction * distance,
      duration: reduced ? 0.01 : 0.65,
      ease: "power3.inOut",
      overwrite: "auto",
    });
  };

  return (
    <>
      <div className="certificate-controls slide-reveal">
        <span>滚轮或拖动，循环浏览</span>
        <button onClick={() => scrollGallery(-1)} aria-label="向左浏览证书">
          ←
        </button>
        <button onClick={() => scrollGallery(1)} aria-label="向右浏览证书">
          →
        </button>
        <button
          className="certificate-exit"
          onClick={onExit}
          aria-label="离开证书画廊并查看下一屏"
        >
          下一屏&nbsp; ↓
        </button>
      </div>
      <div
        ref={viewport}
        className="certificate-gallery slide-reveal"
        aria-label="证书与成果横向画廊"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            event.stopPropagation();
            scrollGallery(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        <div className="certificate-track">
          {Array.from({ length: CERTIFICATE_CYCLE_COUNT }, (_, cycle) =>
            certificates.map((certificate) => (
              <CertificateCard
                key={`${cycle}-${certificate.title}`}
                certificate={certificate}
                interactive={cycle === 1}
              />
            )),
          )}
        </div>
      </div>
    </>
  );
}

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

const openingWorks = [
  { title: "智能体工作流", meta: "工具调用 / SOP" },
  { title: "羽毛球", meta: "预判 / 节奏" },
  { title: "支付链路", meta: "高并发 / 状态机" },
  { title: "视频剪辑", meta: "镜头 / 叙事" },
  { title: "ENFP", meta: "连接 / 好奇" },
  { title: "力量训练", meta: "状态 / 坚持" },
] as const;

function OpeningSequence({ onComplete }: { onComplete: () => void }) {
  const root = useRef<HTMLElement>(null);
  const revealTimeline = useRef<gsap.core.Timeline | null>(null);
  const idleTimeline = useRef<gsap.core.Timeline | null>(null);
  const enterTimeline = useRef<gsap.core.Timeline | null>(null);
  const enterHandler = useRef<() => void>(() => undefined);
  const ready = useRef(false);
  const entering = useRef(false);
  const completed = useRef(false);
  const [sceneReady, setSceneReady] = useState(false);

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    onComplete();
  };

  useGSAP(
    (_context, contextSafe) => {
      const container = root.current;
      const television = container?.querySelector<HTMLElement>(".opening-tv");
      const world = container?.querySelector<HTMLElement>(".opening-world");
      const works = container?.querySelector<HTMLElement>(".opening-works");
      const grid = container?.querySelector<HTMLElement>(".opening-grid");
      if (!container || !television || !world || !works || !grid) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const televisionBounds = television.getBoundingClientRect();
      const coverScale =
        Math.max(
          window.innerWidth / Math.max(televisionBounds.width * 0.72, 1),
          window.innerHeight / Math.max(televisionBounds.height * 0.58, 1),
        ) * 1.28;

      const markReady = () => {
        if (entering.current || completed.current) return;
        ready.current = true;
        setSceneReady(true);

        idleTimeline.current?.kill();
        idleTimeline.current = gsap
          .timeline({ repeat: -1, yoyo: true })
          .to(television, {
            y: -10,
            duration: 3.4,
            ease: "sine.inOut",
          })
          .to(
            ".opening-work:nth-child(odd)",
            { y: "-=7", duration: 3.1, ease: "sine.inOut" },
            0,
          )
          .to(
            ".opening-work:nth-child(even)",
            { y: "+=6", duration: 3.6, ease: "sine.inOut" },
            0,
          );
      };

      const playEnter = contextSafe(() => {
        if (entering.current || completed.current) return;

        if (!ready.current && revealTimeline.current) {
          revealTimeline.current.progress(1);
        }

        entering.current = true;
        ready.current = false;
        setSceneReady(false);
        revealTimeline.current?.kill();
        idleTimeline.current?.kill();
        gsap.killTweensOf([world, works, television, grid]);

        enterTimeline.current?.kill();
        enterTimeline.current = gsap.timeline({ onComplete: finish });

        enterTimeline.current
          .to(
            ".opening-enter, .opening-caption, .opening-hud",
            { autoAlpha: 0, duration: 0.32, ease: "power2.in" },
            0,
          )
          .to(
            ".opening-work",
            {
              autoAlpha: 0,
              scale: 0.7,
              z: -360,
              duration: 0.65,
              stagger: { amount: 0.22, from: "edges" },
              ease: "power3.in",
            },
            0.08,
          )
          .to(
            world,
            {
              rotationX: 0,
              rotationY: 0,
              x: 0,
              y: 0,
              duration: 0.52,
              ease: "power3.inOut",
            },
            0,
          )
          .to(
            television,
            {
              rotationX: 0,
              rotationY: 0,
              y: 0,
              scale: 1.08,
              duration: 0.58,
              ease: "power3.inOut",
            },
            0.06,
          )
          .to(television, {
            scale: coverScale,
            z: 360,
            duration: 1.22,
            ease: "expo.in",
          })
          .to(
            ".opening-screen-content",
            { autoAlpha: 0, duration: 0.24, ease: "power2.in" },
            "<+=0.58",
          )
          .to(
            ".opening-flash",
            { autoAlpha: 1, duration: 0.34, ease: "power2.in" },
            "<+=0.1",
          )
          .to(container, {
            autoAlpha: 0,
            duration: 0.32,
            ease: "power1.out",
          });
      });

      enterHandler.current = playEnter;

      const rotateXTo = gsap.quickTo(world, "rotationX", {
        duration: 0.72,
        ease: "power3.out",
      });
      const rotateYTo = gsap.quickTo(world, "rotationY", {
        duration: 0.72,
        ease: "power3.out",
      });
      const worksXTo = gsap.quickTo(works, "x", {
        duration: 0.82,
        ease: "power3.out",
      });
      const worksYTo = gsap.quickTo(works, "y", {
        duration: 0.82,
        ease: "power3.out",
      });
      const gridXTo = gsap.quickTo(grid, "x", {
        duration: 0.95,
        ease: "power2.out",
      });
      const gridYTo = gsap.quickTo(grid, "y", {
        duration: 0.95,
        ease: "power2.out",
      });

      const resetView = () => {
        if (entering.current) return;
        rotateXTo(0);
        rotateYTo(0);
        worksXTo(0);
        worksYTo(0);
        gridXTo(0);
        gridYTo(0);
      };

      const rotateView = (event: PointerEvent) => {
        if (entering.current) return;
        const x = Math.max(-1, Math.min(1, event.clientX / window.innerWidth * 2 - 1));
        const y = Math.max(-1, Math.min(1, event.clientY / window.innerHeight * 2 - 1));
        rotateXTo(-y * 7.5);
        rotateYTo(x * 11);
        worksXTo(x * -20);
        worksYTo(y * -13);
        gridXTo(x * 10);
        gridYTo(y * 7);
      };

      container.addEventListener("pointermove", rotateView);
      container.addEventListener("pointerleave", resetView);

      if (reduced) {
        gsap.set(
          ".opening-work, .opening-tv, .opening-brand, .opening-status, .opening-enter",
          { autoAlpha: 1 },
        );
        gsap.set(".opening-tv", {
          scale: 1,
          z: 0,
          rotationX: 0,
          rotationY: 0,
        });
        markReady();
        return () => {
          container.removeEventListener("pointermove", rotateView);
          container.removeEventListener("pointerleave", resetView);
          idleTimeline.current?.kill();
          enterTimeline.current?.kill();
          enterHandler.current = () => undefined;
        };
      }

      gsap.set(".opening-work", { autoAlpha: 0, scale: 0.72, z: -420 });
      gsap.set(".opening-tv", {
        autoAlpha: 0,
        scale: 0.56,
        z: -260,
        rotationX: -12,
        rotationY: -28,
      });
      gsap.set(".opening-brand, .opening-status", { autoAlpha: 0, y: 12 });
      gsap.set(".opening-enter", { autoAlpha: 0, y: 14 });
      gsap.set(".opening-flash", { autoAlpha: 0 });

      revealTimeline.current = gsap
        .timeline({
          defaults: { ease: "power3.out" },
          onComplete: markReady,
        })
        .addLabel("boot", 0)
        .to(
          ".opening-brand, .opening-status",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.07,
          },
          "boot+=0.12",
        )
        .to(
          ".opening-tv",
          {
            autoAlpha: 1,
            scale: 1,
            z: 0,
            rotationX: 4,
            rotationY: 13,
            duration: 1.6,
            ease: "power4.out",
          },
          "boot+=0.22",
        )
        .to(
          ".opening-work",
          {
            autoAlpha: 1,
            scale: 1,
            z: 0,
            duration: 1.15,
            stagger: { amount: 0.62, from: "random" },
            ease: "back.out(1.35)",
          },
          "boot+=0.52",
        )
        .addLabel("orbit-a", 2.05)
        .to(
          ".opening-tv",
          {
            rotationX: -2,
            rotationY: -9,
            y: -10,
            duration: 1.9,
            ease: "sine.inOut",
          },
          "orbit-a",
        )
        .to(
          ".opening-work:nth-child(odd)",
          {
            y: "-=12",
            rotationZ: "+=1.5",
            duration: 1.9,
            ease: "sine.inOut",
          },
          "orbit-a",
        )
        .to(
          ".opening-work:nth-child(even)",
          {
            y: "+=10",
            rotationZ: "-=1.5",
            duration: 1.9,
            ease: "sine.inOut",
          },
          "orbit-a",
        )
        .addLabel("orbit-b", 4.18)
        .to(
          ".opening-tv",
          {
            rotationX: 3,
            rotationY: 8,
            y: 6,
            duration: 2.05,
            ease: "sine.inOut",
          },
          "orbit-b",
        )
        .to(
          ".opening-work:nth-child(odd)",
          {
            x: "+=9",
            duration: 2,
            ease: "sine.inOut",
          },
          "orbit-b",
        )
        .to(
          ".opening-work:nth-child(even)",
          {
            x: "-=8",
            duration: 2,
            ease: "sine.inOut",
          },
          "orbit-b",
        )
        .addLabel("settle", 6.38)
        .to(
          ".opening-tv",
          {
            rotationX: 0,
            rotationY: 0,
            y: 0,
            duration: 1.32,
            ease: "power3.inOut",
          },
          "settle",
        )
        .to(
          ".opening-enter",
          { autoAlpha: 1, y: 0, duration: 0.62, ease: "power3.out" },
          "settle+=0.58",
        )
        .to(
          ".opening-status",
          { color: "#8fffd1", duration: 0.42, ease: "power1.out" },
          "settle+=0.82",
        );

      return () => {
        container.removeEventListener("pointermove", rotateView);
        container.removeEventListener("pointerleave", resetView);
        revealTimeline.current?.kill();
        idleTimeline.current?.kill();
        enterTimeline.current?.kill();
        enterHandler.current = () => undefined;
      };
    },
    { scope: root },
  );

  const enterHomepage = () => enterHandler.current();

  return (
    <section
      ref={root}
      className={`opening-sequence${sceneReady ? " is-ready" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="个人作品集三维开场"
    >
      <div className="opening-grid" aria-hidden="true" />
      <div className="opening-vignette" aria-hidden="true" />

      <div className="opening-hud">
        <div className="opening-brand">
          <span>椿襄作品集</span>
          <strong>场景接入中</strong>
        </div>
        <div className="opening-status">
          <span>影像信号 07</span>
          <i />
          <span>空间档案已连接</span>
        </div>
      </div>

      <div className="opening-stage">
        <div className="opening-world">
          <div className="opening-works" aria-hidden="true">
            {openingWorks.map((work, index) => (
              <article
                className={`opening-work opening-work-${index + 1}`}
                key={work.title}
              >
                <strong>{work.title}</strong>
                <small>{work.meta}</small>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="opening-tv"
            onPointerDown={enterHomepage}
            onClick={enterHomepage}
            aria-label="点击电视进入主页"
          >
            <div className="opening-tv-depth" />
            <div className="opening-tv-body">
              <div className="opening-tv-bezel">
                <div className="opening-tv-screen">
                  <div className="opening-screen-content">
                    <svg
                      className="opening-web"
                      viewBox="0 0 420 250"
                      focusable="false"
                    >
                      <path d="M210 125 14 18M210 125 406 18M210 125 410 228M210 125 8 226M210 125V0M210 125v125M210 125H0M210 125h210" />
                      <ellipse cx="210" cy="125" rx="62" ry="38" />
                      <ellipse cx="210" cy="125" rx="118" ry="76" />
                      <ellipse cx="210" cy="125" rx="176" ry="112" />
                    </svg>
                    <div className="opening-city" />
                    <div className="opening-hero">
                      <i className="opening-hero-head" />
                      <i className="opening-hero-body" />
                      <i className="opening-hero-arm" />
                      <i className="opening-hero-line" />
                    </div>
                    <div className="opening-broadcast">
                      <span>原创影像</span>
                      <strong>蛛网英雄 // 2099</strong>
                    </div>
                    <div className="opening-scanlines" />
                  </div>
                  <div className="opening-flash" />
                </div>
              </div>
              <div className="opening-tv-controls">
                <span className="opening-dial opening-dial-a" />
                <span className="opening-dial opening-dial-b" />
                <i />
                <i />
                <i />
                <small>信号<br />接收</small>
              </div>
            </div>
            <div className="opening-tv-feet">
              <i />
              <i />
            </div>
          </button>
        </div>
      </div>

      <div
        className="opening-enter"
        aria-hidden="true"
      >
        <span>{sceneReady ? "移动光标 · 旋转视角" : "正在构建三维空间"}</span>
        <strong>{sceneReady ? "点击电视进入主页" : "请稍候"}</strong>
      </div>

      <div className="opening-caption">
        <span>三维作品空间</span>
        <strong>{sceneReady ? "场景已就绪，等待你的选择" : "将视线交给屏幕"}</strong>
      </div>
    </section>
  );
}

function LegacyHome() {
  const [showOpening, setShowOpening] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const shellRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const activeSlideRef = useRef(0);
  const animating = useRef(false);
  const openingActive = useRef(true);
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
        ignore: ".certificate-gallery",
        wheelSpeed: -1,
        tolerance: 24,
        preventDefault: true,
        onUp: () => {
          if (!openingActive.current) {
            goToSlide(activeSlideRef.current + 1, 1);
          }
        },
        onDown: () => {
          if (!openingActive.current) {
            goToSlide(activeSlideRef.current - 1, -1);
          }
        },
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
  const finishOpening = () => {
    openingActive.current = false;
    setShowOpening(false);
    requestAnimationFrame(() => shellRef.current?.focus());
  };
  const useLightChrome = false;

  return (
    <main
      ref={shellRef}
      className="resume-shell"
      aria-label="高级软件开发工程师沉浸式个人简历"
      tabIndex={0}
      onKeyDown={(event) => {
        if (openingActive.current) return;
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
        className={`global-header ${useLightChrome ? "is-light" : ""}`}
      >
        <button
          className="wordmark"
          onClick={() => goToSlide(0, -1)}
          aria-label="返回第一屏"
        >
          椿襄<span>°</span>
        </button>
        <div className="global-role">高级软件开发工程师｜人工智能与分布式系统</div>
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
          <span>椿襄，高级软件开发工程师</span>
          <h1>
            让复杂系统
            <br />
            <em>可靠地运行。</em>
          </h1>
          <p>
            以 Codex、Claude Code、智能体与 SOP 工作流构建可靠系统和可验证的交付闭环。
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

      </section>

      <section
        ref={(node) => {
          slideRefs.current[1] = node;
        }}
        className="resume-slide manifesto-slide"
        aria-hidden={activeSlide !== 1}
      >
        <div className="manifesto-orb" aria-hidden="true" />
        <h2 className="manifesto-title slide-reveal">
          从代码实现。
          <br />
          <em>到价值交付。</em>
        </h2>
        <p className="manifesto-copy slide-reveal">
          以 Codex、Claude Code 和 Skill 技能把需求理解、任务计划、代码验证与部署复盘串成
          SOP，让智能体参与排障、重构、单元测试与 API 文档，显著缩短个人项目交付周期。
        </p>
        <div className="manifesto-principles slide-reveal">
          <span>
            <strong>闭环</strong>
            从想法到部署
          </span>
          <span>
            <strong>排障</strong>
            从日志到根因
          </span>
          <span>
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
          ThinkPHP、Vue 3、Spring Boot、支付宝 / 微信支付、CI/CD
        </div>
      </section>

      <section
        ref={(node) => {
          slideRefs.current[4] = node;
        }}
        className="resume-slide intelligence-slide"
        aria-hidden={activeSlide !== 4}
      >
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
          Verl、Tool Agent Loop、Python Markdown、SFT、GRPO、Docker 安全沙箱
        </div>
      </section>

      <section
        ref={(node) => {
          slideRefs.current[5] = node;
        }}
        className="resume-slide delivery-slide"
        aria-hidden={activeSlide !== 5}
      >
        <h2 className="delivery-title slide-reveal">
          把一次成功，
          <br />
          <em>变成可复用的 SOP。</em>
        </h2>
        <div className="delivery-track slide-reveal">
          {deliverySteps.map((step) => (
            <div key={step.index}>
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
        className="resume-slide certificate-slide"
        aria-hidden={activeSlide !== 6}
      >
        <div className="certificate-heading slide-reveal">
          <h2>
            求索有迹，
            <br />
            <em>成果有证。</em>
          </h2>
          <p>
            学生时代留下的不只是奖项，也是一条从研究、建模到工程落地的成长轨迹。
          </p>
        </div>
        <CertificateGallery onExit={() => goToSlide(7, 1)} />
      </section>

      <section
        ref={(node) => {
          slideRefs.current[7] = node;
        }}
        className="resume-slide final-slide"
        aria-hidden={activeSlide !== 7}
      >
        <h2 className="final-title slide-reveal">
          用真实成果
          <br />
          <em>证明能力。</em>
        </h2>
        <p className="final-copy slide-reveal">
          武汉大学软件工程毕业，专注后端工程与人工智能原生研发
          <br />
          拥有后端实习、国家级项目负责人、智能体构建和人工智能科研经历。
        </p>
        <div className="final-contact slide-reveal">
          <span>
            <b>实践经历</b>
            泰康科技后端实习，中帆协国家级项目
          </span>
          <span>
            <b>代表荣誉</b>
            小米杯全国一等奖（队长），中级软件设计师
          </span>
          <span>
            <b>联系邮箱</b>
            mshuwhu@whu.edu.cn
          </span>
        </div>
        <div className="final-signature slide-reveal">
          椿襄，高级软件开发工程师，人工智能原生工程
        </div>
      </section>

      <nav
        className={`scene-nav ${useLightChrome ? "is-light" : ""}`}
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
        className={`scene-actions ${useLightChrome ? "is-light" : ""}`}
      >
        <button onClick={() => move(-1)} aria-label="上一屏">
          ↑
        </button>
        <span>{slideLabels[activeSlide]}</span>
        <button onClick={() => move(1)} aria-label="下一屏">
          ↓
        </button>
      </div>
      {showOpening ? <OpeningSequence onComplete={finishOpening} /> : null}
    </main>
  );
}

const featuredProjects = [
  {
    category: "企业实习 / 武汉泰康科技有限公司 / 2025.03 至 2025.07",
    title: "从数据库设计，到完整上线。",
    summary:
      "作为后端开发实习生，我不只接收零散接口任务，而是参与需求评审、业务表结构与 RESTful API 设计，书写并调优复杂 SQL，再与前端完成页面交互、联调和验收。面对线上慢查询，使用 EXPLAIN 还原执行路径，通过联合索引与关联查询重构收敛核心接口延迟，同时覆盖功能测试、回归测试、部署和问题跟踪，让一个需求真正从设计走到可用。",
    image: "/projects/payment-flow.webp",
    imageAlt: "象征数据库、接口与业务链路协作的暗色工程装置",
    stack: "MySQL / RESTful API / EXPLAIN / 联合索引 / 前后端联调",
    proof: "覆盖需求评审、技术方案、数据库设计、编码、页面联调、测试与部署的完整研发周期",
  },
  {
    category: "国家级生产项目 / 2023.05 至 2025.07",
    title: "中帆协官网与支付链路",
    summary:
      "持续迭代中国帆船帆板运动协会官网，接入支付宝与微信支付，以锁机制、状态机和熔断策略守住关键交易链路。",
    image: "/projects/chinasailing-site.webp",
    imageAlt: "中国帆船帆板运动协会官网首页、帆船赛事航拍与通知公告页面",
    stack: "ThinkPHP / Vue 3 / Spring Boot / MySQL / 支付系统",
    proof: "真实生产系统，覆盖研发、维护、排障与持续交付",
  },
  {
    category: "毕业设计 / 人工智能原生工程",
    title: "生命科学推理智能体",
    summary:
      "基于 Verl 重写工具调用循环，识别 Python Markdown 代码块并触发安全执行，以 SFT 与 GRPO 增强垂直领域多步推理。",
    image: "/projects/life-science-agent.webp",
    imageAlt: "生命科学工具调用链与安全执行模块组成的智能体工程视觉",
    stack: "Verl / Agent Loop / Python / SFT / GRPO / Docker",
    proof: "从模型训练延伸到工具协议、沙箱执行和推理评估",
  },
  {
    category: "团队项目 / 空间计算",
    title: "数字孪生三维重建",
    summary:
      "围绕三维人体重建完成虚实融合系统，负责技术路线、团队协作与交付推进，以工程实现验证复杂空间计算方案。",
    image: "/certificates/design-digital-twin-first.webp",
    imageAlt: "数字孪生三维人体重建项目一等奖证书",
    stack: "三维重建 / 数字孪生 / 人工智能 / 系统集成",
    proof: "计算机设计大赛中南地区赛一等奖",
  },
] as const;

const capabilityGroups = [
  {
    title: "人工智能原生与 Vibe Coding",
    lead: "让模型进入工程链路，也让灵感快速接受真实验证",
    items: [
      "Codex 与 Claude Code 协同开发",
      "LangChain 与 Llama 应用编排",
      "Skill、MCP 与上下文工程",
      "从原型、测试到部署的人工智能协同闭环",
    ],
  },
  {
    title: "全栈交付与数据工程",
    lead: "不把接口当终点，完成用户真正可用的业务闭环",
    items: [
      "Java、Python、C++、ThinkPHP 与 Vue 3",
      "页面信息设计、接口研发与前后端联调",
      "MySQL 表结构、复杂 SQL 与索引治理",
      "功能测试、回归测试、部署与问题跟踪",
    ],
  },
  {
    title: "智能体与模型训练",
    lead: "把推理能力包装为可执行系统",
    items: [
      "Agent Loop 与多工具路由",
      "Verl、SFT 与 GRPO 联合训练",
      "提示工程与垂直知识组织",
      "自动评测与异常回退策略",
    ],
  },
  {
    title: "表达与团队推进",
    lead: "把复杂问题讲清楚，让每个协作者都知道下一步",
    items: [
      "需求澄清、边界定义与任务拆分",
      "演示叙事、视频剪辑与信息取舍",
      "团队分工、节点推进与现场沟通",
      "知识星球内容沉淀与 SOP 工作流复用",
    ],
  },
] as const;

const workingMethod = [
  {
    title: "先拆业务闭环",
    text: "先核对用户、页面、接口、数据和异常路径，再写验收条件。泰康实习让我形成一个习惯：接口返回成功，不等于业务已经完成。",
  },
  {
    title: "用 Vibe Coding 把想法变成样品",
    text: "借助 Codex 与 Claude Code 快速调研、搭原型、补测试和排障，但保留技术方案、代码审查与人工验收，让速度建立在可控之上。",
  },
  {
    title: "让证据结束争论",
    text: "用自动化测试、日志、页面验收与回滚预案复核结果，交付之后再把经验写进 SOP。",
  },
] as const;

const workProof = [
  ["能承担完整研发周期", "在泰康从需求评审、表结构和 API 设计做到联调、测试与部署，能理解每一环如何影响最终交付。"],
  ["复杂问题排障与数据治理", "以 EXPLAIN、联合索引、链路日志和回归结果建立证据，不凭直觉给线上问题下结论。"],
  ["能与不同角色顺畅协作", "主动对齐页面交互、接口契约和验收边界，让产品、前端、后端和测试围绕同一个结果推进。"],
  ["能把人工智能变成生产力", "用 Codex、Claude Code 和 Skill 加速原型、重构与测试，同时保留审查、验证和回滚意识。"],
  ["能把经验写成团队资产", "经营知识星球与个人技术内容，把踩坑记录、工作流和项目复盘整理成别人可以理解和复用的材料。"],
  ["能在压力下保持团队节奏", "全国一等奖队长经历让我学会分工、及时喊停无效讨论，并在节点前主动暴露风险。"],
] as const;

const lifeChapters = [
  {
    title: "羽毛球",
    focus: "预判",
    statement: "我喜欢不到一秒的判断。对方的拍面、重心和空档，决定下一步往哪里移动。",
    practice: "单打时控制回合节奏，双打时主动补位和喊球。输掉一分就复盘落点，不把情绪带进下一拍。",
    transfer: "它让我在工程现场先读局面，再选择动作，同时始终为下一步保留空间。",
  },
  {
    title: "健身",
    focus: "状态",
    statement: "训练计划允许状态波动，但不允许动作失真。稳定出勤比偶尔把自己练到极限更重要。",
    practice: "根据当天恢复调整重量与组数，记录动作感受，把疼痛、疲劳和偷懒区分开。",
    transfer: "它教会我管理长期产出。高强度阶段敢冲，普通日子也能维持可靠的基本盘。",
  },
  {
    title: "视频剪辑",
    focus: "取舍",
    statement: "我会为了一个转场反复比较前后两帧，也会删掉自己喜欢但破坏节奏的素材。",
    practice: "先找故事落点，再筛素材、定音乐、卡节奏和做字幕，让每个镜头都有存在的理由。",
    transfer: "它让我写文档和做演示时少堆信息，更在意顺序、停顿，以及对方真正记住什么。",
  },
] as const;

function SpiderCharm() {
  const root = useRef<HTMLDivElement>(null);
  const thread = useRef<HTMLSpanElement>(null);
  const handle = useRef<HTMLButtonElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const container = root.current;
      const threadElement = thread.current;
      const handleElement = handle.current;
      if (!container || !threadElement || !handleElement) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const threshold = 132;
      const maximumPull = 190;
      const threadHeight = Math.max(threadElement.getBoundingClientRect().height, 1);
      let pointerId = -1;
      let startY = 0;
      let pull = 0;
      let dragging = false;

      const returnToRest = contextSafe((triggered: boolean) => {
        dragging = false;
        container.classList.remove("is-dragging", "is-armed");

        if (triggered) {
          container.classList.add("is-triggered");
          window.scrollTo({ top: 0, left: 0, behavior: reduced ? "auto" : "smooth" });
        }

        gsap.timeline({
          onComplete: () => container.classList.remove("is-triggered"),
        })
          .to(
            handleElement,
            {
              y: triggered ? pull + 18 : pull,
              scale: triggered ? 0.92 : 1.02,
              duration: triggered && !reduced ? 0.14 : 0,
              ease: "power2.in",
            },
            0,
          )
          .to(
            handleElement,
            {
              y: 0,
              rotation: 0,
              scale: 1,
              duration: reduced ? 0 : 0.72,
              ease: triggered ? "elastic.out(1, 0.52)" : "back.out(1.8)",
            },
            triggered && !reduced ? 0.12 : 0,
          );

        gsap.to(threadElement, {
          scaleY: 1,
          duration: reduced ? 0 : 0.68,
          ease: triggered ? "elastic.out(1, 0.52)" : "back.out(1.8)",
          overwrite: "auto",
        });
        gsap.to(container, {
          "--pull-progress": 0,
          duration: reduced ? 0 : 0.42,
          ease: "power2.out",
          overwrite: "auto",
        });
        pull = 0;
      });

      const handlePointerDown = contextSafe((event: PointerEvent) => {
        if (event.button !== 0) return;
        event.preventDefault();
        pointerId = event.pointerId;
        startY = event.clientY;
        pull = 0;
        dragging = true;
        handleElement.setPointerCapture(pointerId);
        container.classList.add("is-dragging", "is-hovered");
        gsap.killTweensOf([handleElement, threadElement, container]);
        gsap.to(handleElement, {
          scale: 1.06,
          duration: reduced ? 0 : 0.18,
          ease: "power2.out",
        });
      });

      const handlePointerMove = contextSafe((event: PointerEvent) => {
        if (!dragging || event.pointerId !== pointerId) return;
        event.preventDefault();
        pull = Math.max(0, Math.min(maximumPull, event.clientY - startY));
        const armed = pull >= threshold;

        gsap.set(handleElement, {
          y: pull,
          rotation: Math.min(5, pull * 0.026),
          scale: armed ? 1.09 : 1.06,
        });
        gsap.set(threadElement, { scaleY: 1 + pull / threadHeight });
        gsap.set(container, { "--pull-progress": Math.min(1, pull / threshold) });
        container.classList.toggle("is-armed", armed);
      });

      const handlePointerUp = contextSafe((event: PointerEvent) => {
        if (!dragging || event.pointerId !== pointerId) return;
        if (handleElement.hasPointerCapture(pointerId)) {
          handleElement.releasePointerCapture(pointerId);
        }
        returnToRest(pull >= threshold);
      });

      const handlePointerEnter = contextSafe(() => {
        container.classList.add("is-hovered");
        if (!dragging) {
          gsap.to(handleElement, {
            scale: 1.07,
            duration: reduced ? 0 : 0.28,
            ease: "power3.out",
            overwrite: "auto",
          });
        }
      });

      const handlePointerLeave = contextSafe(() => {
        if (dragging) return;
        container.classList.remove("is-hovered");
        gsap.to(handleElement, {
          scale: 1,
          duration: reduced ? 0 : 0.35,
          ease: "power3.out",
          overwrite: "auto",
        });
      });

      const handleKeyDown = contextSafe((event: KeyboardEvent) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        pull = threshold;
        returnToRest(true);
      });

      const preventImageDrag = (event: DragEvent) => event.preventDefault();

      handleElement.addEventListener("pointerdown", handlePointerDown);
      handleElement.addEventListener("pointermove", handlePointerMove);
      handleElement.addEventListener("pointerup", handlePointerUp);
      handleElement.addEventListener("pointercancel", handlePointerUp);
      handleElement.addEventListener("pointerenter", handlePointerEnter);
      handleElement.addEventListener("pointerleave", handlePointerLeave);
      handleElement.addEventListener("keydown", handleKeyDown);
      handleElement.addEventListener("dragstart", preventImageDrag);

      return () => {
        handleElement.removeEventListener("pointerdown", handlePointerDown);
        handleElement.removeEventListener("pointermove", handlePointerMove);
        handleElement.removeEventListener("pointerup", handlePointerUp);
        handleElement.removeEventListener("pointercancel", handlePointerUp);
        handleElement.removeEventListener("pointerenter", handlePointerEnter);
        handleElement.removeEventListener("pointerleave", handlePointerLeave);
        handleElement.removeEventListener("keydown", handleKeyDown);
        handleElement.removeEventListener("dragstart", preventImageDrag);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="spider-charm">
      <span ref={thread} className="spider-thread" aria-hidden="true" />
      <button
        ref={handle}
        type="button"
        className="spider-charm-handle"
        aria-label="向下拉动蜘蛛侠挂件，拉过阈值后松开返回页面顶部"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 本地透明挂件素材需要保留原始透明边缘。 */}
        <img src="/objects/spider-charm.png" alt="" draggable="false" />
      </button>
      <span className="spider-tooltip" aria-hidden="true">
        <small>蛛丝导航</small>
        <strong className="spider-idle-copy">向下拉动 · 回到顶部</strong>
        <strong className="spider-armed-copy">松开 · 返回顶部</strong>
        <span className="spider-pull-meter"><i /></span>
      </span>
    </div>
  );
}

export default function Home() {
  const [showOpening, setShowOpening] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const contactClose = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (!contactOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContactOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    requestAnimationFrame(() => contactClose.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [contactOpen]);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".flora-nav", {
          autoAlpha: 0,
          y: -20,
          duration: 0.7,
          ease: "power3.out",
        });

        gsap.from(".flora-hero-copy > *", {
          autoAlpha: 0,
          y: 52,
          duration: 0.9,
          stagger: 0.09,
          ease: "power4.out",
          delay: 0.12,
        });

        gsap.from(".flora-avatar-frame", {
          autoAlpha: 0,
          scale: 0.76,
          y: 80,
          duration: 1.25,
          ease: "power4.out",
          delay: 0.08,
        });

        gsap.to(".flora-avatar-frame", {
          yPercent: 13,
          scale: 0.92,
          ease: "none",
          scrollTrigger: {
            trigger: ".flora-hero",
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });

        gsap.to(".flora-hero-name", {
          xPercent: -8,
          autoAlpha: 0.16,
          ease: "none",
          scrollTrigger: {
            trigger: ".flora-hero",
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });

        gsap.fromTo(
          ".flora-profile-portrait img",
          { scale: 1.04, yPercent: -3 },
          {
            scale: 1.04,
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: ".flora-profile",
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );

        gsap.utils.toArray<HTMLElement>(".flora-reveal").forEach((element) => {
          gsap.from(element, {
            autoAlpha: 0,
            y: 60,
            duration: 0.88,
            ease: "power4.out",
            scrollTrigger: {
              trigger: element,
              start: "top 84%",
              once: true,
            },
          });
        });

        gsap.utils
          .toArray<HTMLElement>(".flora-project:not(:first-child) .flora-project-visual img")
          .forEach((image) => {
            gsap.fromTo(
              image,
              { scale: 1.08, yPercent: -4 },
              {
                scale: 1,
                yPercent: 5,
                ease: "none",
                scrollTrigger: {
                  trigger: image.closest(".flora-project"),
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              },
            );
          });
      });

      return () => media.revert();
    },
    { scope: root },
  );

  const closeOpening = () => {
    setShowOpening(false);
    requestAnimationFrame(() => root.current?.focus());
  };

  const goToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main
      ref={root}
      className="flora-resume"
      aria-label="椿襄高级软件开发工程师个人简历"
      tabIndex={-1}
    >
      <div className="flora-background-object" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- 本地生成的抽象工程物件用于全站背景景深。 */}
        <img src="/projects/payment-flow.webp" alt="" fetchPriority="low" />
      </div>

      <SpiderCharm />

      <header className="flora-nav">
        <a className="flora-wordmark" href="#home" aria-label="返回首页">
          椿襄
        </a>
        <nav aria-label="简历导航">
          <a href="#profile">关于我</a>
          <a href="#work">代表项目</a>
          <a href="#skills">技术能力</a>
          <a href="#life">生活侧写</a>
          <a href="#archive">成果档案</a>
        </nav>
        <button
          type="button"
          className="flora-contact-link"
          aria-haspopup="dialog"
          aria-expanded={contactOpen}
          onClick={() => setContactOpen(true)}
        >
          联系我
        </button>
      </header>

      <section className="flora-hero" id="home">
        <div className="flora-hero-name" aria-hidden="true">
          椿襄
        </div>
        <div className="flora-bloom" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>

        <div className="flora-hero-copy">
          <span>软件开发工程师 / ENFP / 运动与影像爱好者</span>
          <h1>
            把系统做稳，
            <br />
            把生活过出镜头感。
          </h1>
          <p>
            白天拆解支付链路、智能体和后端系统，下班后去球场找节奏、在训练里管理状态，再把日常剪成有起承转合的短片。
          </p>
        </div>

        <div className="flora-avatar-frame" aria-label="眼神跟随光标的三维人物">
          <Canvas
            camera={{ position: [0, 0.08, 7.6], fov: 34 }}
            dpr={[1, 1.6]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <Avatar accent="#b7c39a" />
            </Suspense>
          </Canvas>
        </div>

        <div className="flora-traits" aria-label="个性与能力标签">
          {traits.slice(0, 6).map((trait) => (
            <TraitTag key={trait.label} trait={trait} />
          ))}
        </div>

        <aside className="flora-hero-note">
          <strong>它们如何汇合</strong>
          <span>工程判断</span>
          <span>主动连接</span>
          <span>身体感知</span>
        </aside>
      </section>

      <section className="flora-profile" id="profile">
        <div className="flora-profile-portrait flora-reveal">
          {/* eslint-disable-next-line @next/next/no-img-element -- 用户提供的本人职业肖像是本章节的核心内容。 */}
          <img
            src="/portrait/chunxiang-professional.webp"
            alt="椿襄身着深蓝衬衫的职业肖像"
            loading="lazy"
          />
        </div>

        <div className="flora-profile-copy">
          <div className="flora-profile-monogram" aria-hidden="true">ENFP</div>
          <div className="flora-reveal">
            <h2>
              不只写代码，
              <br />
              也训练判断、表达
              <br />
              与长期状态。
            </h2>
            <p className="flora-profile-intro">
              我喜欢有反馈的事情。代码会报错，球会落地，镜头会告诉你哪里拖沓。它们都逼人诚实，也让我习惯观察、调整，然后再试一次。
            </p>
          </div>

          <div className="flora-profile-notes">
            <article className="flora-reveal">
              <span>作为 ENFP</span>
              <h3>先让人愿意一起做事。</h3>
              <p>我会主动接住冷场、说清各自擅长的部分，再把脑暴收束成谁来做、做到什么程度、什么时候一起验收。</p>
            </article>
            <article className="flora-reveal">
              <span>作为工程师</span>
              <h3>兴奋地开始，冷静地收尾。</h3>
              <p>新工具让我兴奋，但生产交付仍要靠边界、测试、日志和回滚。好奇心负责打开可能，证据负责关上风险。</p>
            </article>
            <article className="flora-reveal">
              <span>作为创作者</span>
              <h3>删掉无效信息，留下真正的重点。</h3>
              <p>剪辑训练了我的叙事顺序。做演示、写方案或解释技术时，我会先决定对方最后应该记住哪一句。</p>
            </article>
          </div>
        </div>
      </section>

      <section className="flora-projects" id="work">
        <header className="flora-section-heading flora-reveal">
          <h2>热情可以很广，交付必须具体。</h2>
          <p>从泰康企业实习到国家级生产项目，再到推理智能体与三维重建。每一段经历都写清业务场景、个人职责和验证方式。</p>
        </header>

        <div className="flora-project-list">
          {featuredProjects.map((project) => (
            <article className="flora-project flora-reveal" key={project.title}>
              <div className="flora-project-visual">
                {/* eslint-disable-next-line @next/next/no-img-element -- 本地成果图片用于滚动视差，保留原生图像节点。 */}
                <img src={project.image} alt={project.imageAlt} loading="lazy" />
              </div>
              <div className="flora-project-copy">
                <small>{project.category}</small>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <dl>
                  <div>
                    <dt>技术路径</dt>
                    <dd>{project.stack}</dd>
                  </div>
                  <div>
                    <dt>能力证明</dt>
                    <dd>{project.proof}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flora-method" id="method">
        <div className="flora-method-image flora-reveal">
          {/* eslint-disable-next-line @next/next/no-img-element -- 本地研究成果图用于方法论章节主视觉。 */}
          <img
            src="/certificates/patent-acceptance.webp"
            alt="国家知识产权局发明专利申请受理成果"
            loading="lazy"
          />
        </div>
        <div className="flora-method-copy">
          <div className="flora-reveal">
            <h2>我怎么把热情变成可靠交付。</h2>
            <p>
              ENFP 让我愿意打开局面，工程训练让我把局面收好。人工智能工具参与调研、编码、测试和审查，但最终结果仍由证据验收。
            </p>
          </div>
          <ol>
            {workingMethod.map((step) => (
              <li className="flora-reveal" key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <aside className="flora-maker-note flora-reveal">
            <small>个人实验场 / 内容复利</small>
            <h3>Vibe Coding 不是省略工程，而是缩短反馈。</h3>
            <p>
              我正在用人工智能协作开发一款类似 Carrd 的个人建站产品：从需求拆解、页面设计、全栈实现、自动化测试到部署复盘，先让想法快速成为可操作的产品，再用真实反馈修正方向。与此同时，我持续经营知识星球与个人技术内容，把开发日志、疑难问题、Skill 和 SOP 整理成可复用的内容资产。写给别人看，也迫使我把自己的判断讲清楚。
            </p>
          </aside>
        </div>
      </section>

      <section className="flora-capabilities" id="skills">
        <header className="flora-section-heading flora-reveal">
          <h2>技术是我的主业，但不是我的全部。</h2>
          <p>这套技术栈服务于四件事：理解复杂问题、构建可靠系统、让智能体真正执行任务，以及把团队推进到结果。</p>
        </header>
        <div className="flora-capability-grid">
          {capabilityGroups.map((group) => (
            <article className="flora-capability flora-reveal" key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.lead}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="flora-life" id="life">
        <header className="flora-life-heading flora-reveal">
          <h2>
            工作之外，
            <br />
            我仍在练习同一件事。
          </h2>
          <p>观察反馈，做出判断，然后愿意为下一次表现重新调整。</p>
        </header>

        <div className="flora-life-chapters">
          {lifeChapters.map((chapter) => (
            <article className="flora-life-chapter flora-reveal" key={chapter.title}>
              <div className="flora-life-title">
                <span>{chapter.focus}</span>
                <h3>{chapter.title}</h3>
              </div>
              <div className="flora-life-story">
                <strong>{chapter.statement}</strong>
                <dl>
                  <div>
                    <dt>我怎么练</dt>
                    <dd>{chapter.practice}</dd>
                  </div>
                  <div>
                    <dt>它如何影响工作</dt>
                    <dd>{chapter.transfer}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flora-proof">
        <div className="flora-proof-statement flora-reveal">
          <h2>我希望同事记住的，不只是一串技术栈。</h2>
          <p>
            我能在复杂系统里保持判断，也能在合作里提供能量。从泰康科技完整研发周期、中帆协生产项目、竞赛队长到人工智能科研与个人内容创作，我始终把沟通、验证、表达和收尾看成工程的一部分。
          </p>
        </div>
        <div className="flora-proof-list">
          {workProof.map(([title, text]) => (
            <article className="flora-reveal" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flora-archive" id="archive">
        <header className="flora-section-heading flora-reveal">
          <h2>学生时代结束了，证据仍然有效。</h2>
          <p>这些研究、专利和竞赛不再代表排名，而是记录我如何主动组队、解决陌生问题，并把想法做成可验收的成果。</p>
        </header>
        <CertificateGallery onExit={goToContact} />
      </section>

      <section className="flora-closing" id="contact">
        <div className="flora-closing-mark" aria-hidden="true">
          椿襄
        </div>
        <div className="flora-closing-copy flora-reveal">
          <h2>可以先聊系统，也可以先约一场球。</h2>
          <p>武汉大学软件工程背景。如果你在找一个能写后端、搭智能体、推进协作，也愿意为表达和体验多走一步的人，欢迎联系。</p>
          <a href="mailto:mshuwhu@whu.edu.cn">mshuwhu@whu.edu.cn</a>
        </div>
        <footer>
          <span>软件开发工程师 / ENFP</span>
        </footer>
      </section>

      {contactOpen ? (
        <div
          className="flora-contact-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setContactOpen(false);
          }}
        >
          <section
            className="flora-contact-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-card-title"
          >
            <button
              ref={contactClose}
              type="button"
              className="flora-contact-card-close"
              aria-label="关闭联系卡片"
              onClick={() => setContactOpen(false)}
            >
              关闭
            </button>

            <small>直接联系</small>
            <h2 id="contact-card-title">聊聊下一次合作。</h2>
            <p>工作邀约、项目协作或技术交流，都可以通过下面的方式找到我。</p>

            <div className="flora-contact-methods">
              <a href="mailto:mshuwhu@whu.edu.cn">
                <span>邮箱</span>
                <strong>mshuwhu@whu.edu.cn</strong>
              </a>
              <a href="tel:+8618289423880">
                <span>电话</span>
                <strong>+86 182 8942 3880</strong>
              </a>
            </div>
          </section>
        </div>
      ) : null}

      {showOpening ? <OpeningSequence onComplete={closeOpening} /> : null}
    </main>
  );
}
