import { useCallback, useEffect, useRef, useState } from 'react';
import type { MinigameResultInput } from '../../store/gameStore';

interface Props {
  onFinish: (result: MinigameResultInput) => void;
}

type Phase = 'ready' | 'playing' | 'won' | 'lost';

const W = 360;
const H = 420;
const PADDLE_W = 72;
const PADDLE_H = 10;
const BALL_R = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 6;
const BRICK_H = 22;
const BRICK_PAD = 4;
const BRICK_TOP = 56;

interface Brick {
  x: number;
  y: number;
  alive: boolean;
}

function makeBricks(): Brick[] {
  const list: Brick[] = [];
  const totalW = BRICK_COLS * (W / BRICK_COLS - BRICK_PAD) + BRICK_PAD;
  const startX = (W - totalW) / 2 + BRICK_PAD / 2;
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      const bw = W / BRICK_COLS - BRICK_PAD;
      list.push({
        x: startX + c * (bw + BRICK_PAD),
        y: BRICK_TOP + r * (BRICK_H + 4),
        alive: true,
      });
    }
  }
  return list;
}

export function BlockBreakerGame({ onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [hint, setHint] = useState(
    'Move the deflector with ← → or A D. Shatter every scrap brick — do not drop the core.',
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<Phase>('ready');
  const finishedRef = useRef(false);
  const rafRef = useRef(0);

  const paddleX = useRef(W / 2 - PADDLE_W / 2);
  const ball = useRef({ x: W / 2, y: H - 80, vx: 2.4, vy: -2.4 });
  const bricksRef = useRef<Brick[]>(makeBricks());
  const keys = useRef<Set<string>>(new Set());
  const startedAt = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const safeFinish = useCallback(
    (result: MinigameResultInput) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinish(result);
    },
    [onFinish],
  );

  const resetRound = useCallback(() => {
    finishedRef.current = false;
    paddleX.current = W / 2 - PADDLE_W / 2;
    ball.current = { x: W / 2, y: H - 80, vx: 2.4, vy: -2.4 };
    bricksRef.current = makeBricks();
    startedAt.current = performance.now();
    setPhase('playing');
    setHint('Keep the energy core bouncing — clear the wall.');
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current.add(e.key);
    };
    const up = (e: KeyboardEvent) => {
      keys.current.delete(e.key);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tick = () => {
      if (phaseRef.current !== 'playing') return;

      const k = keys.current;
      const speed = 5.5;
      if (k.has('ArrowLeft') || k.has('a') || k.has('A')) {
        paddleX.current = Math.max(8, paddleX.current - speed);
      }
      if (k.has('ArrowRight') || k.has('d') || k.has('D')) {
        paddleX.current = Math.min(W - PADDLE_W - 8, paddleX.current + speed);
      }

      const b = ball.current;
      b.x += b.vx;
      b.y += b.vy;

      if (b.x - BALL_R < 0) {
        b.x = BALL_R;
        b.vx *= -1;
      } else if (b.x + BALL_R > W) {
        b.x = W - BALL_R;
        b.vx *= -1;
      }
      if (b.y - BALL_R < 0) {
        b.y = BALL_R;
        b.vy *= -1;
      }

      const py = H - 36;
      const px = paddleX.current;
      if (
        b.y + BALL_R >= py &&
        b.y + BALL_R <= py + PADDLE_H + BALL_R &&
        b.x >= px &&
        b.x <= px + PADDLE_W &&
        b.vy > 0
      ) {
        b.y = py - BALL_R;
        b.vy *= -1;
        const hit = (b.x - (px + PADDLE_W / 2)) / (PADDLE_W / 2);
        b.vx += hit * 1.8;
        b.vx = Math.max(-4.5, Math.min(4.5, b.vx));
      }

      if (b.y - BALL_R > H) {
        setPhase('lost');
        setHint('Core hit the floor — nudge sooner next run. ← → moves the deflector.');
        safeFinish({ won: false });
        return;
      }

      const bw = W / BRICK_COLS - BRICK_PAD;
      for (const br of bricksRef.current) {
        if (!br.alive) continue;
        if (
          b.x + BALL_R > br.x &&
          b.x - BALL_R < br.x + bw &&
          b.y + BALL_R > br.y &&
          b.y - BALL_R < br.y + BRICK_H
        ) {
          br.alive = false;
          const overlapL = b.x + BALL_R - br.x;
          const overlapR = br.x + bw - (b.x - BALL_R);
          const overlapT = b.y + BALL_R - br.y;
          const overlapB = br.y + BRICK_H - (b.y - BALL_R);
          const m = Math.min(overlapL, overlapR, overlapT, overlapB);
          if (m === overlapL || m === overlapR) b.vx *= -1;
          else b.vy *= -1;
          break;
        }
      }

      const left = bricksRef.current.filter((x) => x.alive).length;
      if (left === 0) {
        const ms = performance.now() - startedAt.current;
        const score = 800 + Math.max(0, Math.floor(400 - ms / 40));
        setPhase('won');
        setHint(`Wall cleared! Time bonus baked into score ${score}.`);
        safeFinish({ won: true, scoreIfWin: score });
        return;
      }

      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(88,212,255,0.35)';
      ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

      for (const br of bricksRef.current) {
        if (!br.alive) continue;
        ctx.fillStyle = 'rgba(255,214,102,0.9)';
        ctx.strokeStyle = 'rgba(88,212,255,0.55)';
        ctx.fillRect(br.x, br.y, bw, BRICK_H);
        ctx.strokeRect(br.x + 0.5, br.y + 0.5, bw - 1, BRICK_H - 1);
      }

      ctx.fillStyle = 'rgba(88,212,255,0.95)';
      ctx.fillRect(px, py, PADDLE_W, PADDLE_H);

      ctx.beginPath();
      ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe066';
      ctx.fill();

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, safeFinish]);

  const nudge = (dir: -1 | 1) => {
    if (phase !== 'playing') return;
    const speed = 28;
    paddleX.current = Math.max(
      8,
      Math.min(W - PADDLE_W - 8, paddleX.current + dir * speed),
    );
  };

  return (
    <div className="rg-vehicle-game">
      <p className="rg-vehicle-hint">{hint}</p>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          width: '100%',
          maxWidth: W,
          border: '2px solid var(--rg-cyan-dim)',
          borderRadius: 10,
          background: '#0d1117',
        }}
      />
      <div className="rg-vehicle-controls">
        <button type="button" className="rg-btn rg-btn-ghost" onClick={() => nudge(-1)}>
          ◀
        </button>
        <button type="button" className="rg-btn rg-btn-ghost" onClick={() => nudge(1)}>
          ▶
        </button>
      </div>
      <div className="rg-vehicle-actions">
        {phase === 'ready' && (
          <button type="button" className="rg-btn rg-btn-primary" onClick={resetRound}>
            Launch core
          </button>
        )}
        {(phase === 'won' || phase === 'lost') && (
          <button type="button" className="rg-btn rg-btn-success" onClick={resetRound}>
            Play again
          </button>
        )}
      </div>
    </div>
  );
}
