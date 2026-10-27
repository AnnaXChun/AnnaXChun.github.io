# 开源羽球与球拍模型调研

日期：2026-10-25。独立研究 subagent 维护。**状态：两件许可可公开分发的精细模型已真实下载、转换、减重并交付 GLB，等待导入后的 Chrome 视觉验收。** 本轮用户再次否定上一版高级感，要求更接近 Halora 参考的可见光晕、清透背景，并优先采用已有精细模型。旧版布光 PASS 不代表本轮要求达成。

采用 agent-reach 的 Exa 搜索 / 官方页面路线，随后使用公开作者平台 API 核对许可和下载地址。没有操作 Chrome、登录第三方账户、绕过登录或修改生产代码。模型与原始元数据暂存在 `/tmp/portfolio-model-research/`，交由实现者导入并将署名记录纳入仓库。

## 推荐导入的候选

| 模型 | 作者与一手页面 | 许可与下载证据 | 当前文件 |
| --- | --- | --- | --- |
| Badminton racket | Kin Chen；[Blendkit 作者资产页](https://www.blendkit.com/asset-gallery-detail/800ca014-47a8-4fab-9e29-03ca88a2ff05/) | 页面标记 Free / Creative commons zero；[官方资产 API](https://www.blendkit.com/api/v1/assets/b7aa4159-b68e-4292-ab75-6b84324a0489/) 返回 `isFree=true`、`license=cc_zero`、`isPrivate=false`。API 返回的下载端点添加普通场景 UUID 后匿名成功，实际收到 glTF 2.0 二进制与 Blender 源文件。 | `kin-chen-badminton.glb`：641,656 B；`kin-chen-badminton.blend`：3,945,907 B。 |
| Badminton / feather shuttlecock | kyle1003；[Sketchfab 作者资产页](https://sketchfab.com/3d-models/badminton-4afd7a7c63a445e19924af0e311bc97e) | [官方 API](https://api.sketchfab.com/v3/models/4afd7a7c63a445e19924af0e311bc97e) 返回 `isDownloadable=true`、CC Attribution、明确链接到 CC-BY 4.0。Sketchfab 下载 API 需要登录，未绕过。公开 [USDZ 数据集镜像](https://huggingface.co/datasets/barszot/3d-models-for-isaac-sim-dataset/blob/main/shuttlecock/shuttlecock.usdz) 实际下载成功；其 [credits.csv](https://huggingface.co/datasets/barszot/3d-models-for-isaac-sim-dataset/blob/main/credits.csv) 明确同一作者、同一原模型链接、CC Attribution 与 `isModified=false`。 | `kyle1003-shuttlecock.usdz`：5,991,222 B，内部包含 `shuttlecock.usdz.temp.usd`（PXR-USDC）。需转换为 GLB。 |

这些是已收到的真实模型文件，不是截图下载或仅页面上出现下载按钮。第二件通过依法允许再分发的公开镜像取得；原作者与原许可仍是依据，不能把镜像维护者误写成模型作者。

### 球拍：实际结构及预览观察

- 作者页面注明 90,604 polygons，源文件来自 Blender 3.6.17、Cycles，带 UV、程序材质，无图像纹理。该数值是源多边形，不等于网页三角数。
- 直接解析实际 GLB：183,223 triangles、120,590 position vertices、1 mesh / 6 primitives，分为 `hole.001`、`racket`、`hole`、`net`、`straps`、`tape` 材质。使用 `KHR_draco_mesh_compression`，并有 clearcoat、specular、ior 材质扩展；没有外部图片依赖。
- **实际看过的作者静态预览**：细窄拍框有弯曲截面、沿边独立孔眼与外缘穿线；长杆和拍头比例自然；白握带有螺旋拼接与微孔。构造比当前粗管式轮廓更适合精致器物近景。这是作者预览观察，尚未在本站渲染验证。
- **导入注意**：GLB 中没有纹理图片，Blender 程序材质的微孔不保证已经完整烘焙。需要查看实际导入结果，再决定是否从源文件烘焙，不能把作者离线渲染当作 GLB 保真证明。`racket` 原生 metallic 约 0.9、roughness 约 0.222，可根据目标摄影风格校准；不要重新统一涂成无反射黑管。
- 原始 GLB SHA-256：`76cf53d30711dbaf5caa1e03e3566978ea4e498ce1bb6466a25121b58ee138fa`。
- 原始证据：`kin-racket-metadata.json`、`kin-racket-preview.png`，与模型位于同一临时目录。预览是作者作品，不能当成本项目成果图。

### 羽球：实际结构及预览观察

- 官方 API 记录 219,424 triangles、246,610 vertices；作者名 kyle1003，许可 URL 为 `https://creativecommons.org/licenses/by/4.0/`。
- **实际看过的作者静态预览**：白色羽片具有细羽枝、局部裂开与不规则末梢，环绑与羽轴为独立可读结构；球头为白色，彩色环为蓝色。适合评估近景羽缘透光、层次与高光；无需为配色原样保留蓝环。
- 数据集 [README](https://huggingface.co/datasets/barszot/3d-models-for-isaac-sim-dataset/blob/main/README.md) 明确资产从外部来源转换为 USDZ；具体来源由 credits.csv 维护。该模型行写 `isModified=false`，表示镜像声明未改几何；本轮没有独立逐顶点比对原站原始文件。
- USDZ 实际下载文件 SHA-256：`fa4daf959230ce76fee30f381843d780804e4f0777a25b500e42fa19753d9471`，与 Hugging Face LFS 记录一致。归档中只有二进制 USD，无外部纹理文件；导出后需核查材质、法线、双面薄羽、轴向和实际尺寸。
- 原始证据：`4afd7a7c63a445e19924af0e311bc97e.json` / `.jpg`、`isaac-model-readme.md`、`isaac-model-credits.csv`。

## 许可与署名安排

[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) 允许复制、修改、分发；[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) 允许分享和改编，要求适当署名、许可链接与修改说明。应在仓库资产清单与可访问的致谢位置保留来源；不添加与个人展示无关的大型商业许可控件。

建议记录：

> “Badminton racket” by Kin Chen, Blendkit, CC0 1.0. Converted / material-adjusted for this portfolio.
>
> “Badminton” by kyle1003, Sketchfab, CC BY 4.0. USDZ mirror conversion by barszot; converted to GLB and material-adjusted for this portfolio.

实际写入时链接上方作者模型页及对应许可，并按实际操作更新修改说明；不得暗示作者为本网站背书。

## 已核验但未采用的候选

| 候选 | 核验结果 | 未采用原因 |
| --- | --- | --- |
| [Kin Chen Shuttlecock](https://www.blendkit.com/asset-gallery-detail/2752efdd-3171-4a8a-a447-6d05d4a71b53/) | Free，11,568 polygons，Royalty Free。 | Free 不等于 CC0；[官方许可 FAQ](https://www.blendkit.com/docs/licenses/licensing-faq/) 要求分发中资产不易直接提取。公开仓库和静态 GLB 资源不适合直接采用此许可。 |
| [sandyonmars Badminton Shuttlecock](https://sketchfab.com/3d-models/badminton-shuttlecock-4c9f001254534d4f90d94adf33e6dc24) | 官方 API：CC-BY 4.0、可下载、747,036 triangles；下载 API 返回 401。 | 实际缩略图是黄色塑料裙羽球，并非白羽；高面数不能代替合适造型。未取得模型文件。 |
| [Hassan4GD Shuttlecock](https://sketchfab.com/3d-models/shuttlecock-aaa493c8d3d749e2898e45422474c04f) | 官方 API：CC-BY 4.0、可下载、32,640 triangles；下载 API 返回 401。 | 实际预览是厚实、简化的图标造型，缺少羽缘细节；不适合本轮微距。 |
| [YuYevon777 Racket And Shuttlecock](https://blendswap.com/blend/9072) | 作者页：CC-BY、Blender 2.6x、19.9 MB。 | 直读页面遇到 Cloudflare 403；Exa 读到了公开文字，未得到实际文件。不能写作已下载。 |
| [kiddfinn_1292484 Badminton Racket](https://blendswap.com/blend/26838) | 作者页：CC-BY、Blender 2.8x、2.77 MB。 | 已有许可更简单、实际下载成功的球拍；此项不继续占用导入验证时间。 |
| [alqosamaufa shuttlecock](https://www.cadcrowd.com/3d-models/shuttlecock) | 作者页 CC0，提供 2 个文件，带 STEP 格式分类。 | 页面下载端点实际跳登录，未下载。CAD 格式还需转换，未确认近景羽毛质量。 |
| [RIDDHISH KATHAR Badminton Feather Shuttle](https://www.cadcrowd.com/3d-models/badminton-feather-shuttle) | 作者页 CC-BY 4.0，CATIA v5 制作，3 文件。 | 未完成登录下载和文件检查，作为后备，不冒称已准备就绪。 |
| [Grab3D Badminton Racket](https://grab3d.com/models/sports/badminton-racket/) | 页面标 CC0、7,880 triangles、GLB/FBX/BLEND/USDZ/OBJ。 | 页面明确 lightweight / stylized，面向休闲游戏；优先已有精细作者模型，未实际下载此项。 |
| [Oxygen Shuttlecock](https://oxygen3d.itch.io/shuttlecock) | 作者页列 FBX/OBJ/BLEND、basic material、low poly。 | 该资产页没有明确 CC0 条款；其他作品评论的 CC0 不直接扩展为本文件许可；且造型定位偏简化。 |
| MakerWorld / CadNav / 聚合“免费下载”模型 | 一些条目限制数字文件再分发，或仅个人 / 教育用途。 | 不将可下载当作可放入公开网站资源目录；不采用来源与再分发权不清的资源。 |

## 本轮导入后的独立验收门槛

1. 以真实模型替换后，先看相同构图的前后对照：拍框截面、孔眼、握带、羽缘与球头是否实际提升，不能只报告文件来自外站。
2. 冷白 / 清透背景须有光的方向和空气感；可见光晕与主体高光有关系，不能成为整屏发白的雾或独立装饰圆斑。暗面与薄羽细节仍应可读。
3. 模型进入近镜头时保留羽缘、线床和反射变化；材质的颜色、亮度、粗糙度各有区分，避免灰白塑料感或金属球头。
4. 手、球拍和羽球的视觉关系须有明确意图；只把几个物件摆一起不算形成摄影构图。滚动预备 / 触球 / 飞出 / 微距继续可逆，停滚保持姿态。
5. Chrome 桌面、手机与 200% 的真实个人信息仍有清楚阅读落点；高光、模型或强影不能遮掉正文。
6. 导入失败有明确可控回退；检查资源解码、尺寸、法线、内存释放和传输成本。但这些技术检查不能代替本轮审美验收。

## 转换交付结果

实现者授权本 subagent 转换两个模型及编写复现脚本，未授权修改网站运行代码。使用 Blender 4.5.13 LTS，始终以 `--background --disable-autoexec` 执行，读取 `.blend` 时也禁止脚本执行。复现脚本为 `scripts/prepare-sport-models.py`。

| 输出 | 实际文件与结构 | 坐标与材质 |
| --- | --- | --- |
| `pages-site/public/models/kin-chen-racket.glb` | 7,508,144 B；6 meshes；183,223 triangles / 120,504 exported vertices。初版 12,138,160 B，经 normal 1K / color 512 及删除未用重复 UV 减重约 38%，未删几何。 | 长轴 +Y、拍头 +Y、拍面 +Z，中心原点，长轴单位长度 1。尺寸约 0.293750 × 1 × 0.042022。握带和线床程序色彩 / bump 已烘焙成 5 张内嵌图；已实际查看烘焙结果，能见握带微孔与纤维法线。 |
| `pages-site/public/models/kyle1003-shuttlecock.glb` | 6,256,832 B；27 meshes；219,424 triangles / 247,168 exported vertices。羽枝几何全部保留。 | 长轴 +Y、球头 +Y，中心原点，长轴单位长度 1。尺寸约 0.748095 × 1 × 0.748095。原 USDZ 无图像或 alpha 纹理，各材质 alpha=1；保留材质分组，没有移除原透明贴图。 |

两个 GLB 均无 Draco，只有网格与材质，纹理内嵌。二进制长度 / 头部、全部 position 有限、无未使用第二 UV、内嵌图尺寸均检查通过。gzip 测量为球拍 5,308,680 B、羽球 5,205,907 B，不将文件体积测量冒称为网络或 GPU 性能测量。

球拍线床在导出坐标中的包围盒中心为 `(0, 0.310535196, -0.011762467)`，法向 `+Z`；以运行时完整变换求世界触球点。不能用整个球拍原点代替线床中心。几何、原始边界、哈希和烘焙通道见 `pages-site/public/models/SPORT-MODEL-MANIFEST.json`；来源与许可见相邻 `SPORT-MODEL-SOURCES.md`。

目前完成资产调研与转换交付，**尚未给本轮画面 PASS**。最终依据用户最新参考和独立 Chrome 观察另行记录。


## 最终接入与视觉复核

两份转换模型已由实现者接入真实三维滚动场景，并配合开放许可手部模型、冷白冰蓝背景与局部玻璃亮弧。Chrome 独立审查经过两轮 FAIL 后，第 3 轮通过；具体手势 / 白羽亮部 / 手腕截面 / 响应式阅读区问题和修复证据见 [portfolio-research-review.md](./portfolio-research-review.md) 的“精细开源模型与清透摄影”部分。资产可用性与视觉通过分开记录；未声称等同实拍或已经通过低带宽 / 低端 GPU 性能测试。
