/** N=1, E=2, S=4, W=8 */
export function rotatePipeMask(mask: number): number {
  let o = 0;
  if (mask & 1) o |= 2;
  if (mask & 2) o |= 4;
  if (mask & 4) o |= 8;
  if (mask & 8) o |= 1;
  return o;
}

export function effectivePipeMask(base: number, rot: number): number {
  let m = base;
  for (let i = 0; i < ((rot % 4) + 4) % 4; i++) {
    m = rotatePipeMask(m);
  }
  return m;
}

/** Solved layout: 3×3 coolant path (all user rotations 0). */
export const PIPE_BASE_MASKS: number[][] = [
  [14, 10, 12],
  [5, 10, 5],
  [11, 10, 10],
];

export function pipePuzzleSolved(userRot: number[][]): boolean {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (
        effectivePipeMask(PIPE_BASE_MASKS[r][c], userRot[r][c]) !==
        PIPE_BASE_MASKS[r][c]
      ) {
        return false;
      }
    }
  }
  return true;
}

export function randomPipeRotations(): number[][] {
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => Math.floor(Math.random() * 4)),
  );
}
