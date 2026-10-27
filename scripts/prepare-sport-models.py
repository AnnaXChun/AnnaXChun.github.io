"""Prepare licensed sport assets with Blender 4.5+, without executing asset scripts.

Usage:
  Blender --background --disable-autoexec --python-exit-code 1 --python scripts/prepare-sport-models.py -- \
    --source-dir /tmp/portfolio-model-research --output-dir pages-site/public/models

See public/models/SPORT-MODEL-SOURCES.md for provenance and licenses.
Both exports use centered geometry, a unit-length Y axis, and no Draco extension.
"""

import argparse
import hashlib
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def deselect():
    bpy.ops.object.select_all(action="DESELECT")


def retain_meshes():
    """Bake world transforms and discard imported scene/physics/helper hierarchy."""
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    for obj in meshes:
        world = obj.matrix_world.copy()
        obj.parent = None
        obj.matrix_world = world
        obj.hide_viewport = False
        obj.hide_render = False
        obj.hide_set(False)
    for obj in list(bpy.context.scene.objects):
        if obj not in meshes:
            bpy.data.objects.remove(obj, do_unlink=True)
    deselect()
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return meshes


def split_racket_materials(meshes):
    deselect()
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.separate(type="MATERIAL")
    bpy.ops.object.mode_set(mode="OBJECT")
    result = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    for obj in result:
        material = obj.data.materials[obj.data.polygons[0].material_index]
        obj.data.materials.clear()
        obj.data.materials.append(material)
        for face in obj.data.polygons:
            face.material_index = 0
        obj.name = "KinChen_" + material.name.replace(".", "_")
    return result


def bake_racket_procedurals(meshes):
    """Keep the original procedural color and bump rather than silently dropping it."""
    bpy.context.scene.render.engine = "CYCLES"
    bpy.context.scene.cycles.device = "CPU"
    bpy.context.scene.cycles.samples = 16
    bpy.context.scene.render.bake.margin = 8
    bpy.context.scene.render.bake.use_clear = True
    baked = []
    for obj in meshes:
        material = obj.data.materials[0]
        tree = material.node_tree
        principled = next(n for n in tree.nodes if n.type == "BSDF_PRINCIPLED")
        # The frame has an unconnected Normal Map node, which has no authored detail.
        channels = []
        if principled.inputs["Base Color"].is_linked:
            channels.append(("Base Color", "DIFFUSE", "baseColor"))
        if principled.inputs["Normal"].is_linked and material.name != "racket":
            channels.append(("Normal", "NORMAL", "normal"))
        deselect()
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        for socket, bake_type, suffix in channels:
            size = 1024 if suffix == "normal" else 512
            image = bpy.data.images.new(f"KinChen_{material.name}_{suffix}", size, size, alpha=False)
            image.colorspace_settings.name = "Non-Color" if suffix == "normal" else "sRGB"
            target = tree.nodes.new("ShaderNodeTexImage")
            target.image = image
            tree.nodes.active = target
            for node in tree.nodes:
                node.select = node == target
            if bake_type == "DIFFUSE":
                bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"})
            else:
                bpy.ops.object.bake(type="NORMAL", normal_space="TANGENT")
            image.pack()
            for link in list(principled.inputs[socket].links):
                tree.links.remove(link)
            if suffix == "normal":
                normal = tree.nodes.new("ShaderNodeNormalMap")
                tree.links.new(target.outputs["Color"], normal.inputs["Color"])
                tree.links.new(normal.outputs["Normal"], principled.inputs[socket])
            else:
                tree.links.new(target.outputs["Color"], principled.inputs[socket])
            baked.append({"material": material.name, "channel": suffix, "size": size})
    return baked


def world_bounds(meshes):
    points = [obj.matrix_world @ vert.co for obj in meshes for vert in obj.data.vertices]
    lower = Vector([min(p[i] for p in points) for i in range(3)])
    upper = Vector([max(p[i] for p in points) for i in range(3)])
    return lower, upper


