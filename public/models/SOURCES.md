# 3D Model Sources

| File | Source URL | License | Original Asset | Date Downloaded | Size |
|-------|-----------|---------|----------------|-----------------|------|
| `wheel.glb` | https://quaternius.com/packs/cars.html (pack page, hosted on Google Drive) | CC0 (https://quaternius.com/license.html) | `SportsCar_FrontLeftWheel_Cylinder.013` (extracted from `SportsCar.obj` in Quaternius Cars Pack) | 2026-08-24 | 37,964 bytes |

## Notes

- Geometry only. No embedded materials, textures, or images — PBR finishes (chrome, matte black, silver) are applied at runtime in `src/lib/three/materials.ts` per the design spec ("one rim model in 3 finishes").
- Original asset is the front-left wheel mesh from the Quaternius Cars Pack's `SportsCar.obj`. The wheel geometry is shared across all 7 car models in the pack, so a single wheel is representative.
- Vertices: 1,339. Triangles: 420. Bounding-box scale ≈ [-0.5, 0.5] in each axis (wheel is a unit cylinder — caller must scale to tire size).
- 1339 / 1260 = vertex reuse ratio 1.06 — geometry is reasonably tight but not indexed-optimized; index buffer kept anyway for downstream tools that expect glTF primitives.

## Source pack contents (Cars Pack)

Downloaded pack contained 7 car models (OBJ/FBX/Blend each):

- `Cop`, `NormalCar1`, `NormalCar2`, `SportsCar`, `SportsCar2`, `SUV`, `Taxi`

Each car OBJ has separate wheel sub-objects named `<CarName>_FrontLeftWheel_Cylinder.*`, `<CarName>_FrontRightWheel_Cylinder.*`, `<CarName>_BackWheels_Cylinder.*` (and tire/rim are split into separate sub-meshes within each wheel using OBJ `usemtl Black/Grey`).

## Re-download

```
# Pack is served via Google Drive folder linked from the pack page
gdown --folder "https://drive.google.com/drive/folders/1fKlbDry77iY8KlEoxzUxIAZQL_XhzWlA?usp=sharing" -O ./quaternius-cars
```

Then re-extract using `/tmp/obj_to_glb.py`:

```
python3 /tmp/obj_to_glb.py quaternius-cars/OBJ/SportsCar.obj "SportsCar_FrontLeftWheel_Cylinder.013" wheel.glb
```

## License (verbatim from `License.txt`)

```
Credit is not necessary but always appreciated.
You can modify and use these assets in commercial and non-commercial
projects without any cost.
```