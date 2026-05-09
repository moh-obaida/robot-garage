export function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-8 text-center">
      <p className="font-[family-name:var(--font-display)] text-sm font-bold tracking-wide text-cyan-200">
        Loading bay…
      </p>
      <p className="text-xs text-slate-500">Splitting routes for a lighter first paint.</p>
    </div>
  )
}
