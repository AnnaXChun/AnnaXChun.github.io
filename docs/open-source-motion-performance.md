# 滚动与三维性能：第一方实现调研

日期：2026-10-27。状态：**研究完成，性能与部署验收待实测**。上轮视觉 PASS 不覆盖本轮低帧率反馈。本次只读代码和官方网页，没有操作 Chrome，也没有采集新的 FPS。

## 建议先做的改变

把发布站的滚动入口从 Remotion Player 改为 **ScrollTrigger → 连续进度通道 → DOM / Three.js 直接订阅**。保留现有 Three.js 模型、材质、镜头、Cannon 物理和前景 / 背景缓存，不为性能整体迁移 R3F。先完成这个可测的小范围替换，再根据 Chrome trace 判断剩余瓶颈；暂不再叠加 Lenis。

这项建议是依据当前调用链和下面官方模式作出的工程判断，**不是“换库必然达到 60 FPS”的承诺**。GPU 像素量、透明透射、反射、多 pass、首次模型上传与字形构建不会被滚动库自动解决。

## 本地证据及版本边界

先按 codebase-memory 查询 Story / Film / MinnanScene；索引的符号行号已经落后于共享工作树，所以进一步读取精确文件，并用 `git show 2e3a9b3:…` 固定旧版证据。调研期间主代理已开始实现 ScrollTrigger；不能把正在修改的工作树误写为旧版基线。

旧版 `App.jsx` 的 `updateFromScroll` 在滚动 rAF 中读取 story、stage 的 `getBoundingClientRect()`，将比例 `Math.round()` 为整数帧，再调用 `Player.seekTo(frame)`。`Film.jsx` 在顶层 `useCurrentFrame()`，将 frame 传给标题、正文、证书与两个场景；每次变化会重算整套 JSX / 内联样式。进度条还通过 `width` 更新。这里存在可消除的布局读取、进度量化与 React 调度工作，但未凭代码断定哪一项占比最大。

`FPS=30` 决定旧开场播放时基，**不能据此声称手动 seek 的滚动动画被硬限为 30 FPS**。滚动路径的确切问题是整数取整与更新链，实际呈现帧率须测量。

现有 `SceneRuntime.js` 已有请求合并、ResizeObserver、IntersectionObserver、隐藏暂停和 2.8 MP 像素预算；MinnanScene 已缓存主建筑 / 倒影，停滚只继续前景风。应保留这些已有机制。持续环境风、1/60 物理步长与滚动镜头是不同的时间来源，不能为了统一调度而把停滚后的风也冻结。

## 五个直接可复用的第一方方案