def canonicalize(meshes, source_long_axis):
    lower, upper = world_bounds(meshes)
    source_bounds = [list(lower), list(upper)]
    center = (lower + upper) / 2
    length = upper[source_long_axis] - lower[source_long_axis]
    # Blender +Z becomes glTF +Y. Racket initially lies along Blender +Y.
    rotate = Matrix.Rotation(math.pi / 2, 4, "X") if source_long_axis == 1 else Matrix.Identity(4)
    normalization = Matrix.Scale(1 / length, 4) @ rotate @ Matrix.Translation(-center)
    for obj in meshes:
        obj.data.transform(normalization)
        obj.data.update()
    lower, upper = world_bounds(meshes)
    # glTF uses (x, z, -y) for Blender (x, y, z).
    gltf_bounds = [[lower.x, lower.z, -upper.y], [upper.x, upper.z, -lower.y]]
    return {"sourceBoundsBlender": source_bounds, "sourceLongAxis": source_long_axis,
            "sourceLength": length, "boundsGltf": gltf_bounds,
            "dimensionsGltf": [gltf_bounds[1][i] - gltf_bounds[0][i] for i in range(3)],
            "axis": "+Y is racket head / shuttle cork; centered at origin; Y length 1"}


def prepare(source, destination, kind):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if source.suffix == ".blend":
        bpy.ops.wm.open_mainfile(filepath=str(source), load_ui=False, use_scripts=False)
    else:
        bpy.ops.wm.usd_import(filepath=str(source))
    bpy.context.view_layer.update()
    meshes = retain_meshes()
    baked = []
    if kind == "racket":
        meshes = split_racket_materials(meshes)
        baked = bake_racket_procedurals(meshes)
    else:
        for obj in meshes:
            obj.name = "Kyle1003_" + obj.name
    # Every material uses the active render UV; discard unused duplicate UV layers.
    for obj in meshes:
        layers = obj.data.uv_layers
        active = next((layer for layer in layers if layer.active_render), layers.active)
        keep_name = active.name if active else None
        for name in [layer.name for layer in layers if layer.name != keep_name]:
            layers.remove(layers[name])
    geometry = canonicalize(meshes, 1 if kind == "racket" else 2)
    if kind == "racket":
        net_meshes = [obj for obj in meshes if obj.data.materials[0].name == "net"]
        lower, upper = world_bounds(net_meshes)
        midpoint = (lower + upper) / 2
        geometry["stringBedCenterGltf"] = [midpoint.x, midpoint.z, -midpoint.y]
        geometry["stringBedNormalGltf"] = [0, 0, 1]
    deselect()
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.context.scene.unit_settings.system = "NONE"
    bpy.context.scene.unit_settings.scale_length = 1
    bpy.ops.export_scene.gltf(
        filepath=str(destination), export_format="GLB", use_selection=True,
        export_animations=False, export_cameras=False, export_lights=False,
        export_extras=False, export_yup=True, export_apply=True,
        export_draco_mesh_compression_enable=False, export_image_format="AUTO",
    )
    return {"file": destination.name, "sourceSha256": sha256(source),
            "sha256": sha256(destination), "bytes": destination.stat().st_size,
            "meshObjects": len(meshes), "bakedTextures": baked, **geometry}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    arguments = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    args = parser.parse_args(arguments)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    records = [
        prepare(args.source_dir / "kin-chen-badminton.blend", args.output_dir / "kin-chen-racket.glb", "racket"),
        prepare(args.source_dir / "kyle1003-shuttlecock.usdz", args.output_dir / "kyle1003-shuttlecock.glb", "shuttle"),
    ]
    manifest = {"blender": bpy.app.version_string, "compressed": False, "assets": records}
    (args.output_dir / "SPORT-MODEL-MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print("SPORT_MODEL_EXPORT " + json.dumps(manifest))


if __name__ == "__main__":
    main()
