import { useState } from 'react'
import { QUESTS } from '../data/quests'
import { AchievementsStrip } from '../components/AchievementsStrip'
import { BottomActionBar } from '../components/BottomActionBar'
import { CharactersPanel } from '../components/CharactersPanel'
import { GarageColorsStrip } from '../components/GarageColorsStrip'
import { GarageHeroScene } from '../components/GarageHeroScene'
import { GarageWorkbenchPanel } from '../components/GarageWorkbenchPanel'
import { PvpPreviewPanel } from '../components/PvpPreviewPanel'
import { RobotsPanel } from '../components/RobotsPanel'
import { UpgradePartsStrip } from '../components/UpgradePartsStrip'
import { useGameStore } from '../store/useGameStore'
import type { UpgradeId } from '../types/game'

export function Dashboard() {
  const paintColorId = useGameStore((s) => s.paintColorId)
  const completed = useGameStore((s) => s.completedMissions)
  const upgradeLevels = useGameStore((s) => s.upgradeLevels)
  const [focusPart, setFocusPart] = useState<UpgradeId>('head')

  const missionPct = Math.round((completed.length / QUESTS.length) * 100)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1fr_200px]">
        <GarageHeroScene paintColorId={paintColorId} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <CharactersPanel />
          <RobotsPanel />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2 text-xs text-slate-400">
        <span className="font-bold text-cyan-200/90">Campaign</span>
        <div className="h-2 min-w-[120px] flex-1 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all"
            style={{ width: `${missionPct}%` }}
          />
        </div>
        <span>
          {completed.length}/{QUESTS.length}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <GarageWorkbenchPanel focusPart={focusPart} />
        <PvpPreviewPanel />
      </div>

      <UpgradePartsStrip selected={focusPart} onSelect={setFocusPart} levels={upgradeLevels} />

      <div className="grid gap-3 lg:grid-cols-2">
        <GarageColorsStrip />
        <AchievementsStrip />
      </div>

      <BottomActionBar />
    </div>
  )
}
