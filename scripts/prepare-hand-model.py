import bpy, math, argparse, sys
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument("--source",required=True);p.add_argument("--output",required=True);p.add_argument("--preview");args=p.parse_args(sys.argv[sys.argv.index("--")+1:]);source=Path(args.source)
from mathutils import Vector, Matrix
bpy.ops.wm.open_mainfile(filepath=str(source/'hand.blend'),use_scripts=False)
arm=bpy.data.objects['Armature']
for o in bpy.data.objects:o.animation_data_clear()
# Pose the author's rig for a loose release: thumb/index open, ring/pinky flexed.
for finger,angles in [(1,[.50,.7,.35]),(2,[.42,.6,.25]),(3,[.18,.32,.15]),(4,[.08,.12,.05]),(5,[.12,.15,.08])]:
 for j,angle in enumerate(angles,1):
  bone=arm.pose.bones[f'finger{finger}joint{j}'];bone.rotation_mode='XYZ';bone.rotation_euler.x=-angle
bpy.context.view_layer.update()
original=bpy.data.objects['hand_mesh']
depsgraph=bpy.context.evaluated_depsgraph_get()
mesh=bpy.data.meshes.new_from_object(original.evaluated_get(depsgraph),depsgraph=depsgraph)
world=original.matrix_world.copy()
for v in mesh.vertices:
 p=world @ v.co
 # Extend only the author's wrist; preserve the palm, fingers and authored UV.
 if p.x>.3:
  u=(p.x-.3)/.844;p.x+=1.4*u**1.25;p.y=.42+(p.y-.42)*(1+.15*u);p.z=1.45+(p.z-1.45)*(1+.08*u)
 v.co=Vector((p.y-.42,p.x+1.3,1.45-p.z))*.85
for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
obj=bpy.data.objects.new('LibHand_palm',mesh);bpy.context.collection.objects.link(obj)
bpy.context.view_layer.objects.active=obj
for p in obj.data.polygons:p.use_smooth=True
skin=bpy.data.materials.new('LibHand — photographed skin');skin.use_nodes=True
nt=skin.node_tree;bs=nt.nodes.get('Principled BSDF');bs.inputs['Roughness'].default_value=.47
bs.inputs['Subsurface Weight'].default_value=.13
bs.inputs['Subsurface Radius'].default_value=(1,.45,.22)
bs.inputs['Specular IOR Level'].default_value=.32
tex=nt.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(source/'hand_texture.png'))
nt.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
obj.data.materials.clear();obj.data.materials.append(skin)
for p in obj.data.polygons:p.material_index=0
bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=args.output,export_format='GLB',use_selection=True,export_yup=False,export_animations=False)
if not args.preview: sys.exit(0)
# A neutral front view used to inspect the source before layout integration.
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24
scene.world.color=(.22,.22,.22)
bpy.ops.object.camera_add(location=(0,.1,8));camera=bpy.context.object;camera.rotation_euler=(Vector((0,-.4,0))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=5.5;scene.camera=camera
for loc,power,size in [((3,5,5),600,4),((-3,1,2),200,3)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(Vector((0,0,0))-l.location).to_track_quat('-Z','Y').to_euler()
scene.render.resolution_x=800;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.film_transparent=True
scene.render.filepath=args.preview;bpy.ops.render.render(write_still=True)
