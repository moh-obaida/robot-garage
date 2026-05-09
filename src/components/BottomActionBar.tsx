import { Link } from 'react-router-dom'
import { ROUTES } from '../types/game'

const ACTIONS = [
  { to: ROUTES.garage, label: 'Build your robot', icon: '🔧' },
  { to: ROUTES.missions, label: 'Complete missions', icon: '🚩' },
  { to: ROUTES.upgrade, label: 'Upgrade & customize', icon: '⬆' },
  { to: ROUTES.arena, label: 'Battle rivals', icon: '💀' },
  { to: ROUTES.vehicles, label: 'Garage vehicles', icon: '🏎' },
] as const

export function BottomActionBar() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {ACTIONS.map((a) => (
        <Link
          key={a.to}
          to={a.to}
          className="group rounded-2xl border border-slate-700/80 bg-slate-900/50 p-3 text-center transition hover:border-cyan-500/45 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
        >
          <span className="text-2xl">{a.icon}</span>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-200 group-hover:text-cyan-100">
            {a.label}
          </p>
        </Link>
      ))}
    </div>
  )
}
