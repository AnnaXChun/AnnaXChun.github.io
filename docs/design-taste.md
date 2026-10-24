# 椿襄个人网站 · Design taste

更新：2026-10-24。本轮用户的新要求覆盖同日较早的蓝白 3D 方案与顶部导航尺寸决策。

## 当前定位与内容顺序

这是个人展示页，重点是设计感、创新和真实工作。职业定位固定为 **Agent 开发、后训练算法工程师**。

1. 个人姓名与职业定位。
2. 后训练：现有 SFT / GRPO、veRL 与生命科学推理智能体项目。
3. 字节跳动国际商业化部门的 Agent 开发实习。
4. 竞赛与团队成果，保留大幅真实材料。
5. 生活与联系。

项目详录同样把后训练项目排第一并默认展开，字节实习第二。未经用户提供，不编造实习日期、具体业务、团队、性能指标、论文录用或成果提升数字；已有代码库中的项目描述与用户确认的事实分开核对。当前只确认字节部门与 Agent 开发实习岗位。

## 视觉方向

- **删除顶部 banner 整个容器。** 不再恢复品牌导航条，也不添加阅读模式、播放完整旅程等无关功能。
- 用闽南古厝水墨插画替代蓝白 3D 建模：燕尾脊、红砖、白石、淡墨、宣纸留白。
- 纸白 `#f7f4eb`、墨色 `#2c302c`、低饱和砖红 `#a34f3e`；辅助色保持同一暖灰体系。
- 大标题以宋体类衬线字体呈现，正文用清晰的无衬线字体。姓名有独立尺寸，不套用所有章节。
- 插画与页面通过渐隐遮罩连接，不露出硬矩形背景。插画不能压到正文。
- 以轻微移景、墨色淡入组织叙事；不重新搭建旋转积木、办公楼或模型底座。
- 参考图、素材出处和生成提示词见 [minnan-art-direction.md](./minnan-art-direction.md)。插画不冒充本人的建筑作品。

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
- 已移除 Film 对 Three.js 建筑、相机和 WebGL 的使用。旧模块暂存但不进入当前站点 bundle。
- 资料事实集中于 `src/data.js`；无 JavaScript 备用页由 `scripts/build-profile.mjs` 在构建时同步，避免职业与经历存在两套旧文案。
- `prefers-reduced-motion` 自动提供静态介绍与完整资料，不增加模式按钮。
- 保留证书预览、Escape 关闭及焦点返回。

## 参考调研的可复用判断

- [React Bits](https://reactbits.dev/)、[Aceternity Hero Parallax](https://ui.aceternity.com/components/hero-parallax)：借鉴空间层次与节奏，不能因为组件可用就堆叠功能。
- [Uiverse](https://uiverse.io/)、[Anime.js](https://animejs.com/documentation/)、[MotionSites](https://motionsites.ai/)：局部视觉与动效参考，不将营销数量或商业页面作为规范。
- [IBM Carbon Typography](https://carbondesignsystem.com/elements/typography/type-sets/)：expressive 的 16px 正文与流式标题作为可读性参考。
- [W3C Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)、[Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)：用真实缩放、重排检查内容，不能靠压缩字号塞满画面。

## 验收

使用 **Google Chrome 实际窗口**，应用内侧栏不能作为比例验收。先检查桌面 100%，再检查 200% 和 390 × 844、320 × 568。区分截图物理像素与 CSS 视口，不把 Retina 截图尺寸当作页面宽度。

检查首页职业定位、后训练、实习、成果、生活、详录与联系；不得文字相撞、标题切断或出现横向溢出。执行 `npm run build:pages` 和 `git diff --check`，保存 Chrome 截图。只报告实际测过的状态，设备模拟不能写成真机测试。

本轮于 2026-10-24 在 Google Chrome 完成以下检查：

- 桌面 100%：首屏姓名、职业与水墨画；后训练重点章节；项目详录默认展开后训练项目，并能展开字节实习。
- 桌面 200%：后训练正文、标题与章节导航没有相互遮挡。
- 设备模拟 390 × 844：后训练章节；320 × 568：首屏、后训练、实习与成果章节，图文与底部导航分开。
- Chrome 的 `prefers-reduced-motion: reduce` 模拟能自动切换到静态介绍与完整资料；检查后恢复模拟设置。独立 `profile.html` 中职业、项目顺序、字节实习已同步。
- `npm run build:pages` 与 `git diff --check` 通过。构建仍有 Remotion 的模块指令与大于 500 kB 的 bundle 提示；控制台出现的连接错误指向 Zotero 扩展，不是站点源码。

本轮截图位于本地 `outputs/visual-review/chrome-ink-*.png`。以上是 Chrome 桌面与设备模拟检查，不代表手机真机验证。
