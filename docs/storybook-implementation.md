# 手绘动画个人站 · 实现与交付

2026-10-31。用户明确不要工业风，要求更有个人性格、类似宫崎骏动画的气息。本版撤下CRT、灰色摄影棚、金属磁带盘；保留独立2.5D注视、研究优先的信息顺序与认可的羽毛球。

## 设计与运行时

- 原创蓝天/山丘/小屋背景，绿围巾森林信使；头、身体和背景三个独立运动层。头以围巾开口附近为轴跟随指针，身体只有四分之一的横向跟随。头部是有透明轮廓的绘画，不冒称实时3D。
- 正文粗体深绿、标题粗宋体。首屏职业直接可见；研究纸飞机随滚动从左下向右上轻飞，OPD+RL和SOTA完整保留。实习与成果使用手帐纸页，证书原图不裁切。
- GSAP quickTo只写transform，无指针事件React重渲染；ScrollTrigger控制视差和滚动入场，cleanup恢复。prefers-reduced-motion关闭非必要动态，所有事实保留。
- 羽毛球模型/材质/动作模块未改；章节外层增加局部加载错误边界，跨发布旧资源失效时保留个人内容和刷新重试入口。CSS原有sport/badminton规则与各断点逐字保留，失败状态使用独立新增规则。手绘构图本身无WebGL和旧树叶物理。体育增加有条件的桌面空闲预热：只创建原来的一个场景，离屏1×1绘制一次后暂停；正常分辨率与动作不变。模型和纹理内存会更早持有，不将绘图缓冲缩小等同于模型内存释放。
- 主JS gzip 123.74KB，体育独立懒加载。插画是单独压缩WebP；包体不代表帧率。

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

### 发布前性能与容错记录

Chrome1200×940/DPR2，19秒正反滚动，本地生产副本，首次进入与同文档缓存后各一次。原始JSON保存在`outputs/performance/storybook-run-1.json`、`storybook-run-2.json`。

- 初次：rAF p95 9.3ms，14次间隔超过50ms；13个长任务，最长329ms。进入体育资源路径附近出现集中开销，未取得调用栈，不将某次长任务直接归因到特定函数。
- 缓存后：rAF p95 9.2ms/p99 9.3ms，无超过50ms间隔、无longtask/long-animation-frame。以上是主线程时序，不是GPU呈现FPS。
- 这两次发现初次初始化仍需改善，因此不是最终优化结果。后续将记录空闲预热候选的测量与范围，不把缓存后的数据伪装成首次加载。
- 故障副本删除体育懒加载JS，在Chrome进入体育：局部失败提示出现，hero及其它个人内容仍存在，没有整页白屏；恢复同一个资源并点击刷新重试，canvas恢复1800px宽且模型实际可见。截图`storybook-chunk-failure.png`、`storybook-chunk-recovered.png`。测试UI和故障副本从不部署。

### 空闲预热实现

hero图片/字体就绪后1800ms再排requestIdleCallback，不设置强制timeout；桌面fine pointer、非reduce/saveData/2g且报告内存不少于4GB或未知时执行。近场1200px观察器仍为兜底；可见性与卸载取消未开始的任务，同一个模型缓存/场景只初始化一次。真正离屏时完整后处理暖帧使用1×1目标，随后暂停。仅暖帧把transmissionResolutionScale临时设1防止分数尺寸低于1px，finally恢复原值.25，正常画质不变。

新增测试验证一次暖帧、连续renderer不形成离屏循环、hidden取消、入屏像素预算、transmission正常与异常恢复；14项测试通过。最终资源：index-Bl8V2s4M.js / index-h_kAyipP.css。

### 最终采样（空闲预热后）

Chrome新本地origin4186，1200×940/DPR2，首次滚动前允许首屏完成入场与空闲预热；实际观察canvas1×1、render-state suspended，随后两次19秒完整正反滚动。两次valid/authoredTransforms均true：p95=9.2ms、p99=9.3ms，每次只有1个>25ms间隔，>50ms间隔和longtask/long-animation-frame均0。体育阶段两次都无>25ms间隔。console无error/warn。

这是**桌面空闲预热后的滚动**结果，初始化开销被前移，并非被消除；不声称直接开页立即快滚、弱网、手机或所有GPU均相同。新origin避免复用同源HTTP资源缓存，但未清除系统/驱动缓存，不称完全冷启动。JSON：`outputs/performance/storybook-idle-run-1.json`与`storybook-idle-run-2.json`。
