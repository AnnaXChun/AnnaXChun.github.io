# Retro-Futurist 重构实现与交付

2026-10-28—29。用户明确推翻前半站，指定 [MotionSites Retro-Futurist](https://motionsites.ai/?prompt=retro-futurist)，随后补充整颗头随鼠标注视的2.5D效果、其他章节也需相应的空间设计。

## 参考与转译

Chrome 实际观看公开 animated WebP：大 CRT 头部人像、灰摄影底、左侧黑字与白 pill。不是可操作原站，没有取得付费源码。首屏使用原创新摄影素材的分层来实现参考的注视感觉，非低模重画，也不宣称照片是实时3D。

- 独立 body / head / glass / eyes 深度层；颈部为旋转轴，yaw ±13°、pitch ±8°，身体跟随幅度为头部25%，眼睛响应稍快，移出回中。指针事件不做 React 更新；使用 GSAP quickTo 的有界缓动。触屏保留原生滚动，reduce关闭跟随。
- 研究：OPD + RL 巨字作为后景，银质磁带盘随滚动旋转、随指针倾斜，SOTA章在前景。纯视觉隐喻，不伪造训练数据。
- 实习：四项真实工作在有前后层次的文件卡中展开；标题与事实直接阅读，非假终端或产品UI。
- 成果使用真实证书，完整档案可预览，Escape/焦点返回。About保留真实原有插画肖像。
- SportChapter 将原1050–1559镜头分数单独绑定原生滚动；原模型、光影与击球轨迹保留。新1440×960入口发现腕根后，仅加强已有shader下缘渐隐，未减模型精度。
- 旧庭院与cannon/字形Worker不进入生产入口。首包JS约123KB gzip；体育及Three是独立懒加载chunk。首屏三维WebGL数为0；不能把静态包体/任务时序称为GPU FPS。

## 原创图片

均通过内置 `image_gen`，没有使用CLI或外部API密钥。生成PNG原件保留在Codex生成目录；项目引用副本为WebP，不引用临时路径。

| 路径 | 用途 | 实际大小 |
| --- | --- | --- |
| `pages-site/public/assets/retro-agent.webp` | CRT头的摄影原图，CSS沿轮廓裁出独立头层 | 约245KB |
| `pages-site/public/assets/retro-body.webp` | 去除电脑头并补完整领口的干净身体层 | 约192KB |
| `pages-site/public/assets/retro-reel.webp` | 研究前景银色磁带盘 | 约257KB |

### 最终生成 prompt

**主图（photorealistic-natural，透明背景）：**

> A realistic adult human upper torso dressed in beautifully textured dark charcoal oversized wool blazer and crisp ivory button-down shirt, with a real vintage 1980s compact all-in-one CRT personal computer instead of a human head. CRT slightly turned three-quarter to viewer's left, broad left side, screen faces viewer. Matte cool grey ABS, bevelled glass, subtle age, floppy drive, fine vents, no brand/text. Dark reflective blank screen; eyes overlaid separately. Authentic prop editorial photography, not cartoon/3D illustration. Waist-up frontal camera, natural shoulder asymmetry, torso leaves bottom frame. Large soft studio key upper left, fine rim, rich textile shadows. Neutral silver/charcoal/cold white, extremely fine grain. True transparent background, no floor, no extra object/UI. Vertical 3:4; computer about55% shoulder width, body about58% image height.

**磁带盘（product-mockup，透明背景）：**

> Vintage open-reel magnetic computer data tape spool, three wide curved spoke cutouts, brushed silver aluminium, tiny concentric machining lines, dark graphite magnetic tape, short curved tail. Early computing museum object, three-quarter frontal view, thick edge visible at right, fine mechanical fasteners. Single object, no words/labels/UI. Large cool softbox from upper left, dark sculptural side, precise rim highlight. Hyperreal tangible editorial product photography, no illustration/lowpoly. True transparency, no floor or baked shadow. Square canvas, object85%, for 2.5D layered web scene on dark graphite ground.

**身体修复（编辑主图，透明背景）：**

> Create only clean body layer. Remove entire CRT including base/every plastic edge; transparent where computer was. Preserve suit/shirt/torso/shoulders/hands, exact scale, placement, canvas and light. Reconstruct concealed blazer and shirt collars, small natural dark neck attachment so separate head rotates without a gap. No human head/face. Short neck concealed in collar, ending around original computer-bottom height. Same3:4 canvas/body position/bottom crop; no background/shadow/object/text. No computer fragment may remain.

资产署名页说明这些插画不是本人实拍；开放体育模型作者与许可继续保留。

## 工程验证

`npm run build:pages` 与11项保留体育/运行时/连续播放通道测试通过。旧门洞/庭院测试文件仍在仓库作为历史代码测试，不把它们用作新审美验收。

独立Chrome审查与R2缺陷→修复记录见 [retro-futurist-review.md](./retro-futurist-review.md)。本地预览4182；正式上线证据在完成后补充。

## 发布管线

旧版本的手动 gh-pages 大包上传失败，没有沿用失败操作声称发布成功。本次采用官方 GitHub Pages Actions 的构建→验证→artifact→deploy流程；所有actions固定到实查release的commit。只deploy job授予pages/id-token权限。来源：[upload-pages-artifact](https://github.com/actions/upload-pages-artifact)、[deploy-pages](https://github.com/actions/deploy-pages)、[setup-node](https://github.com/actions/setup-node)。

待独立审查通过后合并、运行正式部署，并核对公开HTML资源与Chrome画面。部署前不将本地预览称为在线交付。