| 方案 | 已核对的一手模式 | 本站采用范围 | 许可证 |
| --- | --- | --- | --- |
| [GSAP / ScrollTrigger](https://github.com/greensock/GSAP) | 起止位置在创建 / refresh 时计算；滚动更新合并到刷新周期；`scrub` 把一个 tween 连到原生滚动位置 | 替换 Player 驱动；CSS sticky 已能固定舞台时无需再加 pin；只在字体 / 真实布局变化时 refresh | [Standard No Charge](https://gsap.com/community/standard-license/)，允许一般个人 / 商业网站；有竞争性可视化构建工具限制。**不是 MIT，也不应称 OSI 开源** |
| [Lenis](https://github.com/darkroomengineering/lenis) | 手动 `raf` 可加入 GSAP ticker；React 示例明确 `autoRaf:false` 并清理 ticker | 仅当原生 wheel 与画面同步仍有可见问题时做 A/B；不作为第一轮必装依赖 | [MIT](https://github.com/darkroomengineering/lenis/blob/main/LICENSE) |
| [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | `frameloop="demand"`、`invalidate()` 合并脏请求；高速数值直接 mutate ref；复用 mesh / material | 借调度、状态分离、资源复用原则，保留原生 Three.js；不迁移已精修模型和镜头 | [MIT](https://github.com/pmndrs/react-three-fiber/blob/master/LICENSE) |
| [Drei PerformanceMonitor](https://github.com/pmndrs/drei/blob/master/src/core/PerformanceMonitor.tsx) | 多个时间窗口取平均；上下阈值形成滞回；超过 flipflop 上限退回稳定档位 | 若实际 GPU 瓶颈成立，用稳定档位调整渲染分辨率 / 次要效果，不按每帧耗时反复重分配 RT | [MIT](https://github.com/pmndrs/drei/blob/master/LICENSE) |
| [Three.js](https://github.com/mrdoob/three.js) | 官方按需绘制示例以请求标记合并 rAF；`compileAsync` 预编译；多 pass 的统计统一 reset | 现有渲染器继续使用；补首入章预热、重绘失效条件与正确测量口径 | [MIT](https://github.com/mrdoob/three.js/blob/dev/LICENSE) |

以上选择依据官方实现与项目适配，不以未经核对的 star 数作为性能证据。MIT 项目的复制代码 / 分发须保留其版权与许可文本；GSAP 依照自己的许可。许可表记录本次读取结果，不是法律意见或版本升级后的自动授权结论。

### 1. ScrollTrigger：缓存布局，连续进度，清理生命周期

[官方文档](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)说明，start / end 不在每个 tick 重新检查元素位置；resize / refresh 才重算。本站只需要一个进度驱动器，标题与 WebGL 消费同一份值。避免为每片叶、每个物件分别创建 ScrollTrigger。

以下为本站适配示意，非复制官方源码：

```js
const playhead = {frame: INTRO_END_FRAME};
const context = gsap.context(() => {
  gsap.to(playhead, {
    frame: LAST_FRAME,
    ease: 'none',
    onUpdate: () => motion.setFrame(playhead.frame),
    scrollTrigger: {
      trigger: story,
      start: 'top top',
      end: () => `+=${story.offsetHeight - stage.offsetHeight}`,
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
}, story);
// 组件退出时 context.revert(); 取消监听与动画。
```

`scrub:true` 是直接跟随；数值 scrub 是追赶时间，会在停止输入后继续靠近目标，不应把它叫作性能优化。若用很短的平滑尾段，需要验反向、触摸、快速切章，以及字形碰撞体是否在标题稳定后才采样。所有镜头 / 挥拍保持由连续进度求值，最终停留位置不因历史路径改变。React state 仅用于章节、素材首次就绪等低频事件；进度条用 `scaleX`，不反复改宽度。

### 2. Lenis：只有一个输入平滑层，避免重复循环

[官方 README](https://github.com/darkroomengineering/lenis/blob/main/README.md)和 [React 集成](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md)给出 `lenis.on('scroll', ScrollTrigger.update)`、`gsap.ticker.add(time => lenis.raf(time * 1000))`。手动 ticker 与 `autoRaf` 不能同时开；清理时移除同一个回调并销毁实例。单位是 GSAP 秒 → Lenis 毫秒。

**判断：暂不安装。** 现有问题包含重场景与 React 热路径，平滑输入并不减少它们。也不要把 Lenis lerp、数值 scrub、自定义 camera lerp 三层同时叠加。若后续试用，保留原生触摸 / 键盘、锚点和弹窗滚动，明确处理 reduced motion；本文不假定未来或旧安装版本与本次最新 README 的默认选项完全相同。

### 3. R3F：借用按需绘制和 ref 更新，不做整栈迁移

[Scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)与 [loop.ts](https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/src/core/loop.ts)展示了 dirty flag 模式：多次 invalidate 只请求下一帧，无活动 root 则停止循环。[Performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)明确将快速动画留在渲染循环中直接改对象，避免 setState、循环创建 Vector、不断挂载 / 卸载复杂场景。

本站可将每次滚动变为 `currentFrame = value; runtime.request()`，在真正的 draw 内取最新 frame；同一浏览器帧只绘制一次。DOM 也直接写缓存的元素引用。保留生活场景首次懒加载、后续挂载缓存、inactive 暂停 / 缩小目标；不要来回切章反复解析 GLB 和编译材质。单一写入者管理每个 DOM 属性和 Three 对象，避免 React 与命令式更新互相覆盖。

**判断：无需引入 R3F runtime。** 现有原生 Three 渲染器已实现大部分同等原则。重新迁移会引入光照、透明排序、资源释放和固定路径回归，不能凭框架名称预测收益。

### 4. Drei：用滞回做质量档位，不把空闲帧率当故障

[PerformanceMonitor 文档](https://drei.docs.pmnd.rs/performances/performance-monitor)及其[实现](https://github.com/pmndrs/drei/blob/master/src/core/PerformanceMonitor.tsx)通过多次窗口平均才触发质量变化；上下界之间不调整，反复振荡则固定 fallback。

本站风本来只需约 30 Hz，体育停滚按需不画，所以**不能将这些时段的“低 FPS”输入降质判断**。只在可见、连续滚动且完成首次加载 / 编译的窗口评估。优先按稳定档位降低像素预算、反射 / 次要阴影分辨率，保留前景叶片体积、字面接触影与用户认可的羽毛球材质。每次档位变化才重配目标，设冷却与滞回；不在快速滚动中不断 setSize。

### 5. Three.js：按需重绘、预热与多 pass 账目

[Rendering on Demand](https://threejs.org/manual/pages/rendering-on-demand.html)使用 `renderRequested` 防止相同事件批次重复提交。本站已有对应实现，应检查 scroll、pointer、素材完成、resize、风是否都经过同一合并入口；纹理异步完成必须补画，后台恢复不累计长 delta。

[WebGLRenderer 文档](https://threejs.org/docs/pages/WebGLRenderer.html)的 `compileAsync(scene,camera)` 可在灯光 / 环境 / 材质配置完成后预编译，优先缓解首次进入体育的 shader stutter；不是消除所有 GPU 上传开销。文档也提供 `transmissionResolutionScale`，本站已有缩小透射目标，应保留并视觉回归。多 pass 开启 `renderer.info.autoReset=false`，一次完整帧后再 reset，避免只统计最后一个后处理 pass。`info.memory` 是资源数量，不是显存字节。

## Remotion 是否继续作为发布站 host

**建议移出交互网站的运行时，保留需要的视频导出工具独立入口。**

一手事实：Remotion 的 [Player 源码](https://github.com/remotion-dev/remotion/blob/main/packages/player/src/Player.tsx)以 React state 保存 frame，并据此生成 timeline context；[官方 Player 性能建议](https://www.remotion.dev/docs/player/best-practices)也要求隔离频繁更新的 UI，减少 Player 重渲染。它面向 React 视频 / 时间轴，存在合理使用场景，本文不把它笼统评价为慢库。

本站的实际需求是滚动网站：原生页面尺寸、DOM 正文、直接更新 Three 相机、另一条持续物理风时钟，没有必须依靠播放器提供的音视频同步、视频播放控件或媒体导出语义。旧 `Film` 顶层读当前 frame 使整个展示树参与高频更新，因此外部进度通道更贴近需求。只给 Player 外面加 `memo` 无法阻止内部 current-frame context 的消费更新。

保留纯函数 `frame → camera / shot / chapter opacity`，这样现有接拍、穿门和反向测试继续适用；数字可以仍叫 frame，但允许小数，不再要求视频整数时间轴。静态阅读、章节导航和辅助技术文本继续由 React 渲染。视频工具若保留，要与 `pages-site` 的生产包分开。

Remotion 本身使用 [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)，不是 MIT；个人等符合条件的主体可免费使用，商业组织资格另有条件。本次迁移理由是架构适配，不以许可作为性能理由。

## 可检验的改进顺序

1. **先隔离热路径。** 同一画面 / 视口对照旧 Player 版与 ScrollTrigger 版；记录滚动期间 React commit、主线程长任务和 frame pacing。章节不变时不应再有整棵 Film 的逐帧 React 更新。
2. **再分清一次性与持续开销。** 冷启动、第一次入研究、第一次入体育单独记录；与模型 / shader 已就绪后的持续滚动分开。字形采样、轮廓生成、GLB parse / upload、shader compile 应从 trace 找证据，不因名字像瓶颈就下结论。必要时将纯字形几何构建移 worker，DOM / Canvas 字形测量仍留主线程且只在字体或稳定落点变化时执行。
3. **检查 GPU 路径。** 固定相同 DPR、CSS 视口、滚动路径、模型状态，检查 render calls / triangles / target 尺寸和各 pass。如果 CPU 明显下降而呈现仍卡，再试稳定的像素档位；不先粗暴删去认可的主体细节。
4. **检查调度边界。** 风保持持续，主建筑 / 倒影缓存计数停住；生活停滚无重复 WebGL draw；离屏 / hidden / reduced motion 暂停。章节反向、文字稳定承托 30 秒、触屏和 keyboard scroll 都保留。
5. **部署后复核真实文件。** 远程 HTML 引用新 hash、主 bundle 没有意外带入 Player；正常缓存刷新与首次资源加载都能进入场景。部署状态与在线可访问不能替代性能测试。

测量报告必须同时标注设备、Chrome 版本、CSS 视口 / DPR、实际缩放、冷热缓存、观察时长和采样动作。`performance.now()` 包围 JS 更新 / render 调用只测 CPU 提交时间；rAF 间隔是主线程调度观测，不能当作精确的 GPU 呈现帧率。Chrome Performance 的帧轨迹 / 可见动画与这些统计一起判断，不将旧 30 Hz 环境目标当作性能失败。

## 本轮范围

- 已完成：五类第一方实现 / 许可核对、旧版本调用链与正在迁移的工作树分离、可采纳模式与验收方案。
- 后续已完成：2026-10-27—28独立Chrome视觉与交互验收，发现并关闭整串transform未生效、成果运动包络重叠，详见[评审记录](./portfolio-research-review.md)。性能A/B与部署由主代理执行；本文未测真机弱GPU、弱网或长时间显存泄漏，不沿用上轮审美PASS替代性能结果。

## 代码独立审查：滚动驱动与 worker

2026-10-27，审查当时未提交的 App / Film / StoryMotion / SceneRuntime / GlyphShelves 及场景接入代码；没有操作 Chrome，没有修改生产文件。

**发现一项 P2，现已修复：固定 60 Hz 上限在非整倍屏幕刷新率下降为更低节拍。** 原判断为 `now-lastDraw < 1000/maxFps-.5`，绘制后直接 `lastDraw=now`，丢掉节拍余数。对实际 `createSceneRuntime` 注入连续 5 秒假 rAF 时间戳、每个回调前发出滚动 request：60 / 75 / 90 / 120 / 144 Hz 分别得到 60 / 37.6 / 45 / 60 / 48 次绘制每秒。主代理已改为保留余数的deadline、后台恢复重置，并增加同五组刷新率回归，各5秒299–301次draw，完整28项测试通过。该项关闭；本节数字是调度单元复现，不是浏览器FPS。

其余已读路径暂未发现代码级阻断：fromTo 固定原始起点、避免 refresh 从中途重新起算；Film / 场景订阅会清理；快速更新取最新 frame；worker 回包按当前 parts 重新组装，不把旧章节装回；32 个字形模板上限和淘汰释放、worker terminate / fallback timer 清理已实现。相邻章保留目标但停止绘制并清空时钟基准；离屏 / hidden 缩小目标。当前固定标题集合的可见字形数低于缓存上限。

这不替代运行验证：响应式 refresh 后实际 DOM / 三维字面一致、数值 scrub 尾段与碰撞采样、首次体育预热效果仍须 Chrome 检查。本轮代码审查不授予视觉或性能 PASS。
