/** Simple back-view inventor with orange hoodie — original silhouette, SVG. */
export function InventorFigure({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 200"
      aria-hidden
    >
      <ellipse cx="60" cy="188" rx="28" ry="6" fill="black" opacity="0.35" />
      {/* legs */}
      <path
        d="M48 130 L44 175 L52 178 L56 132 Z M72 130 L76 175 L68 178 L64 132 Z"
        fill="#1e293b"
      />
      {/* hoodie body */}
      <path
        d="M38 78 Q36 120 42 135 L78 135 Q84 120 82 78 Q60 65 38 78 Z"
        fill="#ea580c"
      />
      <path
        d="M42 82 Q60 95 78 82 L76 118 Q60 128 44 118 Z"
        fill="#c2410c"
        opacity="0.5"
      />
      {/* hood / head */}
      <circle cx="60" cy="58" r="22" fill="#1c1917" />
      <path
        d="M42 52 Q60 38 78 52 Q76 68 60 72 Q44 68 42 52 Z"
        fill="#ea580c"
      />
      {/* arms */}
      <path
        d="M38 88 L22 118 L28 124 L44 98 Z M82 88 L98 118 L92 124 L76 98 Z"
        fill="#c2410c"
      />
    </svg>
  )
}
