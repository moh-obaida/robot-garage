export type MazeCell = { n: boolean; e: boolean; s: boolean; w: boolean };

const ROWS = 7;
const COLS = 7;

function idx(r: number, c: number): number {
  return r * COLS + c;
}

/** Recursive backtracker; returns wall grid as adjacency openings per cell. */
export function generateMaze(seed: number): MazeCell[][] {
  let s = seed % 2147483647;
  const rand = () => {
    s = (s * 48271 + 12345) % 2147483647;
    return s / 2147483647;
  };

  const visited = new Array(ROWS * COLS).fill(false);
  const hWall = new Array(ROWS * COLS).fill(true);
  const vWall = new Array(ROWS * COLS).fill(true);

  const stack: number[] = [];
  const start = 0;
  visited[start] = true;
  stack.push(start);

  const neighbors = (i: number): number[] => {
    const r = Math.floor(i / COLS);
    const c = i % COLS;
    const out: number[] = [];
    if (r > 0) out.push(idx(r - 1, c));
    if (c < COLS - 1) out.push(idx(r, c + 1));
    if (r < ROWS - 1) out.push(idx(r + 1, c));
    if (c > 0) out.push(idx(r, c - 1));
    return out;
  };

  while (stack.length) {
    const cur = stack[stack.length - 1];
    const r = Math.floor(cur / COLS);
    const c = cur % COLS;
    const opts = neighbors(cur).filter((n) => !visited[n]);
    if (opts.length === 0) {
      stack.pop();
      continue;
    }
    const next = opts[Math.floor(rand() * opts.length)];
    const nr = Math.floor(next / COLS);
    const nc = next % COLS;
    if (nr < r) {
      hWall[cur] = false;
    } else if (nr > r) {
      hWall[next] = false;
    } else if (nc > c) {
      vWall[cur] = false;
    } else {
      vWall[next] = false;
    }
    visited[next] = true;
    stack.push(next);
  }

  const cells: MazeCell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: MazeCell[] = [];
    for (let c = 0; c < COLS; c++) {
      const i = idx(r, c);
      row.push({
        n: r === 0 ? false : !hWall[i],
        e: c === COLS - 1 ? false : !vWall[i],
        s: r === ROWS - 1 ? false : !hWall[idx(r + 1, c)],
        w: c === 0 ? false : !vWall[idx(r, c - 1)],
      });
    }
    cells.push(row);
  }
  return cells;
}

export const MAZE_ROWS = ROWS;
export const MAZE_COLS = COLS;
