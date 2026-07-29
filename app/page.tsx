"use client";

import { useGSAP } from "@gsap/react";
import { ContactShadows, Float, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";

gsap.registerPlugin(useGSAP, Observer);

const slideLabels = [
  "个人定位",
  "工程主张",
  "技术体系",
  "高并发案例",
  "人工智能案例",
  "交付方法",
  "联系方向",
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
  { label: "调停者型人格", note: "性格", className: "trait-one", color: "#c7ff4a" },
  { label: "双鱼座", note: "星座", className: "trait-two", color: "#f4d84d" },
  { label: "人工智能原生", note: "思维", className: "trait-three", color: "#8a7dff" },
  { label: "系统设计", note: "专长", className: "trait-four", color: "#ff704f" },
  { label: "实干派", note: "风格", className: "trait-five", color: "#f5f0e7" },
] as const;

const technologyRows = [
  {
    label: "服务端",
    items: "Java 17 · Spring Boot 3 · Spring Cloud · Netty · Go · Python",
  },
  {
    label: "高并发",
    items: "Redis 集群 · Kafka · RocketMQ · Nginx · Sentinel · Dubbo",
  },
  {
    label: "人工智能",
    items: "LangChain · LlamaIndex · FastAPI · vLLM · Milvus · 向量检索",
  },
  {
    label: "云与数据",
    items: "Kubernetes · Docker · PostgreSQL · Elasticsearch · 可观测性",
  },
] as const;

const deliverySteps = [
  { index: "01", title: "澄清", text: "把模糊需求变成可验证目标" },
  { index: "02", title: "权衡", text: "在性能、成本与复杂度间取舍" },
  { index: "03", title: "构建", text: "把质量门禁放进研发过程" },
  { index: "04", title: "压测", text: "用数据定位瓶颈与容量边界" },
  { index: "05", title: "上线", text: "灰度、监控、告警与回滚" },
  { index: "06", title: "演进", text: "基于运行反馈持续改善系统" },
] as const;

type AvatarProps = {
  accent: string;
};

function Avatar({ accent }: AvatarProps) {
  const body = useRef<THREE.Group>(null);
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

  useFrame((state) => {
    if (body.current) {
      body.current.rotation.y = THREE.MathUtils.lerp(
        body.current.rotation.y,
        state.pointer.x * 0.16,
        0.045,
      );
      body.current.rotation.x = THREE.MathUtils.lerp(
        body.current.rotation.x,
        -state.pointer.y * 0.045,
        0.045,
      );
    }

    if (head) {
      head.rotation.y = THREE.MathUtils.lerp(
        head.rotation.y,
        state.pointer.x * 0.23,
        0.08,
      );
      head.rotation.x = THREE.MathUtils.lerp(
        head.rotation.x,
        -state.pointer.y * 0.13,
        0.08,
      );
    }

    for (const eye of [leftEye, rightEye]) {
      if (!eye) continue;
      eye.rotation.y = THREE.MathUtils.lerp(
        eye.rotation.y,
        state.pointer.x * 0.16,
        0.14,
      );
      eye.rotation.x = THREE.MathUtils.lerp(
        eye.rotation.x,
        -state.pointer.y * 0.11,
        0.14,
      );
    }
  });

  return (
    <>
      <ambientLight intensity={1.35} />
      <directionalLight position={[4, 6, 5]} intensity={3.6} color="#fff6e7" />
      <pointLight position={[-4, 1.5, 3]} intensity={18} color="#6f7dff" />
      <pointLight position={[4, -0.5, 2]} intensity={12} color="#c7ff4a" />

      <Float speed={1.15} rotationIntensity={0.045} floatIntensity={0.16}>
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
          <span>椿襄 / 软件开发工程师</span>
          <h1>
            让复杂系统
            <br />
            <em>可靠地运行。</em>
          </h1>
          <p>
            设计高并发后端、人工智能应用与可持续演进的软件架构。
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
          <span>系统设计</span>
          <span>高并发工程</span>
          <span>人工智能原生</span>
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
        <div className="scene-kicker slide-reveal">02 / 工程主张</div>
        <h2 className="manifesto-title slide-reveal">
          不炫技。
          <br />
          <em>解决问题。</em>
        </h2>
        <p className="manifesto-copy slide-reveal">
          我关注的不是技术名词本身，而是系统在流量、故障、成本和长期演进中，是否依然可控。
        </p>
        <div className="manifesto-principles slide-reveal">
          <span>
            <b>01</b>
            <strong>可靠</strong>
            故障有边界
          </span>
          <span>
            <b>02</b>
            <strong>清晰</strong>
            复杂有结构
          </span>
          <span>
            <b>03</b>
            <strong>演进</strong>
            变化有路径
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
          一套能打
          <br />
          <em>硬仗的工具。</em>
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
        <div className="scene-kicker slide-reveal">04 / 高并发案例</div>
        <div className="case-number slide-reveal">10万级</div>
        <div className="case-copy slide-reveal">
          <span>代表项目类型</span>
          <h2>高峰值交易服务</h2>
          <p>
            围绕热点隔离、异步削峰、多级缓存与故障降级，设计面向突发流量的核心交易链路。
          </p>
        </div>
        <div className="case-metrics slide-reveal">
          <span>
            <strong>百毫秒级</strong>
            核心链路延迟目标
          </span>
          <span>
            <strong>99.99%</strong>
            服务可用性目标
          </span>
          <span>
            <strong>全链路</strong>
            容量压测与故障观测
          </span>
        </div>
        <div className="case-stack slide-reveal">
          Java 17 · Spring Boot 3 · Netty · Redis 集群 · Kafka · Sentinel
        </div>
      </section>

      <section
        ref={(node) => {
          slideRefs.current[4] = node;
        }}
        className="resume-slide intelligence-slide"
        aria-hidden={activeSlide !== 4}
      >
        <div className="scene-kicker slide-reveal">05 / 人工智能案例</div>
        <div className="intelligence-copy slide-reveal">
          <span>企业智能知识中台</span>
          <h2>
            让模型回答，
            <br />
            <em>也让答案可信。</em>
          </h2>
          <p>
            将分散文档、业务系统和工具能力接入统一智能入口，建立可追溯、可评测、可治理的知识服务。
          </p>
        </div>
        <div className="ai-orbit slide-reveal" aria-label="人工智能工程链路">
          <div className="orbit-ring ring-a" />
          <div className="orbit-ring ring-b" />
          <strong>90%+</strong>
          <span>引用命中目标</span>
          <i className="ai-node node-one">检索</i>
          <i className="ai-node node-two">重排</i>
          <i className="ai-node node-three">评测</i>
          <i className="ai-node node-four">护栏</i>
        </div>
        <div className="intelligence-stack slide-reveal">
          LangChain · LlamaIndex · FastAPI · vLLM · Milvus · 可观测智能体
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
          从需求到上线，
          <br />
          <em>每一步都有依据。</em>
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
        <div className="scene-kicker slide-reveal">07 / 联系方向</div>
        <h2 className="final-title slide-reveal">
          一起做点
          <br />
          <em>难而正确的事。</em>
        </h2>
        <p className="final-copy slide-reveal">
          椿襄 · 高级软件开发工程师
          <br />
          期待参与需要系统思维、工程深度与人工智能能力的长期项目。
        </p>
        <div className="final-contact slide-reveal">
          <span>
            <b>求职方向</b>
            高级软件开发 · 人工智能应用架构
          </span>
          <span>
            <b>工作方式</b>
            可远程协作 · 可深度参与长期项目
          </span>
          <span>
            <b>联系入口</b>
            请通过本简历发送渠道联系
          </span>
        </div>
        <div className="final-signature slide-reveal">可靠 · 清晰 · 可演进</div>
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
