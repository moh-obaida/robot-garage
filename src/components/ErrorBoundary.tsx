import { Component, type ErrorInfo, type ReactNode } from 'react'
import { STORAGE_V1, STORAGE_V2 } from '../utils/saveMigration'

const SAVE_KEYS = [STORAGE_V1, STORAGE_V2]

function clearAllRobotGarageSaves() {
  for (const k of SAVE_KEYS) {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  }
}

export class ErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { err: error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Robot Garage error boundary:', error, info)
  }

  render() {
    if (this.state.err) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#060a14] p-6 text-slate-100">
          <div className="max-w-lg rounded-2xl border-2 border-cyan-500/40 bg-slate-950/90 p-8 shadow-[0_0_60px_rgba(34,211,238,0.2)]">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-white">
              Something broke in the garage.
            </h1>
            <p className="mt-4 text-slate-300">
              The game hit an unexpected error. Reload the game or reset your local save.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.4)] transition hover:bg-amber-300"
              >
                Reload Game
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllRobotGarageSaves()
                  window.location.reload()
                }}
                className="rounded-xl border border-cyan-500/50 bg-slate-900 px-5 py-3 font-semibold text-cyan-100 transition hover:bg-slate-800"
              >
                Reset Local Save
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
