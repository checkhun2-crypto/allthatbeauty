import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StudentLayout } from '../../components/RoleLayout.jsx'
import GrowthCharts from '../../components/GrowthCharts.jsx'
import PracticeTimer from '../../components/PracticeTimer.jsx'
import ui from '../../components/ui.module.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { getTodaySlots, todayLabel } from '../../data/seed.js'
import { badgesForStudent } from '../../lib/rankings.js'
import { readImageDataUrl, todayIso } from '../../lib/studentWork.js'

const MAX_IMAGE = 900000

function fmtDur(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}시간 ${m}분`
  if (m > 0) return `${m}분`
  return `${sec}초`
}

export default function StudentHome() {
  const { studentId } = useAuth()
  const {
    students,
    addStudentPortfolioItem,
    removeStudentPortfolioItem,
    addStudentDailyResult,
    removeStudentDailyResult,
    addPracticeSeconds,
  } = useData()
  const me = students.find((s) => s.id === studentId)
  const [dailyNote, setDailyNote] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const badges = useMemo(() => (me && studentId ? badgesForStudent(studentId, students) : []), [me, studentId, students])
  const iso = todayIso()
  const practiceToday = me?.practiceSecondsByDate?.[iso] ?? 0
  const practiceTotal = useMemo(() => {
    if (!me?.practiceSecondsByDate) return 0
    return Object.values(me.practiceSecondsByDate).reduce((a, v) => a + (Number(v) || 0), 0)
  }, [me])

  if (!me) {
    return (
      <StudentLayout title="홈">
        <p>프로필을 찾을 수 없습니다.</p>
      </StudentLayout>
    )
  }

  const slots = getTodaySlots(me.timetable)
  const todayWork = me.dailyResults.filter((d) => d.date === iso)

  async function onPickPortfolio(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setErr('')
    setBusy(true)
    try {
      const src = await readImageDataUrl(file, MAX_IMAGE)
      addStudentPortfolioItem(me.id, src)
    } catch (er) {
      setErr(er.message ?? '업로드에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  async function onPickDaily(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setErr('')
    setBusy(true)
    try {
      const src = await readImageDataUrl(file, MAX_IMAGE)
      addStudentDailyResult(me.id, { src, note: dailyNote })
      setDailyNote('')
    } catch (er) {
      setErr(er.message ?? '업로드에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <StudentLayout title={`안녕하세요, ${me.name}님`}>
      <p className={ui.muted} style={{ marginTop: 0 }}>
        {todayLabel()}
      </p>
      {err ? (
        <p style={{ color: '#c62828', fontSize: '0.85rem', margin: '0 0 8px' }}>{err}</p>
      ) : null}

      {badges.length ? (
        <section className={ui.card}>
          <div className={ui.badge} style={{ marginBottom: 8 }}>
            나의 뱃지
          </div>
          <div className={ui.row} style={{ gap: 8, flexWrap: 'wrap' }}>
            {badges.map((b) => (
              <span key={b.key} className={ui.chip} style={{ fontWeight: 700 }}>
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          성장 그래프
        </div>
        <GrowthCharts monthlyScores={me.monthlyScores} monthlyAttendance={me.monthlyAttendance} />
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          연습 타이머
        </div>
        <PracticeTimer studentId={me.id} addPracticeSeconds={addPracticeSeconds} />
        <p className={ui.muted} style={{ marginBottom: 0, marginTop: 10 }}>
          오늘 {fmtDur(practiceToday)} · 누적 {fmtDur(practiceTotal)}
        </p>
        <Link to="/student/practice" className={`${ui.btnGhost} ${ui.btnSm}`} style={{ marginTop: 10, display: 'inline-block' }}>
          날짜별 연습 기록
        </Link>
      </section>

      <div className={ui.row} style={{ gap: 8, marginBottom: 10 }}>
        <Link to="/student/schedule" className={ui.btn} style={{ flex: 1, textAlign: 'center' }}>
          내 일정 보기
        </Link>
      </div>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          오늘 수업
        </div>
        {slots.length === 0 ? (
          <span className={ui.muted}>오늘은 정기 수업이 없습니다.</span>
        ) : (
          slots.map((sl) => (
            <div key={sl.time} style={{ marginBottom: 6 }}>
              <strong>{sl.time}</strong> · {sl.subject}
            </div>
          ))
        )}
        <Link to="/student/notices" className={`${ui.btnGhost} ${ui.btnSm}`} style={{ marginTop: 10, display: 'inline-block' }}>
          공지 더 보기
        </Link>
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          오늘의 결과물
        </div>
        <p className={ui.muted} style={{ marginTop: 0 }}>
          오늘 수업·실습 결과 사진을 올리면 멘토가 확인할 수 있어요. (이미지, 약 900KB 이하 권장)
        </p>
        <textarea
          className={ui.textarea}
          style={{ minHeight: 64 }}
          placeholder="한 줄 메모 (선택)"
          value={dailyNote}
          onChange={(e) => setDailyNote(e.target.value)}
        />
        <label className={ui.btn} style={{ marginTop: 8, width: '100%', textAlign: 'center', opacity: busy ? 0.6 : 1 }}>
          {busy ? '처리 중…' : '사진 올리기'}
          <input type="file" accept="image/*" hidden disabled={busy} onChange={onPickDaily} />
        </label>
        {todayWork.length === 0 ? (
          <p className={ui.muted} style={{ marginBottom: 0 }}>
            오늘 올린 결과물이 없습니다.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
            {todayWork.map((d) => (
              <figure key={d.id} style={{ margin: 0 }}>
                <img src={d.src} alt="" style={{ borderRadius: 12, width: '100%', height: 110, objectFit: 'cover' }} />
                {d.note ? (
                  <figcaption className={ui.muted} style={{ fontSize: '0.75rem', marginTop: 4 }}>
                    {d.note}
                  </figcaption>
                ) : null}
                <button
                  type="button"
                  className={`${ui.btnGhost} ${ui.btnSm}`}
                  style={{ marginTop: 6, width: '100%' }}
                  onClick={() => removeStudentDailyResult(me.id, d.id)}
                >
                  삭제
                </button>
              </figure>
            ))}
          </div>
        )}
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          포트폴리오
        </div>
        <p className={ui.muted} style={{ marginTop: 0 }}>
          대표 작품·연습 사진을 쌓아 두는 공간입니다. 멘토 화면의 포트폴리오 탭에도 같이 보여요.
        </p>
        <label className={`${ui.btnGhost} ${ui.btnSm}`} style={{ display: 'block', textAlign: 'center', opacity: busy ? 0.6 : 1 }}>
          {busy ? '처리 중…' : '포트폴리오 사진 추가'}
          <input type="file" accept="image/*" hidden disabled={busy} onChange={onPickPortfolio} />
        </label>
        {me.portfolio.length === 0 ? (
          <p className={ui.muted} style={{ marginBottom: 0 }}>
            아직 등록된 사진이 없습니다.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
            {me.portfolio.map((p) => (
              <figure key={p.id} style={{ margin: 0 }}>
                <img src={p.src} alt="" style={{ borderRadius: 12, width: '100%', height: 120, objectFit: 'cover' }} />
                <button
                  type="button"
                  className={`${ui.btnGhost} ${ui.btnSm}`}
                  style={{ marginTop: 6, width: '100%' }}
                  onClick={() => removeStudentPortfolioItem(me.id, p.id)}
                >
                  삭제
                </button>
              </figure>
            ))}
          </div>
        )}
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          멘토 피드백
        </div>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{me.feedback || '아직 피드백이 없습니다.'}</p>
      </section>
    </StudentLayout>
  )
}
