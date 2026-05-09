import type { ReactNode } from 'react';
import { MINIGAME_META, type MinigameId } from '../data/minigameMeta';
import type { MinigameProgress } from '../store/gameStore';

export type FeedbackKind = 'info' | 'success' | 'error';

export interface MinigameShellProps {
  gameId: MinigameId;
  progress: MinigameProgress;
  onBack: () => void;
  feedback: { kind: FeedbackKind; text: string } | null;
  children: ReactNode;
}

export function MinigameShell({
  gameId,
  progress,
  onBack,
  feedback,
  children,
}: MinigameShellProps) {
  const meta = MINIGAME_META[gameId];
  const rewardLine = progress.firstRewardClaimed
    ? 'First clear bonus already banked — replays chase a higher score only.'
    : `First clear: +${meta.firstRewardScrap} scrap · +${meta.firstRewardXp} XP`;

  return (
    <div className="rg-panel" style={{ marginTop: '0.5rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ flex: '1 1 200px' }}>
          <h2 className="rg-panel-title" style={{ marginBottom: '0.25rem' }}>
            {meta.title}
          </h2>
          <p style={{ margin: 0, color: 'var(--rg-muted)', fontSize: '0.9rem' }}>
            {meta.blurb}
          </p>
          <p
            style={{
              margin: '0.5rem 0 0',
              fontSize: '0.85rem',
              color: 'var(--rg-cyan)',
            }}
          >
            {rewardLine}
          </p>
          {progress.bestScore !== null && (
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
              Best score: <strong>{progress.bestScore}</strong>
            </p>
          )}
        </div>
        <button type="button" className="rg-btn rg-btn-ghost" onClick={onBack}>
          ← Garage
        </button>
      </div>

      {feedback && (
        <div className={`rg-feedback ${feedback.kind}`}>{feedback.text}</div>
      )}

      {children}
    </div>
  );
}
