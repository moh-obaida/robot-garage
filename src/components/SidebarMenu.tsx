import { NavLink } from 'react-router-dom'
import { ROUTES } from '../types/game'

const ITEMS: { to: string; label: string; icon: string; accent?: boolean }[] = [
  { to: ROUTES.play, label: 'DASHBOARD', icon: '📊', accent: true },
  { to: ROUTES.garage, label: 'GARAGE', icon: '🏗️' },
  { to: ROUTES.missions, label: 'MISSIONS', icon: '📋' },
  { to: ROUTES.arena, label: 'PVP ARENA', icon: '⚔️' },
  { to: ROUTES.upgrade, label: 'UPGRADES', icon: '⚙️' },
  { to: ROUTES.colors, label: 'CUSTOMIZE', icon: '🎨' },
  { to: ROUTES.shop, label: 'SHOP', icon: '🛒' },
  { to: ROUTES.arcade, label: 'ARCADE', icon: '🕹️' },
  { to: ROUTES.vehicles, label: 'VEHICLES', icon: '🏎️' },
]

export function SidebarMenu() {
  return (
    <nav className="flex flex-col gap-2" aria-label="Main Navigation">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === ROUTES.play}
          className={({ isActive }) =>
            [
              'group flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold tracking-widest transition-all duration-200',
              isActive
                ? 'bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.15)] border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent hover:border-slate-700/50',
            ].join(' ')
          }
        >
          <span className="text-lg transition-transform group-hover:scale-110">{item.icon}</span>
          <span>{item.label}</span>
          {item.accent && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          )}
        </NavLink>
      ))}
    </nav>
  )
}
