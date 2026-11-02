# 手绘场景 · 可交互空间深化

2026-11-02。用户认为10-31版本仍像静态图片，明确要求拆出可交互元素、明显2.5D/3D与更有表现力的动画。本轮延续手绘方向和事实顺序，保留原羽毛球场景。

## 实现

- `ForestStage`：天空仍是远景底图；新增独立透明远云、近云和枝叶。相机、滚动、指针、环境风、角色问候各用独立wrapper，避免多个动画争写同一transform。整头yaw±17°/pitch±9°，人物、云、枝随指针差速位移；滚动推动CSS透视相机。角色有可见呼吸和轻歪头。
- 角色本身是可访问button，鼠标/触屏/Enter/Space触发压缩、跳起、落地、点头和问候。复用预建timeline，屏幕阅读器有status。减少动态模式只显示静态问候。
- `PaperFlight`：机翼在共同折线上连接；独立正反面、机腹和叶枝位于CSS三维空间。滚动可逆地控制接近、侧倾和飞离；悬停转向，点击/Enter进行一圈翻滚。无需点击即可看到滚动运动。
- 两组件重复动画在离屏/后台暂停；GSAP context在卸载、减少动态切换时清理。指针复用quickTo，无React逐帧更新。触屏通过`pan-y pinch-zoom`保留纵向滚动与双指缩放（源代码独立审查发现原pan-y禁用pinch后已修正）。
- 主页面ResizeObserver刷新改为`ScrollTrigger.refresh(true)`，避免在原生锚点平滑跳转期间同步刷新。字体ready回调增加alive检查。依据[GSAP safe refresh](https://gsap.com/docs/v3/Plugins/ScrollTrigger/refresh%28%29/)。
- CSS3D中间容器保留preserve-3d，裁剪与透明度放在叶节点；[MDN变换扁平化规则](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style)供后续维护参考。角色仍是插画切层，不声称为解剖三维模型；纸飞机是CSS折面对象。

## 新素材与完整提示词

内置imagegen，未使用CLI或API密钥。以下PNG保留原件，cwebp q86/alpha100只转换格式，透明WebP随站点发布。

### 云层

- 原件：`/Users/chunxiang/.codex/generated_images/01a16d38-8782-7df3-8b90-1519f6da9330/exec-9c269f0c-c746-49da-9a37-b77416ec5a26.png`
- 项目：`pages-site/public/assets/story-cloud.webp`
- 参考：`story-landscape.webp`，先查看后编辑，transparent_background=true。

> Use case: background-extraction. Asset: transparent independent cloud layer for a hand-painted animation website. Reference is existing landscape; extract/reconstruct a SINGLE elegant long cumulus cloud bank matching its gouache brushwork, ivory sunlit scalloped tops, cool blue translucent underside. Wide horizontal composition, isolated and fully contained with generous transparent margin, actual alpha everywhere outside cloud, no sky or landscape. Keep detailed painterly edges and gentle volumetric light. Only one cloud bank, no text, no border. This will move as a separate depth layer, so no rectangle backdrop.

### 前景枝叶

- 原件：`/Users/chunxiang/.codex/generated_images/01a16d38-8782-7df3-8b90-1519f6da9330/exec-d6dadd14-ea2c-443a-b88f-2ae6ff97350a.png`
- 项目：`pages-site/public/assets/story-branch.webp`
- 同一风景参考，transparent_background=true。

> Use case: compositing. Asset: one transparent hand-painted foreground tree sprig for this existing landscape website. Match the reference's gouache animation brushwork. Isolate a graceful thin curved branch entering from the upper-right corner and sweeping toward lower-left, with 12-18 distinct large green leaves, some blue-green shaded backs, golden sunlit edges, twigs visible and open breathing space between leaves. Only branch and leaves on genuine transparent alpha, no sky/landscape/floor, no rectangular backdrop, no text. Refined close-up botanical painting, foliage should be airy not a dense bush. Square canvas, fully contained leaf tips except branch root at upper-right. Will sit at the right edge as an interactive nearest depth layer; avoid covering the center.

## 验证

原体育与运行时14项回归测试通过；完整Vite构建通过。初次联调Chrome已观察到真实指针改变头部与枝叶不同的matrix3d、角色问候status和折面纸飞机，控制台无warn/error。正式独立审查、性能采样、发布结果另行追加，不能沿用旧版本PASS。

### 最终独立验收与采样

独立评审见`interactive-depth-review.md`，新模块的实际指针、鼠标/键盘回应、390/320、实际200%、真实reduce媒体偏好与离屏暂停通过，无剩余P1/P2。后台hidden事件和真实手机双指未实测，源码已检查对应清理/暂停和touch-action策略，不冒称实机通过。

Chrome1200×940/DPR2，同一生产构建，19秒正反合成滚动。四轮原始JSON保存于`outputs/performance/interactive-depth-run-{1,2,3,4}.json`，均valid/authoredTransforms=true。rAF p95依次9.3/9.3/9.3/9.1ms；>50ms间隔1/10/1/5次。不能将rAF称为GPU FPS，也不能只挑最好一轮声称零卡顿。

第2轮出现9个longtask（最高296ms），因此关闭额外预览页、重载并为诊断增加LoAF脚本来源后再做第3/4轮。第3轮无longtask、1个无脚本归因的104.5ms LoAF；第4轮有4个52–65ms longtask，4个LoAF中3个将约49–59ms归到本地`performance-probe.js`的主动scrollTo回调，没有将该归因等同于证明页面本身无成本。四轮体育区均无>50ms间隔。测试数据存在波动，未取得GPU trace或弱设备证据；实际视觉滚动验收未发现持续阻塞。诊断脚本只在本地副本中，不进入部署。

最终构建入口`index-CE0nCpGW.js`，gzip125.95KB；新增交互相比10-31主入口增加约2.2KB gzip。CSS gzip8.42KB。新云/枝素材合计约512KB。原体育包和正常画质未改。
