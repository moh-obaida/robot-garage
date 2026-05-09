import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QUESTS } from '../data/quests'
import { COLORS } from '../data/colors'
import { UPGRADE_META } from '../data/upgrades'
import { RobotFigure } from '../components/RobotFigure'
import { GarageHeroScene } from '../components/GarageHeroScene'
import { useGameStore, selectCombatStats, rankFromTrophies } from '../store/useGameStore'
import { ROUTES } from '../types/game'
import type { UpgradeId } from '../types/game'
import { nextUpgradeCost } from '../data/upgrades'

export function Dashboard() {
  const paintColorId = useGameStore((s) => s.paintColorId)
  const robotName = useGameStore((s) => s.robotName)
  const level = useGameStore((s) => s.level)
  const scrap = useGameStore((s) => s.scrap)
  const completed = useGameStore((s) => s.completedMissions)
  const upgradeLevels = useGameStore((s) => s.upgradeLevels)
  const unlockedColors = useGameStore((s) => s.unlockedColors)
  const trophies = useGameStore((s) => s.trophies)
  const tryBuyUpgrade = useGameStore((s) => s.tryBuyUpgrade)
  const equipColor = useGameStore((s) => s.equipColor)
  const tryUnlockColorWithScrap = useGameStore((s) => s.tryUnlockColorWithScrap)

  const [focusPart, setFocusPart] = useState<UpgradeId>('head')

  const stats = selectCombatStats(upgradeLevels)
  const missionPct = Math.round((completed.length / QUESTS.length) * 100)

  // Get first 2-3 incomplete missions for preview
  const upcomingMissions = QUESTS.filter((q) => !completed.includes(q.id)).slice(0, 3)

  // Get upgrade info for focused part
  const focusLv = upgradeLevels[focusPart] ?? 1
  const focusCost = nextUpgradeCost(focusPart, focusLv)
  const focusMaxed = focusLv >= 5
  const canBuyFocus = !focusMaxed && focusCost != null && scrap >= focusCost

  return (
    <div className="space-y-4">
      {/* HERO GARAGE SCENE - Main visual focus */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/80 to-slate-950/60 p-4 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
        <GarageHeroScene paintColorId={paintColorId} />
      </div>

      {/* ROBOT STATUS & MISSION PROGRESS */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Robot Status Panel */}
        <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-slate-900/90 to-slate-950/70 p-4 shadow-[0_0_32px_rgba(34,211,238,0.1)]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-300">Robot Status</h3>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Name</span>
              <span className="font-bold text-cyan-100">{robotName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Level</span>
              <span className="font-bold text-amber-300">{level}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Scrap</span>
              <span className="font-bold text-amber-200">{scrap}</span>
            </div>
          </div>

          {/* Stat Bars */}
          <div className="mt-4 space-y-2">
            <StatBar label="Power" value={stats.power} max={30} color="from-amber-400 to-orange-500" />
            <StatBar label="Armor" value={stats.armor} max={25} color="from-blue-400 to-cyan-500" />
            <StatBar label="Speed" value={stats.speed} max={25} color="from-emerald-400 to-green-500" />
            <StatBar label="Energy" value={stats.energy} max={80} color="from-violet-400 to-fuchsia-500" />
            <StatBar label="HP" value={stats.hp} max={300} color="from-rose-400 to-red-500" />
          </div>
        </div>

        {/* Mission Progress */}
        <div className="rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-slate-900/90 to-slate-950/70 p-4 shadow-[0_0_32px_rgba(168,85,247,0.1)]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-fuchsia-300">Campaign</h3>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Progress</span>
              <span className="text-sm font-bold text-fuchsia-200">{completed.length}/{QUESTS.length}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400 transition-all"
                style={{ width: `${missionPct}%` }}
              />
            </div>
          </div>

          {/* Quick Mission Cards */}
          <div className="mt-4 space-y-2">
            {upcomingMissions.slice(0, 2).map((mission) => (
              <div
                key={mission.id}
                className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{mission.name}</span>
                  <span className="text-amber-300">+{mission.rewardScrap}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PvP Preview */}
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-slate-900/90 to-rose-950/20 p-4 shadow-[0_0_32px_rgba(244,63,94,0.1)]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-rose-300">Arena</h3>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="text-center">
              <div className="mx-auto w-12">
                <RobotFigure colorId={paintColorId} size="sm" />
              </div>
              <p className="mt-1 text-[9px] font-bold text-cyan-100">You</p>
            </div>
            <div className="text-sm font-bold text-white/70">VS</div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-rose-500/40 bg-slate-800 text-lg">
                ⚔️
              </div>
              <p className="mt-1 text-[9px] font-bold text-rose-200">Rival</p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs font-bold text-violet-200">
            {rankFromTrophies(trophies)} · {trophies} 🏆
          </p>
          <Link
            to={ROUTES.arena}
            className="mt-3 block w-full rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 py-2 text-center text-xs font-bold text-white shadow-[0_0_16px_rgba(244,63,94,0.3)] hover:from-rose-400 hover:to-orange-400"
          >
            ENTER ARENA
          </Link>
        </div>
      </div>

      {/* UPGRADE PARTS CARDS */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/90 to-slate-950/70 p-4 shadow-[0_0_32px_rgba(34,197,94,0.1)]">
        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-300">Upgrade Parts</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(['head', 'arms', 'body', 'legs', 'weapon', 'core'] as UpgradeId[]).map((partId) => {
            const lv = upgradeLevels[partId] ?? 1
            const cost = nextUpgradeCost(partId, lv)
            const maxed = lv >= 5
            const isFocus = partId === focusPart

            return (
              <button
                key={partId}
                onClick={() => setFocusPart(partId)}
                className={`rounded-xl border-2 p-3 text-center transition ${
                  isFocus
                    ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_16px_rgba(34,211,238,0.3)]'
                    : 'border-slate-700/60 bg-slate-800/40 hover:border-cyan-500/50'
                }`}
              >
                <div className="text-2xl mb-1">
                  {partId === 'head' && '🧠'}
                  {partId === 'arms' && '💪'}
                  {partId === 'body' && '🛡️'}
                  {partId === 'legs' && '🦵'}
                  {partId === 'weapon' && '⚡'}
                  {partId === 'core' && '⚙️'}
                </div>
                <div className="text-[10px] font-bold uppercase text-slate-300">
                  {UPGRADE_META[partId].short}
                </div>
                <div className="mt-1 text-xs font-bold text-cyan-300">Lv {lv}</div>
                {!maxed && cost != null && (
                  <div className="mt-1 text-[9px] text-amber-200">{cost} scrap</div>
                )}
              </button>
            )
          })}
        </div>

        {/* Upgrade Action for Focused Part */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={!canBuyFocus}
            onClick={() => tryBuyUpgrade(focusPart)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              canBuyFocus
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-[0_0_16px_rgba(34,197,94,0.3)] hover:from-emerald-400 hover:to-green-400'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {focusMaxed ? 'MAX LEVEL' : focusCost != null ? `UPGRADE · ${focusCost}` : '—'}
          </button>
          <Link
            to={ROUTES.upgrade}
            className="flex-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 py-2 text-center text-xs font-bold text-cyan-100 hover:bg-cyan-500/20"
          >
            WORKSHOP
          </Link>
        </div>
      </div>

      {/* COLORS PANEL */}
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-900/90 to-slate-950/70 p-4 shadow-[0_0_32px_rgba(168,85,247,0.1)]">
        <h3 className="text-xs font-bold uppercase tracking-widest text-violet-300">Paint Colors</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {COLORS.map((color) => {
            const isUnlocked = unlockedColors.includes(color.id)
            const isSelected = paintColorId === color.id

            return (
              <button
                key={color.id}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    equipColor(color.id)
                  } else if (color.scrapCost) {
                    tryUnlockColorWithScrap(color.id)
                  }
                }}
                className={`relative h-12 w-12 rounded-full border-2 transition ${
                  isSelected
                    ? 'border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                    : 'border-slate-600'
                } ${isUnlocked ? 'cursor-pointer hover:border-cyan-400' : 'cursor-not-allowed opacity-50'}`}
                style={{
                  backgroundColor: color.hex,
                }}
                title={color.name}
              >
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center text-lg">🔒</div>
                )}
                {isSelected && (
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-300 animate-pulse" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <ActionButton to={ROUTES.garage} icon="🏗️" label="Build" />
        <ActionButton to={ROUTES.missions} icon="📋" label="Missions" />
        <ActionButton to={ROUTES.upgrade} icon="⚙️" label="Upgrade" />
        <ActionButton to={ROUTES.colors} icon="🎨" label="Customize" />
        <ActionButton to={ROUTES.arena} icon="⚔️" label="Battle" />
      </div>
    </div>
  )
}

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-[10px] text-slate-400">{label}</span>
        <span className="text-[10px] font-bold text-slate-300">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ActionButton({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-3 text-center transition hover:border-cyan-500/40 hover:from-slate-700/80 hover:to-slate-800/80"
    >
      <div className="text-2xl mb-1 group-hover:scale-110 transition">{icon}</div>
      <div className="text-xs font-bold uppercase text-slate-300 group-hover:text-cyan-200">
        {label}
      </div>
    </Link>
  )
}
