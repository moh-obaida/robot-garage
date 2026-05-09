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
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-slate-900/55 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-md ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10" />
      <header className="relative border-b border-cyan-500/20 px-5 py-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold tracking-wide text-cyan-100">
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </header>
      <div className="relative p-5">{children}</div>
    </section>
  )
}
