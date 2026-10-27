# Sport model sources and licenses

Prepared on 2026-10-25. These are authored third-party models, not models authored by the portfolio owner. The source and license records below remain with the distributed GLBs.

## kin-chen-racket.glb

- Work: **Badminton racket**, by **Kin Chen**.
- Author's source: <https://www.blendkit.com/asset-gallery-detail/800ca014-47a8-4fab-9e29-03ca88a2ff05/>
- License: **CC0 1.0 Universal** — <https://creativecommons.org/publicdomain/zero/1.0/>
- Author-platform metadata: <https://www.blendkit.com/api/v1/assets/b7aa4159-b68e-4292-ab75-6b84324a0489/>
- Metadata verified `license=cc_zero`, `isFree=true`, `isPrivate=false` on 2026-10-25.
- Source used: author's Blender 3.6.17 file, downloaded through the platform's public asset download API, 3,945,907 bytes.
- Changes: procedural grip/string color and bump baked into embedded image textures; non-mesh scene objects removed; mesh transforms baked; geometry centered and rotated to a common coordinate system; uniformly normalized; exported as uncompressed glTF 2.0 GLB. No decimation or replacement of the authored mesh.

Credit is retained voluntarily for the CC0 work. It does not imply the author's endorsement.

## kyle1003-shuttlecock.glb

- Work: **Badminton**, by **kyle1003**.
- Author's source: <https://sketchfab.com/3d-models/badminton-4afd7a7c63a445e19924af0e311bc97e>
- License: **Creative Commons Attribution 4.0 International** — <https://creativecommons.org/licenses/by/4.0/>
- Author-platform metadata: <https://api.sketchfab.com/v3/models/4afd7a7c63a445e19924af0e311bc97e>
- Source format conversion / mirror: **barszot**, [3D models for Isaac Sim dataset](https://huggingface.co/datasets/barszot/3d-models-for-isaac-sim-dataset).
- Downloaded file: <https://huggingface.co/datasets/barszot/3d-models-for-isaac-sim-dataset/blob/main/shuttlecock/shuttlecock.usdz>
- Mirror attribution: <https://huggingface.co/datasets/barszot/3d-models-for-isaac-sim-dataset/blob/main/credits.csv> names kyle1003, the same original model URL, CC Attribution and `isModified=false`. The dataset README describes USDZ format conversion.
- The original author's API independently confirmed CC-BY 4.0 and downloadable status on 2026-10-25. The mirror does not replace the original author's rights or attribution.
- Source USDZ: 5,991,222 bytes; SHA-256 `fa4daf959230ce76fee30f381843d780804e4f0777a25b500e42fa19753d9471`.
- Changes: imported USDZ, removed scene/physics/helper hierarchy while retaining the authored mesh and material assignments; baked world transforms; centered and uniformly normalized geometry; exported as uncompressed glTF 2.0 GLB. No decimation. Source feather detail is geometry: the USDZ contains no image/alpha texture and its materials are opaque. No source transparency texture was removed.

The work is shared under CC BY 4.0. Retain author credit, this source link, the license link, and an indication of changes when redistributing or adapting it. No endorsement is implied.

## Reproduction and coordinates

Run `scripts/prepare-sport-models.py` using Blender with `--background --disable-autoexec`; see that script for the exact invocation. Original source files remain separate from the website assets. `SPORT-MODEL-MANIFEST.json` records final hashes, sizes, original bounds, normalized bounds, and baked texture channels.

- Both GLBs are centered at the origin; their long Y dimension is exactly 1.
- Racket: head points to +Y, grip toward -Y; the racket face is in the XY plane and faces +Z.
- Shuttlecock: rounded cork tip points to +Y and feather tips toward -Y.
- There is no Draco decoder requirement. GLBs contain all textures they use.
- Racket textures are baked at 1024 px for normals and 512 px for color; unused duplicate UV channels are removed. All authored triangles remain. Final transfer files are 7,508,144 bytes for the racket and 6,256,832 bytes for the shuttlecock.
- The racket string-bed center is `(0, 0.310535196, -0.011762467)` in exported local coordinates, with face normal `+Z`. Use the object's full transform to obtain the world contact point; the origin is the whole-racket center, not the string-bed center.
- Website lighting, pose, and material adjustments may be applied at runtime; they must not remove this source record.

## Hand — LibHand

- Author: Marin Šarić (Marin Saric), 2011.
- Source: https://github.com/libhand/libhand/tree/master/hand_model/blender
- Model license: CC BY 3.0, https://creativecommons.org/licenses/by/3.0/ (see `LIBHAND-LICENSE.txt`).
- Original files: `hand.blend`, `hand_texture.png` from that directory; the model license applies to geometry and texture, independently of the LibHand library's code license.
- Changes: posed the original rig for a loose release and froze the result, extended only the source wrist to leave the viewport naturally, rebuilt a Principled/PBR skin material retaining authored UV and 2048px photo texture, changed axis and placement, exported a static GLB. No source scripts executed. The hand is a licensed illustration of a badminton toss, not a photograph of the site owner.
- Rebuild: Blender 4.5 LTS `--background --disable-autoexec --python scripts/prepare-hand-model.py -- --source /path/to/libhand/blender --output /path/to/libhand.glb` (optional `--preview /path/to/preview.png`).
- Visible attribution: `/model-credits.html`, linked in the website footer.
