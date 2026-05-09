import { useMemo, useState } from 'react'
import { MiniGameModal } from '../components/MiniGameModal'
import { Panel } from '../components/Panel'
import { QuestCard } from '../components/QuestCard'
import { QUESTS } from '../data/quests'
import { buildPlayerCombatants, useGameStore } from '../store/useGameStore'
import type { MiniGameResult, QuestDef } from '../types/quests'
import { canStartQuest } from '../utils/questEngine'

export function Missions() {
  const completedMissions = useGameStore((s) => s.completedMissions)
  const questProgress = useGameStore((s) => s.questProgress)
  const robotName = useGameStore((s) => s.robotName)
  const paintColorId = useGameStore((s) => s.paintColorId)
  const upgradeLevels = useGameStore((s) => s.upgradeLevels)
  const completeQuestWithResult = useGameStore((s) => s.completeQuestWithResult)

  const [active, setActive] = useState<QuestDef | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const trainingProfile = useMemo(
    () => buildPlayerCombatants({ robotName, paintColorId, upgradeLevels }),
    [robotName, paintColorId, upgradeLevels],
  )

  const handleModalComplete = (questId: string, r: MiniGameResult) => {
    const res = completeQuestWithResult(questId, r)
    if (!res.ok && res.message) {
      setToast(res.message)
      window.setTimeout(() => setToast(null), 2600)
    }
  }

  const snap = useGameStore.getState()

  return (
    <Panel title="Operations board" subtitle="Side quests & mini-missions. Play for rewards once.">
      {toast ? (
        <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
          {toast}
        </p>
      ) : null}
      <ul className="space-y-3">
        {QUESTS.map((q) => {
          const done = completedMissions.includes(q.id)
          const avail = canStartQuest(q, snap).ok
          const locked = !avail && !done
          const prog = questProgress[q.id]
          return (
            <QuestCard
              key={q.id}
              quest={q}
              locked={locked}
              completed={done}
              canReplay={done && q.type === 'minigame'}
              bestScore={prog?.bestScore}
              attempts={prog?.attempts}
              onOpen={() => {
                const fresh = useGameStore.getState()
                const gate = canStartQuest(q, fresh)
                if (!gate.ok && !done) {
                  setToast(gate.message ?? 'Locked.')
                  window.setTimeout(() => setToast(null), 2400)
                  return
                }
                if (done && q.type === 'story') return
                setActive(q)
              }}
            />
          )
        })}
      </ul>

      {active ? (
        <MiniGameModal
          quest={active}
          allowRewards={!completedMissions.includes(active.id)}
          trainingProfile={trainingProfile}
          onClose={() => setActive(null)}
          onComplete={(r) => handleModalComplete(active.id, r)}
        />
      ) : null}
    </Panel>
  )
}
