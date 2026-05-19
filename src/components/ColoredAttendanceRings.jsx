import { attendanceRateTier } from '../lib/attendanceColor.js'
import styles from './GrowthCharts.module.css'

const tierOpacity = { high: 1, mid: 0.78, low: 0.52 }

function Ring({ label, percent, sublabel }) {
  const clamped = Math.min(100, Math.max(0, Math.round(Number(percent) || 0)))
  const tier = attendanceRateTier(clamped)
  const opacity = tierOpacity[tier] ?? 1
  const r = 40
  const c = 2 * Math.PI * r
  const offset = c - (clamped / 100) * c

  return (
    <div className={styles.ringItem}>
      <div className={styles.ringWrap} aria-hidden>
        <svg className={styles.ringSvg} viewBox="0 0 100 100" aria-hidden>
          <g transform="rotate(-90 50 50)">
            <circle className={styles.ringTrack} cx="50" cy="50" r={r} />
            <circle
              className={styles.ringProgress}
              cx="50"
              cy="50"
              r={r}
              strokeDasharray={c}
              strokeDashoffset={offset}
              style={{ strokeOpacity: opacity }}
            />
          </g>
        </svg>
        <div className={styles.ringCenter}>
          <span className={styles.ringPercent} style={{ opacity }}>
            {clamped}
          </span>
          <span className={styles.ringUnit} style={{ opacity }}>
            %
          </span>
        </div>
      </div>
      <div className={styles.ringLabel}>{label}</div>
      {sublabel ? <div className={styles.ringSub}>{sublabel}</div> : null}
    </div>
  )
}

export default function ColoredAttendanceRings({ monthRate, monthLabel, overallRate }) {
  return (
    <div className={styles.ringRow}>
      <Ring label="이번 달 출석률" percent={monthRate} sublabel={monthLabel} />
      <Ring label="전체 출석률" percent={overallRate} sublabel="누적 기준" />
    </div>
  )
}
