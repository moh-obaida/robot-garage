import type { QuestDef } from '../types/quests'

function typeLabel(type: QuestDef['type'], mini?: QuestDef['miniGame']) {
  if (type === 'story') return 'Story'
  switch (mini) {
    case 'coreCharge':
      return 'Core'
    case 'wireRepair':
      return 'Wires'
    case 'junkyardSearch':
      return 'Search'
    case 'speedTest':
      return 'Speed'
    case 'balanceTest':
      return 'Balance'
    case 'trainingBattle':
      return 'Battle'
    case 'memoryCircuit':
      return 'Memory'
    default:
      return 'Quest'
  }
}

export function QuestCard({
  quest,
  locked,
  completed,
  canReplay,
  bestScore,
  onOpen,
}: {
  quest: QuestDef
  locked: boolean
  completed: boolean
  canReplay: boolean
  bestScore?: number
  onOpen: () => void
}) {
  const tone = completed
    ? 'border-emerald-500/45 bg-emerald-950/25'
    : locked
      ? 'border-slate-800 bg-slate-950/40 opacity-75'
      : 'border-cyan-500/35 bg-slate-950/55'

  return (
    <li className={`rounded-2xl border-2 p-4 ${tone}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-slate-50">
              {quest.name}
            </h3>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-200">
              {typeLabel(quest.type, quest.miniGame)}
            </span>
            <span className="text-xs text-slate-500">Lv {quest.requiredLevel}</span>
          </div>
          <p className="mt-2 text-sm text-slate-400">{quest.description}</p>
          <p className="mt-2 text-xs text-amber-200/90">
            +{quest.rewardScrap} scrap · +{quest.rewardXp} XP
            {quest.unlockColorId ? (
              <span className="text-fuchsia-300"> · Paint: {quest.unlockColorId}</span>
            ) : null}
          </p>
          {bestScore != null ? (
            <p className="mt-1 text-xs text-slate-500">Best score: {bestScore}</p>
          ) : null}
          {locked ? (
            <p className="mt-1 text-xs text-slate-500">Locked — finish earlier ops.</p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={locked || (completed && !canReplay)}
          onClick={onOpen}
          className={`min-h-[48px] shrink-0 rounded-xl px-5 py-2.5 text-sm font-bold ${
            locked || (completed && !canReplay)
              ? 'cursor-not-allowed bg-slate-800 text-slate-600'
              : completed && canReplay
                ? 'bg-violet-500 text-white hover:bg-violet-400'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
          }`}
        >
          {completed ? (canReplay ? 'Replay' : 'Cleared') : locked ? 'Locked' : 'Play'}
        </button>
      </div>
    </li>
  )
}
