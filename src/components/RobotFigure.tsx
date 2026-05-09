import { getColorById } from '../data/colors'

interface RobotFigureProps {
  colorId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: 160, md: 220, lg: 280 }

export function RobotFigure({ colorId, className = '', size = 'md' }: RobotFigureProps) {
  const c = getColorById(colorId)
  const glow = c?.hex ?? '#22d3ee'
  const w = sizeMap[size]

  return (
    <div
      className={`robot-float robot-glow-anim relative mx-auto ${className}`}
      style={{ width: w, height: w * 1.15, ['--robot-glow' as string]: glow }}
    >
      <svg
        viewBox="0 0 200 240"
        className="h-full w-full drop-shadow-[0_0_12px_rgba(0,0,0,0.6)]"
        aria-hidden
      >
        <defs>
          <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="visor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={glow} stopOpacity="0.95" />
            <stop offset="100%" stopColor={glow} stopOpacity="0.35" />
          </linearGradient>
        </defs>
        {/* Legs */}
        <rect x="72" y="170" width="14" height="48" rx="3" fill="url(#metal)" stroke={glow} strokeWidth="1.2" />
        <rect x="114" y="170" width="14" height="48" rx="3" fill="url(#metal)" stroke={glow} strokeWidth="1.2" />
        {/* Body */}
        <rect x="58" y="95" width="84" height="82" rx="10" fill="url(#metal)" stroke={glow} strokeWidth="2" />
        <rect x="68" y="108" width="64" height="22" rx="4" fill="url(#visor)" opacity="0.9" />
        <circle cx="88" cy="119" r="3" fill="#0f172a" />
        <circle cx="112" cy="119" r="3" fill="#0f172a" />
        {/* Chest core */}
        <circle cx="100" cy="148" r="10" fill="none" stroke={glow} strokeWidth="2" opacity="0.85" />
        <circle cx="100" cy="148" r="4" fill={glow} opacity="0.7" />
        {/* Shoulders */}
        <rect x="40" y="100" width="22" height="36" rx="6" fill="url(#metal)" stroke={glow} strokeWidth="1.5" />
        <rect x="138" y="100" width="22" height="36" rx="6" fill="url(#metal)" stroke={glow} strokeWidth="1.5" />
        {/* Arms */}
        <rect x="28" y="118" width="14" height="52" rx="4" fill="url(#metal)" stroke={glow} strokeWidth="1.2" />
        <rect x="158" y="118" width="14" height="52" rx="4" fill="url(#metal)" stroke={glow} strokeWidth="1.2" />
        {/* Head */}
        <rect x="70" y="38" width="60" height="52" rx="14" fill="url(#metal)" stroke={glow} strokeWidth="2" />
        <rect x="78" y="50" width="44" height="18" rx="5" fill="url(#visor)" />
        {/* Antenna */}
        <line x1="100" y1="38" x2="100" y2="18" stroke={glow} strokeWidth="2" strokeLinecap="round" />
        <circle cx="100" cy="16" r="4" fill={glow} opacity="0.9" />
      </svg>
    </div>
  )
}
