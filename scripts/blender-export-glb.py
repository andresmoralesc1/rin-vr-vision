# Blender CLI export script for rin-vr-vision rim catalog.
# Centroid-aligns the geometry to the origin, normalises to a unit
# bounding box, and writes GLB (binary glTF 2.0) with PBR materials
# preserved. Intended to be invoked from `scripts/convert-rims.sh`.
#
# argv after `--` is the output path.
import bpy
import mathutils
import sys

out_path = sys.argv[-1]

# Clear default scene contents so the imported mesh is the only thing
# we export.
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

# Blender's CLI auto-imports .blend/.obj/.fbx when given as the
# positional argument to `-b`. By the time this script runs, the
# objects are already in the scene — we just process whatever is there.

# Pick the first mesh object as the rim.
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
if not meshes:
    sys.stderr.write("error: no mesh found in scene after import\n")
    sys.exit(1)
obj = meshes[0]
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

# Translate to centroid.
bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="MEDIAN")
obj.location = (0.0, 0.0, 0.0)

# Normalise bounding-box to unit (max dimension = 1.0). bound_box is in
# local space, so use the corners directly.
corners = [mathutils.Vector(c) for c in obj.bound_box]
min_v = mathutils.Vector(
    (min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners))
)
max_v = mathutils.Vector(
    (max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners))
)
extent = max(max_v - min_v)
if extent <= 0.0:
    sys.stderr.write("error: zero-extent geometry\n")
    sys.exit(2)
inv = 1.0 / extent
obj.scale = (inv, inv, inv)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# Export GLB (binary glTF 2.0). Materials are preserved as PBR.
bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format="GLB",
    export_apply=True,
    export_materials="EXPORT",
    export_texture_dir="",
    export_animations=False,
    export_cameras=False,
    export_lights=False,
    use_selection=True,
)
