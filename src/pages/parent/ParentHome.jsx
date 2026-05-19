import { Link } from 'react-router-dom'
import { ParentLayout } from '../../components/RoleLayout.jsx'
import GrowthCharts from '../../components/GrowthCharts.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import {
  currentMonthKey,
  formatMonthLabel,
  monthlyAttendanceRate,
  overallAttendanceRate,
} from '../../lib/parentStats.js'
import { ddayFrom, formatIsoDate, formatTs } from '../../lib/nav.js'
import AttendanceRings from './AttendanceRings.jsx'
import p from './parent.module.css'

function startOfToday() {
  const n = new Date()
  n.setHours(0, 0, 0, 0)
  return n
}

export default function ParentHome() {
  const { studentId } = useAuth()
  const { students, mentors, events, parentMessages, notices } = useData()
  const child = students.find((s) => s.id === studentId)

  if (!child) {
    return (
      <ParentLayout title="홈">
        <p className={p.muted}>연결된 자녀 정보를 찾을 수 없습니다.</p>
      </ParentLayout>
    )
  }

  const monthKey = currentMonthKey()
  const monthRate = monthlyAttendanceRate(child, monthKey)
  const overallRate = overallAttendanceRate(child)

  const today = startOfToday()
  const upcomingExams = events
    .filter((e) => (e.type === '시험' || e.type === '평가') && new Date(`${e.date}T00:00:00`) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)

  const myMessages = parentMessages
    .filter((m) => m.studentId === child.id)
    .sort((a, b) => b.createdAt - a.createdAt)

  const latestNotice = notices[0]
  const latestMessage = myMessages[0]
  const portfolioPreview = child.portfolioPublicToParent ? child.portfolio.slice(0, 4) : []
  const mentorName = mentors.find((m) => m.id === child.mentorId)?.name ?? '담당 멘토'

  return (
    <ParentLayout title="홈" hideHeaderTitle>
      <div className={p.page}>
        <header className={p.hero}>
          <h1 className={p.heroName}>{child.name}</h1>
          <p className={p.heroMeta}>
            {child.course} · 담당 멘토 {mentorName}
          </p>
        </header>

        <section className={p.card}>
          <h2 className={p.cardTitle}>출결 현황</h2>
          <AttendanceRings
            monthRate={monthRate}
            monthLabel={formatMonthLabel(monthKey)}
            overallRate={overallRate}
          />
        </section>

        <section className={p.card}>
          <h2 className={p.cardTitle}>성장 그래프</h2>
          <GrowthCharts student={child} />
        </section>

        <section className={p.card}>
          <h2 className={p.cardTitle}>포트폴리오</h2>
          {!child.portfolioPublicToParent ? (
            <p className={p.hiddenNote}>자녀가 학부모 공개를 선택하지 않아 포트폴리오를 볼 수 없습니다.</p>
          ) : portfolioPreview.length === 0 ? (
            <p className={p.emptyState}>등록된 작품이 없습니다.</p>
          ) : (
            <div className={p.portfolioScroll}>
              {portfolioPreview.map((item) => (
                <div key={item.id} className={p.portfolioThumb}>
                  <img src={item.src} alt="" />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={p.card}>
          <h2 className={p.cardTitle}>다가오는 시험 · 평가</h2>
          {upcomingExams.length === 0 ? (
            <p className={p.emptyState}>예정된 시험·평가가 없습니다.</p>
          ) : (
            <div className={p.eventList}>
              {upcomingExams.map((ev) => (
                <div key={ev.id} className={p.eventItem}>
                  <div>
                    <p className={p.eventTitle}>{ev.title}</p>
                    <p className={p.muted}>
                      {formatIsoDate(ev.date)} · {ddayFrom(ev.date)}
                    </p>
                  </div>
                  <span className={p.eventType}>{ev.type}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <Link
          to={latestNotice ? `/parent/notices/${latestNotice.id}` : '/parent/notices'}
          className={`${p.card} ${p.linkCard}`}
        >
          <h2 className={p.cardTitle}>최근 공지</h2>
          {latestNotice ? (
            <>
              <p className={p.noticeTitle}>{latestNotice.title}</p>
              <p className={p.muted}>{formatTs(latestNotice.createdAt)}</p>
              <p className={p.cardFooter}>자세히 보기</p>
            </>
          ) : (
            <p className={p.emptyState}>등록된 공지가 없습니다.</p>
          )}
        </Link>

        <Link to="/parent/messages" className={`${p.card} ${p.linkCard}`}>
          <h2 className={p.cardTitle}>멘토 메시지</h2>
          {latestMessage ? (
            <>
              <p className={p.noticeTitle}>{latestMessage.title}</p>
              <p className={p.messagePreview}>{latestMessage.body}</p>
              <p className={p.muted}>{formatTs(latestMessage.createdAt)}</p>
              <p className={p.cardFooter}>전체 메시지 보기</p>
            </>
          ) : (
            <p className={p.emptyState}>받은 메시지가 없습니다.</p>
          )}
        </Link>
      </div>
    </ParentLayout>
  )
}
