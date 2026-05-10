import { useMemo } from 'react'
import { StudentLayout } from '../../components/RoleLayout.jsx'
import ui from '../../components/ui.module.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { formatIsoDate } from '../../lib/nav.js'

const DAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토']

function pad(n) {
  return String(n).padStart(2, '0')
}

function toIso(y, m0, day) {
  return `${y}-${pad(m0 + 1)}-${pad(day)}`
}

function parseIso(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function startOfToday() {
  const n = new Date()
  n.setHours(0, 0, 0, 0)
  return n
}

function diffDays(fromDate, toDate) {
  const a = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
  const b = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate())
  return Math.round((b - a) / 86400000)
}

function hasClassOnWeekday(timetable, weekdayKo) {
  if (!timetable?.length) return false
  return timetable.some((row) => row.day === weekdayKo && row.slots?.length > 0)
}

export default function StudentSchedule() {
  const { studentId } = useAuth()
  const { students, events } = useData()
  const me = students.find((s) => s.id === studentId)

  const today = startOfToday()
  const y = today.getFullYear()
  const m0 = today.getMonth()
  const monthLabel = `${y}년 ${m0 + 1}월`

  const calendarCells = useMemo(() => {
    const first = new Date(y, m0, 1)
    const lastDay = new Date(y, m0 + 1, 0).getDate()
    const startPad = first.getDay()
    const cells = []
    for (let i = 0; i < startPad; i += 1) cells.push({ type: 'pad' })
    for (let d = 1; d <= lastDay; d += 1) {
      const dateObj = new Date(y, m0, d)
      const iso = toIso(y, m0, d)
      const weekdayKo = DAY_HEADERS[dateObj.getDay()]
      const hasClass = me ? hasClassOnWeekday(me.timetable, weekdayKo) : false
      const dayEvents = events.filter((e) => e.date === iso)
      const isPast = dateObj < today
      const isToday = diffDays(dateObj, today) === 0
      cells.push({
        type: 'day',
        day: d,
        iso,
        weekdayKo,
        hasClass,
        dayEvents,
        isPast,
        isToday,
      })
    }
    return cells
  }, [y, m0, today, me, events])

  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.date.localeCompare(b.date)), [events])

  const upcoming = useMemo(() => sortedEvents.filter((e) => parseIso(e.date) >= today), [sortedEvents, today])
  const past = useMemo(() => sortedEvents.filter((e) => parseIso(e.date) < today).reverse(), [sortedEvents, today])

  const { heroEvent, heroLabel } = useMemo(() => {
    const focus = upcoming.filter((e) => ['시험', '평가', '특강'].includes(e.type))
    const pool = focus.length ? focus : upcoming
    const ev = pool[0] ?? null
    let label = '다음 시험 · 평가 · 특강까지'
    if (!focus.length && upcoming.length) label = '가장 가까운 일정까지'
    if (!upcoming.length) label = '일정'
    return { heroEvent: ev, heroLabel: label }
  }, [upcoming])

  const heroDday = heroEvent ? diffDays(today, parseIso(heroEvent.date)) : null

  if (!me) {
    return (
      <StudentLayout title="내 일정">
        <p>프로필을 찾을 수 없습니다.</p>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout title="내 일정">
      <section className={ui.card} style={{ textAlign: 'center', padding: '20px 14px' }}>
        <div className={ui.muted} style={{ marginBottom: 8, fontSize: '0.85rem' }}>
          {heroLabel}
        </div>
        {heroEvent ? (
          <>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              {heroDday === 0 ? 'D-Day' : heroDday > 0 ? `D-${heroDday}` : `D+${Math.abs(heroDday)}`}
            </div>
            <div style={{ fontWeight: 800, marginTop: 10, fontSize: '1.05rem' }}>{heroEvent.title}</div>
            <div className={ui.muted} style={{ marginTop: 4 }}>
              {formatIsoDate(heroEvent.date)} · {heroEvent.type}
            </div>
          </>
        ) : (
          <p className={ui.muted} style={{ margin: 0 }}>
            예정된 시험·평가 일정이 없습니다. 멘토가 일정을 등록하면 여기에 표시됩니다.
          </p>
        )}
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 12 }}>
          이번 달 수업 캘린더
        </div>
        <div style={{ fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>{monthLabel}</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 4,
            fontSize: '0.68rem',
            textAlign: 'center',
          }}
        >
          {DAY_HEADERS.map((h) => (
            <div key={h} className={ui.muted} style={{ fontWeight: 700, padding: '4px 0' }}>
              {h}
            </div>
          ))}
          {calendarCells.map((cell, idx) =>
            cell.type === 'pad' ? (
              <div key={`pad-${idx}`} />
            ) : (
              <div
                key={cell.iso}
                style={{
                  minHeight: 52,
                  borderRadius: 10,
                  padding: '6px 2px',
                  border: cell.isToday ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: cell.isPast ? 'color-mix(in srgb, var(--muted) 12%, transparent)' : 'var(--surface)',
                  opacity: cell.isPast ? 0.55 : 1,
                }}
              >
                <div style={{ fontWeight: cell.isToday ? 800 : 600 }}>{cell.day}</div>
                <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                  {cell.hasClass ? (
                    <span title="정규 수업" style={{ width: 6, height: 6, borderRadius: 999, background: '#5C6BC0' }} />
                  ) : null}
                  {cell.dayEvents.map((ev) => (
                    <span
                      key={ev.id}
                      title={ev.title}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background:
                          ev.type === '시험'
                            ? '#c62828'
                            : ev.type === '평가'
                              ? '#f9a825'
                              : ev.type === '특강'
                                ? '#7E57C2'
                                : 'var(--accent)',
                      }}
                    />
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
        <div className={ui.muted} style={{ marginTop: 10, fontSize: '0.72rem', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <span>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: '#5C6BC0', verticalAlign: 'middle', marginRight: 4 }} />
            정규 수업일
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: 'var(--accent)', verticalAlign: 'middle', marginRight: 4 }} />
            멘토 일정
          </span>
        </div>
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          다가오는 일정
        </div>
        {upcoming.length === 0 ? (
          <p className={ui.muted}>등록된 일정이 없습니다.</p>
        ) : (
          upcoming.map((ev) => {
            const dleft = diffDays(today, parseIso(ev.date))
            return (
              <div
                key={ev.id}
                style={{
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{ev.title}</div>
                  <div className={ui.muted} style={{ fontSize: '0.8rem' }}>
                    {formatIsoDate(ev.date)} · {ev.type}
                  </div>
                </div>
                <span className={ui.chip}>{dleft === 0 ? '오늘' : `D-${dleft}`}</span>
              </div>
            )
          })
        )}
      </section>

      {past.length ? (
        <section className={ui.card} style={{ opacity: 0.72 }}>
          <div className={ui.badge} style={{ marginBottom: 8 }}>
            지난 일정
          </div>
          {past.map((ev) => (
            <div
              key={ev.id}
              style={{
                padding: '8px 0',
                borderBottom: '1px solid var(--border)',
                color: 'var(--muted)',
              }}
            >
              <div style={{ fontWeight: 600 }}>{ev.title}</div>
              <div style={{ fontSize: '0.8rem' }}>
                {formatIsoDate(ev.date)} · {ev.type}
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </StudentLayout>
  )
}
