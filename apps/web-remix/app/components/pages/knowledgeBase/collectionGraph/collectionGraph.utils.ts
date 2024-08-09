import { hashString } from '~/utils/stringHash';

export const NEXT_NODE_COLOR = 'hsl(347, 81.8%, 42.7%)';
export const PREV_NODE_COLOR = 'hsl(0, 0%, 0%)';
export const SEARCH_NODE_COLOR = 'hsl(47.9 95.8% 53.1%)';

const COLORS: Record<string, string> = {};
const RESERVED_COLORS = [SEARCH_NODE_COLOR, PREV_NODE_COLOR, NEXT_NODE_COLOR];
const colorThreshold = 0.1;

export function getColorForUid(uid: string): string {
  if (COLORS[uid]) return COLORS[uid];

  const hash = hashString(uid);

  const hsl = generateHSLColor(hash, RESERVED_COLORS);

  COLORS[uid] = hsl;

  return hsl;
}

const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;

function generateHSLColor(
  hash: number,
  reservedColors: string[],
  breakIndex: number = 5,
): string {
  const hue = (Math.abs(hash * GOLDEN_RATIO_CONJUGATE) % 1.0) * 360;
  const saturation = 50 + (Math.abs(hash * 0.3) % 50);
  const lightness = 50 + (Math.abs(hash * 0.2) % 30);

  let hsl = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  const isToClosed = isColorTooCloseToReserved(hsl, reservedColors);

  if (breakIndex > 0 && isToClosed) {
    hsl = generateHSLColor(hash + 1, reservedColors, breakIndex - 1);
  } else if (breakIndex <= 0 && isToClosed) {
    hsl = `hsl(${Math.random() * 360}, ${50 + Math.random() * 50}%, ${50 + Math.random() * 30}%)`;
  }

  return hsl;
}

function isColorTooCloseToReserved(
  color: string,
  reservedColors: string[],
): boolean {
  const [h1, s1, l1] = parseHSL(color);

  for (const reservedColor of reservedColors) {
    const [h2, s2, l2] = parseHSL(reservedColor);
    if (colorDistance(h1, s1, l1, h2, s2, l2) < colorThreshold) {
      return true;
    }
  }
  return false;
}

function parseHSL(hsl: string): [number, number, number] {
  const hslValues = hsl
    .replace(/[^\d,.]/g, '')
    .split(',')
    .map(Number);

  return [hslValues[0], hslValues[1], hslValues[2]];
}

function colorDistance(
  h1: number,
  s1: number,
  l1: number,
  h2: number,
  s2: number,
  l2: number,
): number {
  const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 360;
  const ds = Math.abs(s1 - s2) / 100;
  const dl = Math.abs(l1 - l2) / 100;
  return Math.sqrt(dh * dh + ds * ds + dl * dl);
}
