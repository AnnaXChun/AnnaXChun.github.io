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
    label: "Codex / Claude Code",
    note: "人工智能协作",
    className: "trait-one",
    color: "#b8d97c",
    meaning: "熟练使用人工智能编程工具参与真实工程研发。",
    evidence: "用于代码理解、方案拆分、重构、测试、排障与部署交付。",
    value: "缩短反馈链路，让研发速度与代码质量同时提升。",
  },
  {
    label: "智能体构建",
    note: "人工智能工程",
    className: "trait-two",
    color: "#c9ae67",
    meaning: "具备从模型接入到工具调用的智能体研发经验。",
    evidence: "实践 LangChain、Llama、Agent Loop、工具调用与安全沙箱。",
    value: "能够把大模型能力转化为可执行、可验证的业务流程。",
  },
  {
    label: "高并发后端",
    note: "工程能力",
    className: "trait-three",
    color: "#8f86c8",
    meaning: "围绕高流量场景设计稳定的接口、数据与降级策略。",
    evidence: "实践锁机制、状态机、熔断、MySQL 索引与慢查询治理。",
    value: "保障关键链路在并发压力下保持一致性和可用性。",
  },
  {
    label: "全国一等奖队长",
    note: "领导力",
    className: "trait-four",
    color: "#d97a64",
    meaning: "计算机系统能力大赛小米杯全国一等奖团队负责人。",
    evidence: "以队长身份推进方案设计、协作分工与最终交付。",
    value: "验证复杂任务拆解、技术决策和团队推进能力。",
  },
  {
    label: "LangChain / Llama",
    note: "模型应用",
    className: "trait-five",
    color: "#f5f0e7",
    meaning: "具备大模型应用编排、上下文组织与推理链路经验。",
    evidence: "结合垂直模型、提示工程和工具协议构建智能体应用。",
    value: "能从模型能力出发设计稳定、可扩展的应用架构。",
  },
  {
    label: "全栈闭环交付",
    note: "工作能力",
    className: "trait-six",
    color: "#b8d97c",
    meaning: "能够从需求、研发、测试到部署独立完成闭环。",
    evidence: "持续维护国家级官网，并独立交付多个个人项目。",
    value: "不止完成代码，还能把产品可靠地交付上线。",
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
    items: "Codex · Claude Code · Gemini · Skill 技能 · 上下文工程 · GSD",
  },
  {
    label: "智能体研发",
    items: "LangChain · Llama · Verl · Agent Loop · 工具调用 · Docker 安全沙箱",
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
  index,
  interactive = true,
}: {
  certificate: Certificate;
  index: number;
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
        <span>{String(index + 1).padStart(2, "0")}</span>
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
        <span>滚轮 / 拖动 · 循环浏览</span>
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
            certificates.map((certificate, index) => (
              <CertificateCard
                key={`${cycle}-${certificate.title}`}
                certificate={certificate}
                index={index}
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
  { index: "01", title: "智能体工作流", meta: "工具调用 · SOP" },
  { index: "02", title: "支付链路", meta: "高并发 · 状态机" },
  { index: "03", title: "MobiCom 研究", meta: "临床知识蒸馏" },
  { index: "04", title: "数字孪生", meta: "三维人体重建" },
  { index: "05", title: "系统能力", meta: "全国一等奖" },
  { index: "06", title: "人工智能原生", meta: "Codex · Agent" },
] as const;

function OpeningSequence({ onComplete }: { onComplete: () => void }) {
  const root = useRef<HTMLElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const completed = useRef(false);

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    onComplete();
  };

  useGSAP(
    () => {
      const container = root.current;
      const television = container?.querySelector<HTMLElement>(".opening-tv");
      if (!container || !television) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const televisionBounds = television.getBoundingClientRect();
      const coverScale =
        Math.max(
          window.innerWidth / Math.max(televisionBounds.width * 0.72, 1),
          window.innerHeight / Math.max(televisionBounds.height * 0.58, 1),
        ) * 1.28;

      if (reduced) {
        timeline.current = gsap
          .timeline({ onComplete: finish })
          .to(container, {
            autoAlpha: 0,
            duration: 0.35,
            delay: 0.25,
            ease: "power1.out",
          });
        return;
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
      gsap.set(".opening-flash", { autoAlpha: 0 });

      timeline.current = gsap
        .timeline({
          defaults: { ease: "power3.out" },
          onComplete: finish,
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
            duration: 1.25,
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
            duration: 0.95,
            stagger: { amount: 0.46, from: "random" },
            ease: "back.out(1.35)",
          },
          "boot+=0.52",
        )
        .addLabel("orbit", 1.5)
        .to(
          ".opening-tv",
          {
            rotationX: -2,
            rotationY: -9,
            y: -10,
            duration: 1.35,
            ease: "sine.inOut",
          },
          "orbit",
        )
        .to(
          ".opening-work:nth-child(odd)",
          {
            y: "-=12",
            rotationZ: "+=1.5",
            duration: 1.25,
            ease: "sine.inOut",
          },
          "orbit",
        )
        .to(
          ".opening-work:nth-child(even)",
          {
            y: "+=10",
            rotationZ: "-=1.5",
            duration: 1.25,
            ease: "sine.inOut",
          },
          "orbit",
        )
        .addLabel("focus", 3.05)
        .to(
          ".opening-hud",
          { autoAlpha: 0, duration: 0.35, ease: "power2.in" },
          "focus",
        )
        .to(
          ".opening-work",
          {
            autoAlpha: 0,
            scale: 0.68,
            z: -360,
            duration: 0.62,
            stagger: { amount: 0.2, from: "edges" },
            ease: "power3.in",
          },
          "focus",
        )
        .to(
          ".opening-tv",
          {
            rotationX: 0,
            rotationY: 0,
            y: 0,
            scale: 1.1,
            duration: 0.62,
            ease: "power3.inOut",
          },
          "focus+=0.08",
        )
        .addLabel("enter", 3.72)
        .to(
          ".opening-tv",
          {
            scale: coverScale,
            z: 360,
            duration: 1.08,
            ease: "expo.in",
          },
          "enter",
        )
        .to(
          ".opening-screen-content",
          { autoAlpha: 0, duration: 0.24, ease: "power2.in" },
          "enter+=0.56",
        )
        .to(
          ".opening-flash",
          { autoAlpha: 1, duration: 0.32, ease: "power2.in" },
          "enter+=0.68",
        )
        .to(
          container,
          { autoAlpha: 0, duration: 0.28, ease: "power1.out" },
          "enter+=1.02",
        );
    },
    { scope: root },
  );

  const skipOpening = () => {
    if (timeline.current) {
      timeline.current.progress(1);
    } else {
      finish();
    }
  };

  return (
    <section
      ref={root}
      className="opening-sequence"
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
        <button type="button" onClick={skipOpening} autoFocus>
          跳过序章
        </button>
      </div>

      <div className="opening-stage" aria-hidden="true">
        <div className="opening-works">
          {openingWorks.map((work, index) => (
            <article
              className={`opening-work opening-work-${index + 1}`}
              key={work.title}
            >
              <span>{work.index}</span>
              <strong>{work.title}</strong>
              <small>{work.meta}</small>
            </article>
          ))}
        </div>

        <div className="opening-tv">
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
        </div>
      </div>

      <div className="opening-caption">
        <span>三维作品空间</span>
        <strong>将视线交给屏幕</strong>
      </div>
    </section>
  );
}

export default function Home() {
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
  const useLightChrome = activeSlide === 1 || activeSlide >= 6;

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
          <span>椿襄 / 高级软件开发工程师 · 人工智能原生工程</span>
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

        <div className="hero-foot slide-reveal">
          <span>人工智能协同研发</span>
          <span>智能体与工具调用</span>
          <span>后端全栈闭环</span>
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
          以 Codex、Claude Code 和 Skill 技能把需求理解、任务计划、代码验证与部署复盘串成
          SOP，让智能体参与排障、重构、单元测试与 API 文档，个人项目周期缩短 40% 以上。
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
        className="resume-slide certificate-slide"
        aria-hidden={activeSlide !== 6}
      >
        <div className="scene-kicker slide-reveal">07 / 证书画廊</div>
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
        <div className="scene-kicker slide-reveal">08 / 工作与成果</div>
        <h2 className="final-title slide-reveal">
          用真实成果
          <br />
          <em>证明能力。</em>
        </h2>
        <p className="final-copy slide-reveal">
          武汉大学软件工程毕业 · 后端工程与人工智能原生研发
          <br />
          拥有后端实习、国家级项目负责人、智能体构建和人工智能科研经历。
        </p>
        <div className="final-contact slide-reveal">
          <span>
            <b>实践经历</b>
            泰康科技后端实习 · 中帆协国家级项目
          </span>
          <span>
            <b>代表荣誉</b>
            小米杯全国一等奖（队长）· 中级软件设计师
          </span>
          <span>
            <b>联系邮箱</b>
            mshuwhu@whu.edu.cn
          </span>
        </div>
        <div className="final-signature slide-reveal">
          椿襄 · 高级软件开发工程师 · 人工智能原生工程
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
