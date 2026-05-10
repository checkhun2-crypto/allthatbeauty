import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { StudentLayout } from '../../components/RoleLayout.jsx'
import PracticeTimer from '../../components/PracticeTimer.jsx'
import ui from '../../components/ui.module.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { formatIsoDate } from '../../lib/nav.js'
import { todayIso } from '../../lib/studentWork.js'

function fmtDur(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}시간 ${m}분`
  if (m > 0) return `${m}분`
  return `${sec}초`
}

export default function StudentPractice() {
  const { studentId } = useAuth()
  const { students, addPracticeSeconds } = useData()
  const me = students.find((s) => s.id === studentId)
  const rows = useMemo(() => {
    if (!me) return []
    const o = me.practiceSecondsByDate ?? {}
    return Object.keys(o)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({ date, sec: o[date] || 0 }))
  }, [me])

  if (!me) {
    return (
      <StudentLayout title="연습">
        <p>오류</p>
      </StudentLayout>
    )
  }

  const total = rows.reduce((a, r) => a + r.sec, 0)
  const today = me.practiceSecondsByDate?.[todayIso()] ?? 0

  return (
    <StudentLayout title="연습 타이머">
      <p className={ui.muted} style={{ marginTop: 0 }}>
        정지·기록 시 오늘 연습 시간에 합산됩니다.
      </p>
      <section className={ui.card}>
        <PracticeTimer studentId={me.id} addPracticeSeconds={addPracticeSeconds} />
      </section>
      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          요약
        </div>
        <div>오늘: {fmtDur(today)}</div>
        <div>누적: {fmtDur(total)}</div>
      </section>
      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          날짜별 연습 시간
        </div>
        {rows.length === 0 ? (
          <p className={ui.muted}>기록이 없습니다.</p>
        ) : (
          rows.map((r) => (
            <div key={r.date} className={ui.row} style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{formatIsoDate(r.date)}</span>
              <strong>{fmtDur(r.sec)}</strong>
            </div>
          ))
        )}
      </section>
      <Link to="/student/home" className={`${ui.btnGhost} ${ui.btnSm}`} style={{ display: 'inline-block', marginTop: 8 }}>
        홈으로
      </Link>
    </StudentLayout>
  )
}
