import { MentorLayout } from '../../components/RoleLayout.jsx'
import ui from '../../components/ui.module.css'
import { useData } from '../../context/DataContext.jsx'
import { attendanceRatePercent, growthLastMonth, rankBy, totalPracticeSeconds } from '../../lib/rankings.js'

function fmtDur(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}시간 ${m}분`
  if (m > 0) return `${m}분`
  return `${sec}초`
}

export default function MentorRanking() {
  const { students } = useData()
  const att = rankBy(students, attendanceRatePercent, true)
  const gr = rankBy(students, growthLastMonth, true)
  const pr = rankBy(students, totalPracticeSeconds, true)

  return (
    <MentorLayout title="뱃지 · 랭킹">
      <p className={ui.muted} style={{ marginTop: 0 }}>
        출석왕·이달의 성장왕·연습왕 기준 전체 순위입니다.
      </p>
      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          출석왕 (출석률)
        </div>
        {att.map((r) => (
          <div key={r.id} className={ui.row} style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span>
              {r.rank}. {r.name}
            </span>
            <strong>{r.value}%</strong>
          </div>
        ))}
      </section>
      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          이달의 성장왕 (최근 월 점수 증가)
        </div>
        {gr.map((r) => (
          <div key={r.id} className={ui.row} style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span>
              {r.rank}. {r.name}
            </span>
            <strong>{r.value >= 0 ? '+' : ''}{r.value}점</strong>
          </div>
        ))}
      </section>
      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          연습왕 (누적 연습 시간)
        </div>
        {pr.map((r) => (
          <div key={r.id} className={ui.row} style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span>
              {r.rank}. {r.name}
            </span>
            <strong>{fmtDur(r.value)}</strong>
          </div>
        ))}
      </section>
    </MentorLayout>
  )
}
