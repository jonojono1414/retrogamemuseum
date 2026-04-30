import bpy
import sys
import os

argv = sys.argv
argv = argv[argv.index("--") + 1:]
output_path = argv[0]

# Remove default objects
# bpy.ops.object.select_all(action='SELECT')
# bpy.ops.object.delete()

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    export_apply=True,
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT',
)

print(f"Exported to: {output_path}")
