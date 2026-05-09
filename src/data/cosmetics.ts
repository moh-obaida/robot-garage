export const PAINT_ORDER = [
  'primer-slate',
  'solar-flare',
  'midnight-cyan',
  'yard-rust',
] as const;

export type PaintId = (typeof PAINT_ORDER)[number];

export interface PaintDef {
  id: PaintId;
  label: string;
  blurb: string;
  scrapCost: number;
  /** CSS gradient or colors for robot bust preview */
  shellStyle: string;
  accent: string;
}

export const PAINT_DEFS: Record<PaintId, PaintDef> = {
  'primer-slate': {
    id: 'primer-slate',
    label: 'Primer Slate',
    blurb: 'Stock yard coat — always ready.',
    scrapCost: 0,
    shellStyle: 'linear-gradient(180deg, #1c2128, #0d1117)',
    accent: 'var(--rg-yellow)',
  },
  'solar-flare': {
    id: 'solar-flare',
    label: 'Solar Flare',
    blurb: 'Warm panels with a sunrise edge.',
    scrapCost: 45,
    shellStyle: 'linear-gradient(135deg, #3d2814 0%, #f0a030 55%, #ffe08a 100%)',
    accent: '#ffb020',
  },
  'midnight-cyan': {
    id: 'midnight-cyan',
    label: 'Midnight Cyan',
    blurb: 'Deep coat with live cyan traces.',
    scrapCost: 55,
    shellStyle: 'linear-gradient(180deg, #0a1620 0%, #132a38 45%, #1a3d4d 100%)',
    accent: 'var(--rg-cyan)',
  },
  'yard-rust': {
    id: 'yard-rust',
    label: 'Yard Rust',
    blurb: 'Honest patina from real field work.',
    scrapCost: 38,
    shellStyle: 'linear-gradient(160deg, #3b2a1f 0%, #6b4423 40%, #8b5a2b 100%)',
    accent: '#c97a4a',
  },
};

export const DEFAULT_PAINT_ID: PaintId = 'primer-slate';

export function createDefaultPaintsOwned(): Record<PaintId, boolean> {
  const o = {} as Record<PaintId, boolean>;
  for (const id of PAINT_ORDER) {
    o[id] = id === DEFAULT_PAINT_ID;
  }
  return o;
}
