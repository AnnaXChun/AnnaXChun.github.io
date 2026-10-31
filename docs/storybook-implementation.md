# 手绘动画个人站 · 实现与交付

2026-10-31。用户明确不要工业风，要求更有个人性格、类似宫崎骏动画的气息。本版撤下CRT、灰色摄影棚、金属磁带盘；保留独立2.5D注视、研究优先的信息顺序与认可的羽毛球。

## 设计与运行时

- 原创蓝天/山丘/小屋背景，绿围巾森林信使；头、身体和背景三个独立运动层。头以围巾开口附近为轴跟随指针，身体只有四分之一的横向跟随。头部是有透明轮廓的绘画，不冒称实时3D。
- 正文粗体深绿、标题粗宋体。首屏职业直接可见；研究纸飞机随滚动从左下向右上轻飞，OPD+RL和SOTA完整保留。实习与成果使用手帐纸页，证书原图不裁切。
- GSAP quickTo只写transform，无指针事件React重渲染；ScrollTrigger控制视差和滚动入场，cleanup恢复。prefers-reduced-motion关闭非必要动态，所有事实保留。
- 羽毛球模型/材质/动作模块未改；章节外层增加局部加载错误边界，跨发布旧资源失效时保留个人内容和刷新重试入口。CSS原有sport/badminton规则与各断点逐字保留，失败状态使用独立新增规则。前半站无WebGL和旧树叶物理。体育保持按需加载、离屏暂停与原动作。
- 主JS gzip 123.14KB，体育独立懒加载。插画是单独压缩WebP；包体不代表帧率。

## 原创资产与提示词

全部使用内置imagegen，未用CLI/API密钥。PNG原件在 `/Users/chunxiang/.codex/generated_images/01a16d38-8782-7df3-8b90-1519f6da9330/`，项目内保留WebP引用，cwebp q86/alpha100只进行格式编码。素材不冒充官方电影素材或本人照片。

| 项目内路径 | PNG原件 | 用途 |
|---|---|---|
| `pages-site/public/assets/story-landscape.webp` | `exec-317e4dd5-c854-42ca-afa5-05d9c8bf4e05.png` | 满幅风景远层 |
| `pages-site/public/assets/story-messenger.webp` | `exec-a7aaf6c8-f607-446c-83c2-6c1d8e542adc.png` | 信使头部透明层 |
| `pages-site/public/assets/story-body.webp` | `exec-c84210e8-43f2-4c6f-a006-0890c3eba0cd.png` | 去头的干净身体层 |
| `pages-site/public/assets/story-plane.webp` | `exec-91c4314b-2c18-4a18-b148-10c6c93687c3.png` | 后训练纸飞机 |

生成提示词核心指令（归纳）：

1. **风景 / illustration-story**：Original hand-painted Japanese animation background, inspired by Hayao Miyazaki's luminous pastoral atmosphere. Wide16:9, blue sky and soft clouds, emerald/sage rolling hills in lower third, narrow path to tiny ochre-roof cottage and trees at far right, wind-bent wildflowers. Gouache/pencil detail, layered distance, clear airy colors. Left half and upper center clean sky for dark copy, horizon lower65–70%. No people/characters/text/UI/sepia/3Drender.
2. **信使 / illustration-story，透明**：Original endearing forest messenger, full figure3:4. Rounded ivory fluffy bird spirit with pointed tufts, cream oval face, small wings/terracotta beak, flowing moss-green scarf, russet canvas satchel with letters and blue notebook. Front-facing, face upper40%, two black dot eyes. Fine feather brushwork/coolblue shadow/sunlight upperleft, crisp cel contour. Complete feet/bag. No existing movie character, backdrop/floor/words/robot/plastic.
3. **身体 / precise-object-edit，透明**：Edit exact messenger at identical canvas/scale/position. Remove entire head/eyes/beak/tufts to transparency. Preserve scarf/tails/body/strap/bag/feet unchanged. Reconstruct only tiny ivory neck tuft within scarf opening, no tall neck. Composite under separate original head.
4. **纸飞机 / illustration-story，透明**：Single hand-painted paper airplane with tiny green sprig in fold and two cobalt ink marks. Gouache warmivory paper/coolteal shadows/terracotta pencil contour, upperleft light, dramatic three-quarter perspective pointing upperright, object88% square. No words/background/ground/floor shadow, no metal/photoreal/3Drender.

## 验证与发布

`npm run build:pages`、11项体育/运行时/连续进度测试已通过。旧庭院测试中的历史命名不作为本版审美门槛。独立Chrome检查见 `storybook-review.md`，与性能采样、正式部署分别记录，不借用旧PASS。

当前文档是实现记录；最终发布状态在实际合并与Pages部署成功后补充。
