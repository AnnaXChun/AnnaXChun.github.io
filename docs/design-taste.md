# 椿襄个人网站 · Design taste

更新：2026-10-24。用户最新澄清覆盖同日较早的二维水墨方案：水墨是材质与气质，建筑必须保持真实三维，且有推拉、绕行、进入建筑的镜头转场。

## 当前定位与内容顺序

这是个人展示页，重点是设计感、创新和真实工作。职业定位固定为 **Agent 开发、后训练算法工程师**。

1. 个人姓名与职业定位。
2. 后训练重点：OPD + RL 智能体后训练、开源 benchmark SOTA 经历。
3. 字节跳动国际商业化部门的 Agent 开发实习。
4. 竞赛与团队成果，保留大幅真实材料。
5. 生活与联系。

项目详录同样把 OPD + RL 排第一并默认展开，字节实习第二；原有 SFT / GRPO 生命科学推理项目作为独立第三项。用户确认：字节实习为 **2026.09.20 — 至今**，部门为国际商业化，涉及 Claude Code 内核接入公司内部 Agent、业务流程适配、Skill 优化与 Bad Case Studio。用户要求后训练以经历概述呈现，不需要具体 benchmark 名称与成绩。保留其确认的 SOTA 表述，不添加榜单、分数、提升比例或论文录用信息，也不反复追问。

## 视觉方向

- **删除顶部 banner 整个容器。** 不再恢复品牌导航条，也不添加阅读模式、播放完整旅程等无关功能。
- 用真实三维的闽南古厝替代蓝白建筑：燕尾脊、红砖、白石、院落、榕树；以淡墨材质、轮廓线、干湿颗粒和宣纸留白呈现。
- 纸白 `#f7f4eb`、墨色 `#2c302c`、低饱和砖红 `#a34f3e`；辅助色保持同一暖灰体系。
- 大标题以宋体类衬线字体呈现，正文用清晰的无衬线字体。姓名有独立尺寸，不套用所有章节。
- 三维画面与页面通过渐隐遮罩连接，不露出硬矩形背景，也不能压到正文。
- 镜头有明确空间路径：远景俯瞰 → 绕行与靠近 → 穿过门楼 → 庭院近景 → 抬升拉远。必须改变相机的世界坐标与朝向，产生真实透视、遮挡和景深层次；不能用二维图片缩放、平移替代。
- 参考图、素材出处和三维实现见 [minnan-art-direction.md](./minnan-art-direction.md)。这是网站视觉场景，不冒充本人的建筑项目成果。

## 尺寸与层级

以下是本项目基线，不是通用强制标准。

| 元素 | 桌面 | 手机 |
| --- | --- | --- |
| 姓名 | 88–144px | 60–80px |
| 章节标题 | 44–80px | 30–48px；横向短屏可 28px |
| 职业定位 | 20–28px | 18px |
| 正文 | 16–20px，行高约 1.75–1.9 | 16px，不随画布缩小 |
| 次级信息 | 14px 为主 | 13–14px，非核心标注可 12px |
| 主要控件 | 至少 44px 高 | 至少 44px 高 |
| 成果图组 | 接近半屏，主辅宽度约 1.65:1 | 约占 84% 视口宽，位于正文上方 |

优先给核心内容面积与对比度，不用整体缩小来适配。短屏可以隐藏重复说明，关键职业定位、正文和成果名称必须可读。真实证书使用 contain，禁止裁切或生成替代品。

## 技术约束

- 当前站点入口是 `pages-site/`。根目录 `app/` 是旧站，不用于当前视觉修改。
- Remotion composition 尺寸等于容器真实 CSS 视口，不回到固定 1440/720px 画布缩放。
- `MinnanModel.js` 建立实体屋顶、燕尾、门洞、回廊、墙体、石院和榕树，按材质合并批次；不使用水墨图片平面。`MinnanScene.jsx` 负责 WebGL 资源与尺寸变化，`MinnanCamera.js` 定义滚动对应的推拉、穿门与抬升路径。旧蓝白 `WorkshopModel` / `CameraRig` 不进入当前页面。
- 相机穿门时取消鼠标摇摆与响应式距离倍增，防止路径被拉出门洞；窄屏保留同一空间行程。材质和模型只初始化一次，逐帧只更新相机和绘制。
- 资料事实集中于 `src/data.js`；无 JavaScript 备用页由 `scripts/build-profile.mjs` 在构建时同步，避免职业与经历存在两套旧文案。
- `prefers-reduced-motion` 自动提供静止的同一三维建筑与完整资料，不增加模式按钮，也不换回二维画。
- 保留证书预览、Escape 关闭及焦点返回。

## 参考调研的可复用判断

- [React Bits](https://reactbits.dev/)、[Aceternity Hero Parallax](https://ui.aceternity.com/components/hero-parallax)：借鉴空间层次与节奏，不能因为组件可用就堆叠功能。
- [Uiverse](https://uiverse.io/)、[Anime.js](https://animejs.com/documentation/)、[MotionSites](https://motionsites.ai/)：局部视觉与动效参考，不将营销数量或商业页面作为规范。
- [IBM Carbon Typography](https://carbondesignsystem.com/elements/typography/type-sets/)：expressive 的 16px 正文与流式标题作为可读性参考。
- [W3C Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)、[Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)：用真实缩放、重排检查内容，不能靠压缩字号塞满画面。

## 验收

使用 **Google Chrome 实际窗口**，应用内侧栏不能作为比例验收。先检查桌面 100%，再检查 200% 和 390 × 844、320 × 568。区分截图物理像素与 CSS 视口，不把 Retina 截图尺寸当作页面宽度。

检查首页职业定位、后训练、实习、成果、生活、详录与联系；不得文字相撞、标题切断或出现横向溢出。执行 `npm run build:pages` 和 `git diff --check`，保存 Chrome 截图。只报告实际测过的状态，设备模拟不能写成真机测试。

当前三维版本的 Chrome 检查与截图记录见 [minnan-art-direction.md](./minnan-art-direction.md)。同日早先 `chrome-ink-*.png` 是已被替换的二维方案，不作为新版视觉证据。设备模拟不能写成真机验证。
