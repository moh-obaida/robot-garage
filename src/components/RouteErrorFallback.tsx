import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { STORAGE_V1, STORAGE_V2 } from '../utils/saveMigration'

function clearSaves() {
  for (const k of [STORAGE_V1, STORAGE_V2]) {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  }
}

/** React Router route error boundary — avoids a blank screen on thrown render errors. */
export function RouteErrorFallback() {
  const err = useRouteError()
  const navigate = useNavigate()

  let detail = 'An unexpected error occurred in this view.'
  if (isRouteErrorResponse(err)) {
    detail = `${err.status} ${err.statusText || ''}`.trim()
  } else if (err instanceof Error) {
    detail = err.message
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center text-slate-100">
      <div className="max-w-md rounded-2xl border border-rose-500/40 bg-slate-950/90 p-6 shadow-[0_0_40px_rgba(244,63,94,0.15)]">
        <h1 className="font-[family-name:var(--font-display)] text-lg font-bold text-rose-100">
          Unexpected garage error
        </h1>
        <p className="mt-3 text-sm text-slate-400">{detail}</p>
        <p className="mt-2 text-xs text-slate-500">
          If this keeps happening, try resetting local progress (this device only).
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
          >
            Back to dashboard
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => {
              clearSaves()
              window.location.reload()
            }}
            className="rounded-xl border border-amber-500/50 px-4 py-2 text-xs font-semibold text-amber-100 hover:bg-amber-500/10"
          >
            Reset save &amp; reload
          </button>
        </div>
      </div>
    </div>
  )
}
