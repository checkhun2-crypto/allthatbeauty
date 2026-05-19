import p from './parent.module.css'

function Ring({ label, percent, sublabel }) {
  const clamped = Math.min(100, Math.max(0, percent))
  const r = 42
  const c = 2 * Math.PI * r
  const offset = c - (clamped / 100) * c

  return (
    <div className={p.ringItem}>
      <div className={p.ringWrap} aria-hidden>
        <svg className={p.ringSvg} viewBox="0 0 100 100">
          <circle className={p.ringTrack} cx="50" cy="50" r={r} />
          <circle
            className={p.ringProgress}
            cx="50"
            cy="50"
            r={r}
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className={p.ringCenter}>
          <span className={p.ringPercent}>{clamped}</span>
          <span className={p.ringUnit}>%</span>
        </div>
      </div>
      <div className={p.ringLabel}>{label}</div>
      {sublabel ? <div className={p.ringSub}>{sublabel}</div> : null}
    </div>
  )
}

export default function AttendanceRings({ monthRate, monthLabel, overallRate }) {
  return (
    <div className={p.ringRow}>
      <Ring label="이번 달 출석률" percent={monthRate} sublabel={monthLabel} />
      <Ring label="전체 출석률" percent={overallRate} sublabel="누적 기준" />
    </div>
  )
}
