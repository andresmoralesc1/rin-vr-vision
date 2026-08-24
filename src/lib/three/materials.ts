import { MeshPhysicalMaterial, Color } from 'three';

export function makeChrome() {
  return new MeshPhysicalMaterial({
    color: new Color('#E5E7EB'),
    metalness: 1.0,
    roughness: 0.05,
    envMapIntensity: 1.5,
  });
}

export function makeMatteBlack() {
  return new MeshPhysicalMaterial({
    color: new Color('#1F2937'),
    metalness: 0.4,
    roughness: 0.85,
    envMapIntensity: 0.5,
  });
}

export function makeSilver() {
  return new MeshPhysicalMaterial({
    color: new Color('#CBD5E1'),
    metalness: 0.9,
    roughness: 0.2,
    envMapIntensity: 1.0,
  });
}

export type Finish = 'chrome' | 'matte-black' | 'silver';
export function materialForFinish(finish: Finish) {
  switch (finish) {
    case 'chrome': return makeChrome();
    case 'matte-black': return makeMatteBlack();
    case 'silver': return makeSilver();
  }
}