"use client";

import { useGSAP } from "@gsap/react";
import { ContactShadows, Float, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { useRef, useState } from "react";
import * as THREE from "three";

gsap.registerPlugin(useGSAP, Observer);

const slideLabels = [
  "个人定位",
  "核心能力",
  "技术栈矩阵",
  "高并发与分布式",
  "人工智能与数据",
  "云原生与交互",
  "代表项目",
  "工程方法",
  "联系与方向",
] as const;

const slideAccents = [
  "#b9ff4f",
  "#7b75ff",
  "#ffda45",
  "#ff784f",
  "#7b75ff",
  "#b9ff4f",
  "#ff784f",
  "#ffda45",
  "#7b75ff",
] as const;

const capabilities = [
  {
    index: "01",
    title: "分布式后端",
    type: "系统架构",
    text: "围绕服务边界、数据一致性、异步流程与故障隔离，构建可长期演进的服务体系。",
    stack: ["服务拆分", "数据一致性", "事件驱动", "领域建模"],
    color: "#b9ff4f",
  },
  {
    index: "02",
    title: "高并发工程",
    type: "性能与稳定性",
    text: "通过缓存、消息队列、背压、限流和容量治理，保障高负载下的稳定运行。",
    stack: ["多级缓存", "流量治理", "异步处理", "性能分析"],
    color: "#ff784f",
  },
  {
    index: "03",
    title: "生产级智能应用",
    type: "人工智能工程",
    text: "建设包含检索、工具调用、评测、护栏与链路追踪的智能应用。",
    stack: ["大语言模型", "检索增强", "智能体", "自动化评测"],
    color: "#7b75ff",
  },
  {
    index: "04",
    title: "云端交付",
    type: "平台与研发效能",
    text: "让构建、测试、发布、回滚和观测形成可重复的自动化交付链路。",
    stack: ["容器编排", "持续交付", "灰度发布", "可观测性"],
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

const deepStacks = [
  {
    index: "01",
    title: "高并发服务端",
    statement: "面向峰值流量与复杂调用链，构建低延迟、可扩展、可降级的服务体系。",
    color: "#b9ff4f",
    groups: [
      { title: "服务框架", items: ["Java 17", "Spring Boot 3", "Netty", "虚拟线程"] },
      { title: "流量中间件", items: ["Redis 集群", "Kafka", "RocketMQ", "Sentinel"] },
      { title: "交付能力", items: ["容量模型", "压测方案", "性能基线", "故障演练"] },
    ],
  },
  {
    index: "02",
    title: "分布式系统",
    statement: "围绕服务边界、数据流和失败路径，设计可演进的分布式架构。",
    color: "#ff784f",
    groups: [
      { title: "服务治理", items: ["Spring Cloud", "Nacos", "Dubbo", "gRPC"] },
      { title: "一致性方案", items: ["Seata", "事务消息", "最终一致性", "幂等补偿"] },
      { title: "交付能力", items: ["系统架构图", "服务契约", "容灾方案", "演进路线"] },
    ],
  },
  {
    index: "03",
    title: "人工智能应用",
    statement: "把模型能力接入真实业务，并建立质量、延迟、安全与成本边界。",
    color: "#7b75ff",
    groups: [
      { title: "应用框架", items: ["Python", "FastAPI", "LangChain", "LlamaIndex"] },
      { title: "模型与检索", items: ["vLLM", "Ollama", "Milvus", "知识图谱"] },
      { title: "交付能力", items: ["知识问答", "智能助手", "流程自动化", "评测平台"] },
    ],
  },
  {
    index: "04",
    title: "数据与存储",
    statement: "根据访问模式、数据规模和一致性要求，选择并治理合适的存储方案。",
    color: "#ffda45",
    groups: [
      { title: "关系与检索", items: ["MySQL", "PostgreSQL", "Elasticsearch", "ClickHouse"] },
      { title: "数据治理", items: ["ShardingSphere", "读写分离", "索引优化", "慢查询治理"] },
      { title: "交付能力", items: ["数据模型", "迁移方案", "备份恢复", "容量规划"] },
    ],
  },
  {
    index: "05",
    title: "云原生交付",
    statement: "让构建、测试、发布、回滚和观测形成可重复的自动化交付链路。",
    color: "#b9ff4f",
    groups: [
      { title: "基础设施", items: ["Docker", "Kubernetes", "Helm", "Terraform"] },
      { title: "交付与观测", items: ["Argo CD", "Prometheus", "Grafana", "OpenTelemetry"] },
      { title: "交付能力", items: ["交付流水线", "环境规范", "回滚策略", "告警体系"] },
    ],
  },
  {
    index: "06",
    title: "前端与三维交互",
    statement: "兼顾组件复用、交互表现与运行性能，交付具有辨识度的产品体验。",
    color: "#ff784f",
    groups: [
      { title: "界面框架", items: ["TypeScript", "React", "Next.js", "Three.js"] },
      { title: "交互与质量", items: ["GSAP", "状态管理", "性能优化", "自动化测试"] },
      { title: "交付能力", items: ["复杂管理后台", "数据可视化", "三维网站", "交互原型"] },
    ],
  },
] as const;

const technologyMatrix = [
  {
    index: "01",
    title: "服务端开发",
    color: "#b9ff4f",
    items: ["Java 17", "Spring Boot 3", "Spring Cloud", "Netty", "Go", "Python"],
  },
  {
    index: "02",
    title: "高并发中间件",
    color: "#ff784f",
    items: ["Redis 集群", "Kafka", "RocketMQ", "Nginx", "Sentinel", "Dubbo"],
  },
  {
    index: "03",
    title: "数据与检索",
    color: "#ffda45",
    items: ["MySQL", "PostgreSQL", "Elasticsearch", "ClickHouse", "MongoDB", "Milvus"],
  },
  {
    index: "04",
    title: "人工智能工程",
    color: "#7b75ff",
    items: ["LangChain", "LlamaIndex", "FastAPI", "vLLM", "Ollama", "向量检索"],
  },
  {
    index: "05",
    title: "云原生平台",
    color: "#b9ff4f",
    items: ["Docker", "Kubernetes", "Helm", "Terraform", "Argo CD", "持续交付"],
  },
  {
    index: "06",
    title: "观测与前端",
    color: "#ff784f",
    items: ["Prometheus", "Grafana", "OpenTelemetry", "React", "Three.js", "GSAP"],
  },
] as const;

const projectCases = [
  {
    index: "01",
    title: "高峰值交易服务",
    subtitle: "高并发 · 分布式 · 稳定性",
    text: "围绕热点隔离、异步削峰、多级缓存与故障降级，设计面向突发流量的核心交易链路。",
    metrics: [
      { value: "10 万级", label: "每秒请求容量目标" },
      { value: "百毫秒级", label: "核心链路延迟目标" },
      { value: "99.99%", label: "服务可用性目标" },
    ],
    duties: ["容量建模与压测", "缓存与消息架构", "限流熔断与降级", "全链路观测"],
    color: "#b9ff4f",
  },
  {
    index: "02",
    title: "企业智能知识中台",
    subtitle: "检索增强 · 智能体 · 评测",
    text: "把分散文档、业务系统和工具能力接入统一智能入口，建立可追溯、可评测的知识服务。",
    metrics: [
      { value: "千万级", label: "文档切片容量目标" },
      { value: "秒级", label: "问答响应目标" },
      { value: "90%+", label: "引用命中目标" },
    ],
    duties: ["检索与重排链路", "工具调用编排", "质量评测与护栏", "成本与延迟治理"],
    color: "#7b75ff",
  },
] as const;

const engineeringSteps = [
  { index: "01", title: "需求澄清", text: "识别业务目标、关键约束、风险边界和可以验证的成功标准。" },
  { index: "02", title: "架构权衡", text: "比较复杂度、性能、成本与演进空间，记录关键技术决策。" },
  { index: "03", title: "质量内建", text: "用测试、代码审查、静态检查和自动化门禁保障交付质量。" },
  { index: "04", title: "性能验证", text: "建立容量模型和性能基线，通过压测定位瓶颈并验证优化结果。" },
  { index: "05", title: "稳定上线", text: "采用灰度、监控、告警、回滚与故障预案控制发布风险。" },
  { index: "06", title: "持续演进", text: "基于运行数据和故障复盘，持续改善架构、流程与开发体验。" },
] as const;

type AvatarProps = {
  accent: string;
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

function Avatar({ accent }: AvatarProps) {
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
            <meshStandardMaterial color={accent} />
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
        <meshStandardMaterial color={accent} emissiveIntensity={0.5} />
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

function StackPanel({ stack }: { stack: (typeof deepStacks)[number] }) {
  return (
    <article
      className="stack-panel slide-reveal"
      style={{ "--stack-accent": stack.color } as React.CSSProperties}
    >
      <div className="stack-panel-head">
        <span>{stack.index}</span>
        <h3>{stack.title}</h3>
      </div>
      <p>{stack.statement}</p>
      <div className="stack-panel-groups">
        {stack.groups.map((group) => (
          <div className="stack-panel-group" key={group.title}>
            <h4>{group.title}</h4>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}

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
          yPercent: index === 0 ? 0 : 100,
          zIndex: index === 0 ? 2 : 0,
        });
      });

      const firstParts =
        slideRefs.current[0]?.querySelectorAll(".slide-reveal");
      if (firstParts) {
        gsap.from(firstParts, {
          autoAlpha: 0,
          y: reduceMotion.current ? 0 : 30,
          duration: reduceMotion.current ? 0.01 : 0.7,
          stagger: reduceMotion.current ? 0 : 0.07,
          ease: "power3.out",
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
      const duration = reduceMotion.current ? 0.01 : 0.86;
      const currentParts = currentSlide.querySelectorAll(".slide-reveal");
      const nextParts = nextSlide.querySelectorAll(".slide-reveal");

      animating.current = true;
      activeSlideRef.current = nextIndex;
      setActiveSlide(nextIndex);

      gsap.set(nextSlide, {
        autoAlpha: 1,
        yPercent: direction * 100,
        zIndex: 3,
      });
      gsap.set(nextParts, {
        autoAlpha: reduceMotion.current ? 1 : 0,
        y: reduceMotion.current ? 0 : direction * 42,
      });

      gsap
        .timeline({
          defaults: { ease: "power3.inOut", overwrite: "auto" },
          onComplete: () => {
            gsap.set(currentSlide, { autoAlpha: 0, zIndex: 0 });
            gsap.set(currentParts, { autoAlpha: 1, y: 0 });
            gsap.set(nextSlide, { zIndex: 2 });
            animating.current = false;
          },
        })
        .to(
          currentParts,
          {
            autoAlpha: 0,
            y: -direction * 24,
            duration: reduceMotion.current ? 0.01 : 0.3,
            stagger: reduceMotion.current ? 0 : 0.025,
          },
          0,
        )
        .to(currentSlide, { yPercent: -direction * 100, duration }, 0)
        .to(nextSlide, { yPercent: 0, duration }, reduceMotion.current ? 0 : 0.04)
        .to(
          nextParts,
          {
            autoAlpha: 1,
            y: 0,
            duration: reduceMotion.current ? 0.01 : 0.5,
            stagger: reduceMotion.current ? 0 : 0.055,
            ease: "power3.out",
          },
          reduceMotion.current ? 0 : 0.3,
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
          y: 22,
          scale: 0.8,
          duration: 0.7,
          stagger: 0.07,
          ease: "back.out(1.7)",
        });
        gsap.to(tags, {
          y: (index) => (index % 2 === 0 ? -10 : 10),
          rotation: (index) => (index % 2 === 0 ? "+=2" : "-=2"),
          duration: (index) => 2.8 + (index % 3) * 0.42,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: { each: 0.14, from: "random" },
          delay: 0.85,
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
      aria-label="高级软件开发工程师纵向幻灯片简历"
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
      <header className="global-header">
        <button
          className="wordmark"
          onClick={() => goToSlide(0, -1)}
          aria-label="返回第一屏"
        >
          简历<span>°</span>
        </button>
        <div className="global-role">
          <i />
          高级软件开发工程师 · 人工智能与分布式系统
        </div>
        <div className="global-count" aria-live="polite">
          {String(activeSlide + 1).padStart(2, "0")} /{" "}
          {String(slideLabels.length).padStart(2, "0")}
        </div>
      </header>

      <section
        ref={(node) => {
          slideRefs.current[0] = node;
        }}
        className="resume-slide slide-hero"
        aria-hidden={activeSlide !== 0}
      >
        <div
          className="hero-stage"
          ref={sceneRef}
          aria-label="互动三维人物与个人特质"
        >
          <Canvas
            camera={{ position: [0, 0.12, 7.45], fov: 38 }}
            dpr={[1, 1.6]}
            gl={{ antialias: true, alpha: true }}
          >
            <Avatar accent={slideAccents[0]} />
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

        <aside className="profile-panel">
          <div className="profile-kicker slide-reveal">
            <span>01 / 职业定位</span>
            <span>可靠 · 可演进 · 能落地</span>
          </div>
          <div className="profile-copy">
            <h1 className="slide-reveal">
              高级开发
              <br />
              工程师
            </h1>
            <p className="profile-lead slide-reveal">
              把复杂业务需求，转化为可靠、可演进、能长期维护的软件系统。
            </p>
            <p className="profile-detail slide-reveal">
              具备扎实的后端与系统设计能力，也理解产品目标；能够从方案评审、核心开发一路推进到稳定上线。
            </p>
            <div className="profile-tags slide-reveal">
              <span>后端开发</span>
              <span>系统架构</span>
              <span>产品思维</span>
            </div>
          </div>
        </aside>
      </section>

      <section
        ref={(node) => {
          slideRefs.current[1] = node;
        }}
        className="resume-slide slide-overview"
        aria-hidden={activeSlide !== 1}
      >
        <div className="overview-layout">
          <div className="slide-heading slide-reveal">
            <span>02 / 核心能力</span>
            <h2>
              面向真实
              <br />
              <em>生产环境。</em>
            </h2>
            <p>
              不只实现功能，也关注系统在规模、故障、成本和长期演进中的表现。
            </p>
          </div>
          <div className="capability-grid">
            {capabilities.map((item) => (
              <article
                key={item.index}
                className="capability-card slide-reveal"
                style={
                  { "--card-accent": item.color } as React.CSSProperties
                }
              >
                <div className="capability-top">
                  <span>{item.index}</span>
                  <small>{item.type}</small>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <div>
                  {item.stack.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={(node) => {
          slideRefs.current[2] = node;
        }}
        className="resume-slide technology-slide"
        aria-hidden={activeSlide !== 2}
      >
        <div className="technology-layout">
          <div className="technology-heading slide-reveal">
            <span>03 / 技术栈矩阵</span>
            <h2>
              具体工具，
              <br />
              <em>服务工程目标。</em>
            </h2>
            <p>
              从语言、框架到中间件与观测平台，覆盖大型软件从开发到运行的完整链路。
            </p>
          </div>
          <div className="technology-grid">
            {technologyMatrix.map((group) => (
              <article
                key={group.index}
                className="technology-card slide-reveal"
                style={
                  { "--technology-accent": group.color } as React.CSSProperties
                }
              >
                <div>
                  <span>{group.index}</span>
                  <h3>{group.title}</h3>
                </div>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {[0, 2, 4].map((start, slideOffset) => (
        <section
          key={start}
          ref={(node) => {
            slideRefs.current[slideOffset + 3] = node;
          }}
          className={`resume-slide stack-slide stack-slide-${slideOffset + 1}`}
          aria-hidden={activeSlide !== slideOffset + 3}
        >
          <div className="stack-slide-inner">
            <div className="stack-slide-title slide-reveal">
              <span>0{slideOffset + 4} / 重点技术栈</span>
              <h2>{slideLabels[slideOffset + 3]}</h2>
              <p>从核心设计到工程实践，再到可以实际交付的成果。</p>
            </div>
            <div className="stack-pair">
              {deepStacks.slice(start, start + 2).map((stack) => (
                <StackPanel key={stack.index} stack={stack} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section
        ref={(node) => {
          slideRefs.current[6] = node;
        }}
        className="resume-slide project-slide"
        aria-hidden={activeSlide !== 6}
      >
        <div className="project-layout">
          <div className="project-heading slide-reveal">
            <span>07 / 代表项目类型</span>
            <h2>用指标定义交付。</h2>
            <p>
              以下为可承担的工程规模与目标口径；正式投递时建议替换为本人已脱敏的真实项目数据。
            </p>
          </div>
          <div className="project-grid">
            {projectCases.map((project) => (
              <article
                key={project.index}
                className="project-card slide-reveal"
                style={
                  { "--project-accent": project.color } as React.CSSProperties
                }
              >
                <div className="project-card-head">
                  <span>{project.index}</span>
                  <small>{project.subtitle}</small>
                </div>
                <h3>{project.title}</h3>
                <p>{project.text}</p>
                <div className="project-metrics">
                  {project.metrics.map((metric) => (
                    <div key={metric.label}>
                      <strong>{metric.value}</strong>
                      <span>{metric.label}</span>
                    </div>
                  ))}
                </div>
                <ul>
                  {project.duties.map((duty) => (
                    <li key={duty}>{duty}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={(node) => {
          slideRefs.current[7] = node;
        }}
        className="resume-slide method-slide"
        aria-hidden={activeSlide !== 7}
      >
        <div className="method-layout">
          <div className="method-title slide-reveal">
            <span>08 / 工程方法</span>
            <h2>
              从需求到上线，
              <br />
              <em>每一步都有依据。</em>
            </h2>
          </div>
          <div className="method-grid">
            {engineeringSteps.map((step) => (
              <article key={step.index} className="method-card slide-reveal">
                <span>{step.index}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={(node) => {
          slideRefs.current[8] = node;
        }}
        className="resume-slide final-slide"
        aria-hidden={activeSlide !== 8}
      >
        <div className="final-layout">
          <span className="final-index slide-reveal">09 / 个人档案与方向</span>
          <h2 className="slide-reveal">
            把复杂系统
            <br />
            <em>做对，做稳。</em>
          </h2>
          <p className="slide-reveal">
            春祥 · 高级软件开发工程师。期待参与需要系统思维、工程深度与人工智能能力的长期项目。
          </p>
          <div className="final-tags slide-reveal">
            <span>高级软件开发</span>
            <span>人工智能工程</span>
            <span>分布式架构</span>
            <span>高并发系统</span>
          </div>
          <div className="contact-strip slide-reveal">
            <div>
              <span>求职方向</span>
              <strong>高级软件开发 · 人工智能应用架构</strong>
            </div>
            <div>
              <span>工作方式</span>
              <strong>可远程协作 · 可深度参与长期项目</strong>
            </div>
            <div>
              <span>联系入口</span>
              <strong>请通过本简历发送渠道联系</strong>
            </div>
          </div>
          <div className="final-note slide-reveal">
            <span>当前方向</span>
            <strong>高质量交付 · 可持续演进 · 真实业务价值</strong>
          </div>
        </div>
      </section>

      <div className="slide-controls" aria-label="幻灯片导航">
        <button onClick={() => move(-1)} aria-label="上一屏">
          ↑
        </button>
        <div className="slide-progress">
          {slideLabels.map((label, index) => (
            <button
              key={label}
              className={index === activeSlide ? "is-active" : ""}
              onClick={() =>
                goToSlide(index, index > activeSlideRef.current ? 1 : -1)
              }
              aria-label={`查看“${label}”`}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => move(1)} aria-label="下一屏">
          ↓
        </button>
      </div>

      <div className="gesture-hint">
        <span>{slideLabels[activeSlide]}</span>
        <i />
        <span>滚动 / 滑动</span>
      </div>
    </main>
  );
}
