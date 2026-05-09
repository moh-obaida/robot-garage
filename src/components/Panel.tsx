import type { ReactNode } from 'react'

export function Panel({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`game-panel ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-fuchsia-500/5" />
      <header className="game-panel-header relative">
        <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-cyan-300">
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{subtitle}</p> : null}
      </header>
      <div className="relative p-5">{children}</div>
    </section>
  )
}
