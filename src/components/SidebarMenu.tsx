import { NavLink } from 'react-router-dom'
import { ROUTES } from '../types/game'

const ITEMS: { to: string; label: string; accent?: boolean }[] = [
  { to: ROUTES.play, label: 'PLAY', accent: true },
  { to: ROUTES.garage, label: 'GARAGE' },
  { to: ROUTES.missions, label: 'MISSIONS' },
  { to: ROUTES.world, label: 'WORLD' },
  { to: ROUTES.vehicles, label: 'VEHICLES' },
  { to: ROUTES.arcade, label: 'ARCADE' },
  { to: ROUTES.arena, label: 'PVP ARENA' },
  { to: ROUTES.upgrade, label: 'UPGRADE' },
  { to: ROUTES.colors, label: 'COLORS' },
  { to: ROUTES.shop, label: 'SHOP' },
]

export function SidebarMenu() {
  return (
    <nav className="flex flex-col gap-1.5" aria-label="Main">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === ROUTES.play}
          className={({ isActive }) =>
            [
              'rounded-xl px-3 py-2.5 text-left text-xs font-bold tracking-wide transition',
              item.accent && !isActive
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.35)] hover:bg-amber-300'
                : '',
              item.accent && isActive
                ? 'bg-amber-300 text-slate-950 shadow-[0_0_24px_rgba(251,191,36,0.5)]'
                : '',
              !item.accent && isActive
                ? 'border border-cyan-500/60 bg-cyan-500/15 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.2)]'
                : '',
              !item.accent && !isActive
                ? 'border border-slate-700/80 bg-slate-900/60 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-100'
                : '',
            ].join(' ')
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
