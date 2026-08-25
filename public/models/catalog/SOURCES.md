# Rim Catalog Sources

This directory holds GLB models for the rim picker. The catalog is
seeded with one model (`/models/wheel.glb`, Quaternius CC0); see the
appended table for candidates ready to download and convert.

## Adding a rim

1. Pick an entry below and click through to the source page. Sketchfab
   requires login for download — sign in once, then save the ZIP locally.
2. Extract the mesh file (`.fbx`, `.obj`, or `.blend`). If multiple
   meshes are present, isolate the rim in Blender before exporting
   (delete body, chassis, tire, etc.).
3. Convert to GLB:
   ```
   scripts/convert-rims.sh /path/to/rim.fbx my-rim-slug
   ```
4. Append an entry to `src/lib/rims/catalog.ts` and commit.

## License requirement

Every entry must be CC0 (Public Domain) or a license that allows
commercial redistribution without attribution. Sketchfab models
labelled "Downloadable" with `CC0` are safe; `CC-BY` is also fine if
the `attribution` field is populated.

## Candidates (CC0 / freely licensed)

| Slug candidate | Source | License | Notes |
|----------------|--------|---------|-------|
| `mesh-7spoke` | https://sketchfab.com/3d-models/collections/wheels-85f1724945284c2a9b10179275506803 | CC0 (varies per model — verify on download page) | Sketchfab collection curated for wheels. ~30 entries. |
| `concave-5` | https://poly.pizza/search/?q=wheel | Mostly CC-BY (verify per model) | Poly.pizza hosts a handful of wheels in low-poly style. |
| `turbine-10` | (same as above) | (verify) | Search "rim" or "alloy wheel" on poly.pizza. |
| `classic-8` | KhronosGroup `glTF-Sample-Models` (https://github.com/KhronosGroup/glTF-Sample-Models) | Various — most CC0 / CC-BY | No wheel samples currently; check before relying on this. |
| `quaternius-5spoke` | Already seeded at `/models/wheel.glb` | CC0 | https://quaternius.com/packs/cars.html |

## Why so few candidates?

There is no central open-source repository of rim models. Most
production wheels are scan-only commercial assets. The realistic
expansion path is:

- Acquire 5-10 high-quality CC0 wheels via the Sketchfab collection.
- Optionally pay a 3D artist to produce variants in a consistent style.
- Add texture variants (carbon, brushed, painted) by extending the
  `Finish` union in `src/lib/three/materials.ts` rather than by
  acquiring more geometry.
