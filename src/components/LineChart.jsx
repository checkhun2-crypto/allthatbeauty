import styles from './LineChart.module.css'

export default function LineChart({ title, points, valueLabel = '' }) {
  if (!points?.length) return null
  const vals = points.map((p) => p.value)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const pad = max === min ? 1 : max - min
  const w = 280
  const h = 120
  const left = 32
  const right = 8
  const top = 12
  const bottom = 28
  const innerW = w - left - right
  const innerH = h - top - bottom
  const path = points
    .map((p, i) => {
      const x = left + (innerW * (points.length === 1 ? 0.5 : i / (points.length - 1)))
      const y = top + innerH - ((p.value - min) / pad) * innerH
      return `${i === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')
  return (
    <div className={styles.wrap}>
      {title ? <div className={styles.title}>{title}</div> : null}
      <svg className={styles.svg} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${left + innerW},${top + innerH} L ${left},${top + innerH} Z`} fill="url(#lg)" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => {
          const x = left + (innerW * (points.length === 1 ? 0.5 : i / (points.length - 1)))
          const y = top + innerH - ((p.value - min) / pad) * innerH
          return <circle key={p.label} cx={x} cy={y} r="4" fill="var(--accent)" />
        })}
      </svg>
      <div className={styles.labels}>
        {points.map((p) => (
          <span key={p.label} className={styles.lab}>
            {p.label}
          </span>
        ))}
      </div>
      {valueLabel ? <div className={styles.sub}>{valueLabel}</div> : null}
    </div>
  )
}
