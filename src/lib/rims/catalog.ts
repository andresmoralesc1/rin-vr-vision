export type RimStyle = 'sport' | 'mesh' | 'concave' | 'turbine' | 'classic' | 'split';

export type RimModel = {
  /** Stable identifier used by the reducer and as React key. */
  id: string;
  /** Display label in the picker. */
  label: string;
  /** Visual style bucket — used for icon + future filtering. */
  style: RimStyle;
  /** Public path to the GLB (served by Next.js from `public/`). */
  glbUrl: string;
  /**
   * Native scale multiplier applied to the GLB's unit bounding box.
   * 1.0 = render at the unit size; higher = larger tire.
   * The picker normalises `calibration.scale` so the rim covers roughly
   * the same screen area across models regardless of `defaultScale`.
   */
  defaultScale: number;
  /** Attribution for the source asset (CC0 = no name required, listed for transparency). */
  attribution?: string;
};

/**
 * Curated catalog of CC0 / freely-licensed rim GLBs.
 *
 * Today this ships with one seeded model (the Quaternius wheel already
 * in production). To expand the catalog:
 *   1. Download a CC0 rim from the URLs in `public/models/catalog/SOURCES.md`.
 *   2. Run `scripts/convert-rims.sh <input.{fbx,obj,blend}> <slug>`.
 *   3. Append an entry to this array.
 *
 * The reducer (`@/lib/calibration/reducer`) only requires that every
 * entry's `id` is unique and that `glbUrl` resolves.
 */
export const CATALOG: readonly RimModel[] = [
  {
    id: 'quaternius-5spoke',
    label: '5-spoke Sport',
    style: 'sport',
    glbUrl: '/models/wheel.glb',
    defaultScale: 1.0,
    attribution: 'Quaternius Cars Pack · CC0',
  },
] as const;

export type RimModelId = (typeof CATALOG)[number]['id'];

/**
 * Look up a rim by id. Falls back to the first catalog entry if the id
 * is unknown — this keeps the AR view rendering even when a stale
 * `modelId` from localStorage points at a removed entry.
 */
export function getRim(id: string): RimModel {
  return CATALOG.find((r) => r.id === id) ?? CATALOG[0]!;
}
