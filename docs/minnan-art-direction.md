# 闽南水墨视觉参考与素材

日期：2026-10-24。当前方向来自用户本轮明确要求，替代此前的蓝白 3D 建筑工作台。

## 参考图

1. [曾军艺《福建南安蔡氏古民居》纸本水墨（2021）](https://i0.wp.com/champaignmagazine.com/wp-content/uploads/2021/08/img_6140.jpg?resize=800%2C469&ssl=1)：参考连续屋脊、庭院透视与干笔线条。
2. [曾军艺《福建永春县福兴堂》纸本水墨](https://i0.wp.com/champaignmagazine.com/wp-content/uploads/2021/08/img_6141.jpg?resize=800%2C462&ssl=1)：参考墨色疏密、树木与建筑的层次。
3. [泉州晚报：蔡氏古民居燕尾脊照片（陈起拓摄）](https://www.qzwb.com/gb/img/2022-05/20/7142653_0c3c5cad-4cb0-4675-b448-dd3b2181d1b4_batchwm.jpg)：核对红砖、白石与燕尾轮廓。

来源：[《古建筑写生游记》](https://champaignmagazine.com/2021/08/20/%E5%8F%A4%E5%BB%BA%E7%AD%91%E5%86%99%E7%94%9F%E6%B8%B8%E8%AE%B0/)、[《巧夺天工 泉州燕尾脊》](https://www.qzwb.com/gb/content/2022-05/20/content_7142653.htm)。参考作品不作为网页发布素材，署名与水印不被改写为个人作品。

## 网页素材

- 文件：`pages-site/public/assets/minnan-ink-courtyard.webp`，1536 × 1024，约 450 KiB。
- 通过内置 imagegen 生成新的古厝构图，使用以上三图作建筑及媒介参考；未调用 CLI/API 后备路径。
- PNG 原始生成图保留于本机 Codex generated_images；网页使用 WebP 压缩版。
- 用于视觉叙事的插画，不作为用户本人建筑作品或项目证据。
- 动效仅作轻微平移、缩放和淡入；成果原件保持原貌。页面不再导入 Three.js、WorkshopModel 或 CameraRig。

## 生成提示词

```text
Use case: illustration-story.
Asset type: a finished high-resolution editorial illustration for a personal portfolio website, replacing a blue 3D building scene.
Primary request: an original contemporary Chinese ink-wash painting of southern Fujian / Minnan red-brick ancestral courtyard houses. Study the three supplied images as reference material ONLY: reference 1 for the clustered swallowtail ridge silhouette and old courtyard, reference 2 for dry-brush ink and soft landscape washes, reference 3 for authentic red brick and pale stone. Create a new composition, not a copy of any one artwork.
Composition: wide landscape 3:2 composition, gently elevated eye-level oblique view of a small group of traditional red-brick houses around a stone courtyard. One clear main house with elegant, distinctive two-pronged swallowtail roof ridges; smaller roofs recede diagonally behind it. Strong asymmetric architectural cluster, readable silhouette, with a small banyan tree at one side. Architectural subject fills the central 70% with generous empty margins on ALL edges. No modern tower blocks, no miniature plinth, no floating island. No dramatic mountains or unrelated Chinese pagodas.
Medium: genuine-looking wet and dry Chinese ink on warm ivory xuan paper. Expressive hand-brushed broken lines, feathered edges, diluted gray washes, subtle warm vermilion brick pigments, near-black roof details, pale stone. High-quality contemporary museum catalogue illustration, spacious and quietly sophisticated, not cartoon, not vector, not glossy 3D, not photoreal.
Background: warm pale ivory (#f7f4eb) with subtle paper grain, landscape dissolves softly into unpainted paper at edges. Top quarter mostly empty paper. Keep darkest ink around the building roofs and doorways. Atmospheric depth from lighter distant roofs.
No writing, no calligraphy, no labels, no logos, no watermark, no signature, no seals, no frame, no UI.
Save the final image for use as the site's main visual.
```
