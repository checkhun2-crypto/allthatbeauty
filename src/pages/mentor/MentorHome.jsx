import { Link } from 'react-router-dom'
import { MentorLayout } from '../../components/RoleLayout.jsx'
import ui from '../../components/ui.module.css'
import { getTodaySlots, todayLabel } from '../../data/seed.js'
import { useMentorScope } from '../../hooks/useMentorScope.js'
import { attendanceRatePercent, growthLastMonth, rankBy, totalPracticeSeconds } from '../../lib/rankings.js'

function fmtDur(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}시간 ${m}분`
  if (m > 0) return `${m}분`
  return `${sec}초`
}

export default function MentorHome() {
  const { currentMentor, myStudents } = useMentorScope()
  const total = myStudents.reduce(
    (acc, s) => {
      const { present, late, absent } = s.attendance
      acc.present += present
      acc.late += late
      acc.absent += absent
      return acc
    },
    { present: 0, late: 0, absent: 0 },
  )
  const denom = total.present + total.late + total.absent
  const rate = denom ? Math.round((total.present / denom) * 1000) / 10 : 0

  const att = rankBy(myStudents, attendanceRatePercent, true)
  const gr = rankBy(myStudents, growthLastMonth, true)
  const pr = rankBy(myStudents, totalPracticeSeconds, true)

  return (
    <MentorLayout title={`안녕하세요, ${currentMentor?.name ?? '멘토'} 멘토`}>
      <p className={ui.muted} style={{ marginTop: 0 }}>
        {todayLabel()}
      </p>
      <section className={ui.card}>
        <div className={ui.row} style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <span className={ui.badge}>오늘 타임테이블</span>
        </div>
        {myStudents.map((s) => {
          const slots = getTodaySlots(s.timetable)
          return (
            <div key={s.id} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.name}</div>
              {slots.length === 0 ? (
                <span className={ui.muted}>오늘은 정기 수업이 없습니다.</span>
              ) : (
                slots.map((sl) => (
                  <div key={sl.time} className={ui.chip} style={{ marginRight: 6, marginBottom: 4 }}>
                    {sl.time} · {sl.subject}
                  </div>
                ))
              )}
            </div>
          )
        })}
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 10 }}>
          출석 통계
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>{rate}%</div>
        <p className={ui.muted} style={{ margin: '6px 0 0' }}>
          전체 누적 기준 · 출석 {total.present} / 지각 {total.late} / 결석 {total.absent}
        </p>
        <Link to="/mentor/students" className={ui.btn} style={{ marginTop: 12, textAlign: 'center', width: '100%' }}>
          수강생 관리로 이동
        </Link>
      </section>

      <section className={ui.card}>
        <div className={ui.row} style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span className={ui.badge}>뱃지 · 랭킹 요약</span>
          <Link to="/mentor/ranking" className={`${ui.btnGhost} ${ui.btnSm}`}>
            전체 랭킹
          </Link>
        </div>
        <div className={ui.muted} style={{ fontSize: '0.8rem', marginBottom: 6 }}>
          출석왕
        </div>
        {att.slice(0, 3).map((r) => (
          <div key={r.id} className={ui.row} style={{ justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span>
              {r.rank}. {r.name}
            </span>
            <span>{r.value}%</span>
          </div>
        ))}
        <div className={ui.muted} style={{ fontSize: '0.8rem', margin: '10px 0 6px' }}>
          이달의 성장왕 (점수 증가)
        </div>
        {gr.slice(0, 3).map((r) => (
          <div key={r.id} className={ui.row} style={{ justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span>
              {r.rank}. {r.name}
            </span>
            <span>
              {r.value >= 0 ? '+' : ''}
              {r.value}점
            </span>
          </div>
        ))}
        <div className={ui.muted} style={{ fontSize: '0.8rem', margin: '10px 0 6px' }}>
          연습왕 (누적 연습)
        </div>
        {pr.slice(0, 3).map((r) => (
          <div key={r.id} className={ui.row} style={{ justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span>
              {r.rank}. {r.name}
            </span>
            <span>{fmtDur(r.value)}</span>
          </div>
        ))}
      </section>
    </MentorLayout>
  )
}
