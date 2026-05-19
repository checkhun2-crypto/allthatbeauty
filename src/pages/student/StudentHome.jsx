import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { StudentLayout } from '../../components/RoleLayout.jsx'
import StudentGrowthSection from './StudentGrowthSection.jsx'
import ui from '../../components/ui.module.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { getTodaySlots, todayLabel } from '../../data/seed.js'
import { fmtDur } from '../../lib/formatDuration.js'
import {
  attendanceRatePercent,
  badgesForStudent,
  growthLastMonth,
  rankBy,
  totalPracticeSeconds,
} from '../../lib/rankings.js'
import { ddayFrom, formatIsoDate, formatTs } from '../../lib/nav.js'
import { featuredNotice, myRankRow, upcomingExamEvents } from '../../lib/studentHome.js'
import h from './studentHome.module.css'

function RankingSummary({ students, studentId }) {
  const att = rankBy(students, attendanceRatePercent, true)
  const pr = rankBy(students, totalPracticeSeconds, true)
  const gr = rankBy(students, growthLastMonth, true)
  const myAtt = myRankRow(students, studentId, attendanceRatePercent, true)
  const myPr = myRankRow(students, studentId, totalPracticeSeconds, true)
  const myGr = myRankRow(students, studentId, growthLastMonth, true)

  const blocks = [
    { key: 'att', title: '출석왕', rows: att, mine: myAtt, fmt: (v) => `${v}%` },
    { key: 'pr', title: '연습왕', rows: pr, mine: myPr, fmt: (v) => fmtDur(v) },
    { key: 'gr', title: '성장왕', rows: gr, mine: myGr, fmt: (v) => `${v >= 0 ? '+' : ''}${v}점` },
  ]

  return (
    <div className={h.rankingBlocks}>
      {blocks.map(({ key, title, rows, mine, fmt }) => (
        <div key={key}>
          <p className={ui.muted} style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: 700 }}>
            {title}
          </p>
          {rows.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className={`${h.rankRow} ${r.id === studentId ? h.rankMe : ''}`}
            >
              <span>
                {r.rank}위 {r.name}
                {r.id === studentId ? ' (나)' : ''}
              </span>
              <strong>{fmt(r.value)}</strong>
            </div>
          ))}
          {mine && mine.rank > 3 ? (
            <p className={ui.muted} style={{ margin: '6px 0 0', fontSize: '0.75rem' }}>
              내 순위: {mine.rank}위 · {fmt(mine.value)}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default function StudentHome() {
  const { studentId } = useAuth()
  const { students, notices, events } = useData()
  const me = students.find((s) => s.id === studentId)

  const badges = useMemo(
    () => (me && studentId ? badgesForStudent(studentId, students) : []),
    [me, studentId, students],
  )
  const notice = useMemo(() => featuredNotice(notices), [notices])
  const exams = useMemo(() => upcomingExamEvents(events, 1), [events])
  const nextExam = exams[0]

  if (!me) {
    return (
      <StudentLayout title="홈">
        <p>프로필을 찾을 수 없습니다.</p>
      </StudentLayout>
    )
  }

  const slots = getTodaySlots(me.timetable)

  return (
    <StudentLayout title="홈">
      <header className={h.hero}>
        <h1 className={h.heroTitle}>안녕하세요, {me.name}님</h1>
        <p className={h.heroDate}>{todayLabel()}</p>
      </header>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 12 }}>
          성장 그래프
        </div>
        <StudentGrowthSection student={me} />
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          중요 공지
        </div>
        {notice ? (
          <>
            {notice.important ? (
              <span className={ui.chip} style={{ marginBottom: 8, fontWeight: 700 }}>
                중요
              </span>
            ) : null}
            <p className={h.noticePreview}>{notice.title}</p>
            <p className={ui.muted} style={{ margin: '0 0 10px' }}>
              {formatTs(notice.createdAt)}
            </p>
            <Link to={`/student/notices/${notice.id}`} className={`${ui.btnGhost} ${ui.btnSm}`}>
              자세히 보기
            </Link>
            <Link
              to="/student/notices"
              className={`${ui.btnGhost} ${ui.btnSm}`}
              style={{ marginLeft: 8 }}
            >
              더보기
            </Link>
          </>
        ) : (
          <>
            <p className={ui.muted}>등록된 공지가 없습니다.</p>
            <Link to="/student/notices" className={`${ui.btnGhost} ${ui.btnSm}`} style={{ marginTop: 8, display: 'inline-block' }}>
              공지 탭으로 이동
            </Link>
          </>
        )}
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          내 뱃지
        </div>
        {badges.length === 0 ? (
          <p className={ui.muted}>아직 획득한 뱃지가 없습니다.</p>
        ) : (
          <div className={h.badgeGrid}>
            {badges.map((b) => (
              <div key={b.key} className={h.badgeIcon} title={b.label}>
                <span className={h.badgeEmoji} aria-hidden>
                  {b.emoji}
                </span>
                <span className={h.badgeName}>{b.label}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          랭킹
        </div>
        <RankingSummary students={students} studentId={me.id} />
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          오늘 수업
        </div>
        {slots.length === 0 ? (
          <p className={ui.muted} style={{ margin: 0 }}>
            오늘은 정기 수업이 없습니다.
          </p>
        ) : (
          slots.map((sl) => (
            <div key={sl.time} className={h.slotRow}>
              <strong>{sl.time}</strong> · {sl.subject}
            </div>
          ))
        )}
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          다가오는 시험
        </div>
        {!nextExam ? (
          <p className={ui.muted} style={{ margin: 0 }}>
            예정된 시험·평가가 없습니다.
          </p>
        ) : (
          <div className={h.ddayCard}>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 700 }}>{nextExam.title}</p>
              <p className={ui.muted} style={{ margin: 0 }}>
                {formatIsoDate(nextExam.date)} · {nextExam.type}
              </p>
            </div>
            <span className={h.ddayBadge}>{ddayFrom(nextExam.date)}</span>
          </div>
        )}
      </section>
    </StudentLayout>
  )
}
