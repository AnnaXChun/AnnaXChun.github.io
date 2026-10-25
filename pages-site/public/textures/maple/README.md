# Photographic maple-leaf detail

Source: [Leaf Set 010, ambientCG](https://ambientcg.com/a/LeafSet010), downloaded 2026-10-25 from the official [1K JPG archive](https://ambientcg.com/get?file=LeafSet010_1K-JPG.zip). Publisher: ambientCG.

License: **CC0 1.0 Universal**. [Official asset-license statement](https://docs.ambientcg.com/license/) · [CC0 legal code](https://creativecommons.org/publicdomain/zero/1.0/legalcode). The license permits copying, modification and redistribution, including asset files in a website. No endorsement by the source is implied.

This is **not an imported complete 3D scan**. `MapleLeafAsset.js` reconstructs a closed, curled, thin-shell mesh from the right-upper leaf's photographed silhouette and supplements real geometric midrib/side ribs with the source's photographic pigment and PBR microdetail. No alpha plane is used.

Preparation:

- Source crop: `(565, 20)–(955, 490)` in the original 1024×1024 maps.
- Opacity threshold 150; connected silhouette with petiole, simplification tolerance 0.85 source pixels; constrained triangulation with at most 175 source-pixel² face area and no boundary splitting.
- Geometric crown +Y, face +Z; total height including petiole 1 unit. Closed front, back and all serrated side walls; separate UV halves.
- Green source pigment recolored to vermilion with its photographed veins/mottling retained. Back is slightly paler and rougher; small curvature and vein ridges are modeled, not baked into illumination.
- Three 512×256 two-sided atlases: pigment JPEG (sRGB), OpenGL normal JPEG and roughness JPEG (linear data). Each half maps one leaf side. No outside service is fetched at runtime.
- Photographic micro-normal strength is deliberately restrained; the full 3D curl remains visible when texture maps are disabled.

Other candidate reviewed: [Bau-3d's Maple Leaf 1x4k](https://sketchfab.com/3d-models/maple-leaf-1x4k-normals-and-texture-free-cbcf27bc44e84870bd572b7b8b5a1ab5), CC Attribution / about 19.7k triangles according to the author's indexed page. Its source page returned 403 in this session, so no archive or geometry was obtained and none of it is included here.

Source archive SHA-256: `b72dbfeac10c42cbe17d34b4d744c19acdc818c064159ee9258e7e77648f3792`.
