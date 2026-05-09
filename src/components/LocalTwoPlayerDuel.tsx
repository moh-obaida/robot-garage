import { useState } from 'react';
import { couchTriangleResult, type BattleMove as Tactic } from '../logic/battleEngine';

const LABEL: Record<Tactic, string> = {
  strike: 'Strike',
  guard: 'Guard',
  overload: 'Overload',
};

export type CouchDifficulty = 'easy' | 'standard' | 'challenge';

function roundsToWin(d: CouchDifficulty): number {
  if (d === 'easy') return 1;
  if (d === 'standard') return 2;
  return 3;
}

function tipForLoss(d: CouchDifficulty): string {
  if (d === 'easy') {
    return 'Tip: Strike beats Overload on the triangle — try changing your opener.';
  }
  if (d === 'standard') {
    return 'Tip: Watch for ties — they replay without giving a point.';
  }
  return 'Tip: Mix two Guards then a surprise Strike to break a read-heavy opponent.';
}

export function LocalTwoPlayerDuel() {
  const [difficulty, setDifficulty] = useState<CouchDifficulty>('standard');
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [turn, setTurn] = useState<'p1' | 'p2'>('p1');
  const [p1Pick, setP1Pick] = useState<Tactic | null>(null);
  const [phase, setPhase] = useState<'pick' | 'over'>('pick');
  const [msg, setMsg] = useState(
    'Hot seat: Player 1 picks a tactic, then Player 2. Ties replay with no point.',
  );
  const need = roundsToWin(difficulty);

  const resetMatch = () => {
    setScores([0, 0]);
    setTurn('p1');
    setP1Pick(null);
    setPhase('pick');
    setMsg('New match — Player 1 leads the exchange.');
  };

  const pick = (t: Tactic) => {
    if (phase !== 'pick') return;
    if (turn === 'p1') {
      setP1Pick(t);
      setTurn('p2');
      setMsg(`Player 1 locked ${LABEL[t]}. Player 2 — your move.`);
      return;
    }
    if (!p1Pick) return;
    const r = couchTriangleResult(p1Pick, t);
    if (r === 'tie') {
      setTurn('p1');
      setP1Pick(null);
      setMsg('Clash — same tactic. Replay the exchange from Player 1.');
      return;
    }
    const p1Wins = r === 'p1';
    const next: [number, number] = p1Wins
      ? [scores[0] + 1, scores[1]]
      : [scores[0], scores[1] + 1];
    setScores(next);
    setTurn('p1');
    setP1Pick(null);
    setMsg(
      p1Wins
        ? `Player 1 wins the exchange · ${next[0]}–${next[1]}`
        : `Player 2 wins the exchange · ${next[0]}–${next[1]}`,
    );
    if (next[0] >= need || next[1] >= need) {
      setPhase('over');
      setMsg(
        next[0] >= need
          ? `Player 1 takes the couch cup (${need} needed).`
          : `Player 2 takes the couch cup (${need} needed). ${tipForLoss(difficulty)}`,
      );
    }
  };

  return (
    <section className="rg-pit-section">
      <h3 className="rg-pit-h3">Local two-player — couch cup</h3>
      <p className="rg-pit-muted">
        Same triangle as the pit. Easy = first to 1 · Standard = first to 2 · Challenge = first to
        3.
      </p>
      <div className="rg-couch-diff" role="group" aria-label="Difficulty">
        {(
          [
            ['easy', 'Easy'],
            ['standard', 'Standard'],
            ['challenge', 'Challenge'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`rg-btn rg-btn-ghost${difficulty === id ? ' rg-couch-diff-active' : ''}`}
            disabled={phase === 'pick' && (scores[0] > 0 || scores[1] > 0)}
            onClick={() => {
              setDifficulty(id);
              resetMatch();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="rg-pit-score">
        Couch score: <strong>{scores[0]}</strong> – <strong>{scores[1]}</strong> · First to{' '}
        <strong>{need}</strong>
      </p>
      <p className={`rg-feedback info`} style={{ marginTop: '0.5rem' }}>
        {msg}
      </p>
      <p className="rg-pit-muted" style={{ marginTop: '0.35rem' }}>
        {phase === 'pick'
          ? turn === 'p1'
            ? 'Waiting: Player 1'
            : 'Waiting: Player 2'
          : 'Match finished — rematch anytime.'}
      </p>
      <div className="rg-tactic-row">
        {(Object.keys(LABEL) as Tactic[]).map((t) => (
          <button
            key={t}
            type="button"
            className="rg-btn rg-btn-primary"
            disabled={phase !== 'pick'}
            onClick={() => pick(t)}
          >
            {LABEL[t]}
          </button>
        ))}
      </div>
      {phase === 'over' ? (
        <button type="button" className="rg-btn rg-btn-success" onClick={resetMatch}>
          Rematch
        </button>
      ) : null}
    </section>
  );
}
