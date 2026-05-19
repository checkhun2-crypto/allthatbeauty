import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { StudentLayout } from '../../components/RoleLayout.jsx'
import ui from '../../components/ui.module.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { fmtDur } from '../../lib/formatDuration.js'
import { formatIsoDate } from '../../lib/nav.js'
import s from './StudentSchedule.module.css'

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

function getSlotsForWeekday(timetable, weekdayKo) {
  if (!timetable?.length) return []
  const row = timetable.find((r) => r.day === weekdayKo)
  return row?.slots ?? []
}

function eventDotColor(type) {
  if (type === '시험') return '#c62828'
  if (type === '평가') return '#f9a825'
  if (type === '특강') return '#7E57C2'
  return 'var(--accent)'
}

function shiftMonth(y, m0, delta) {
  const d = new Date(y, m0 + delta, 1)
  return { y: d.getFullYear(), m0: d.getMonth() }
}

function DateDetailPanel({ iso, me, events, onClose, onPhotoClick }) {
  const dateObj = parseIso(iso)
  const weekdayKo = DAY_HEADERS[dateObj.getDay()]
  const slots = getSlotsForWeekday(me.timetable, weekdayKo)
  const dayEvents = events.filter((e) => e.date === iso)
  const dailyPhotos = me.dailyResults.filter((d) => d.date === iso)
  const practiceSec = me.practiceSecondsByDate?.[iso] ?? 0

  return (
    <div className={s.detailPanel}>
      <div className={s.detailHead}>
        <div>
          <h3 className={s.detailTitle}>{formatIsoDate(iso)}</h3>
          <p className={s.detailSub}>{weekdayKo}요일</p>
        </div>
        <button type="button" className={s.closeBtn} onClick={onClose}>
          닫기
        </button>
      </div>

      <div className={s.section}>
        <h4 className={s.sectionTitle}>수업 일정</h4>
        {slots.length === 0 && dayEvents.length === 0 ? (
          <p className={s.emptyLine}>등록된 수업·일정이 없습니다.</p>
        ) : (
          <>
            {slots.map((sl) => (
              <div key={`${sl.time}-${sl.subject}`} className={s.slotRow}>
                <strong>{sl.time}</strong> · {sl.subject}
              </div>
            ))}
            {dayEvents.map((ev) => (
              <div key={ev.id} className={s.slotRow}>
                <strong>{ev.type}</strong> · {ev.title}
              </div>
            ))}
          </>
        )}
      </div>

      <div className={s.section}>
        <h4 className={s.sectionTitle}>오늘의 결과물</h4>
        {dailyPhotos.length === 0 ? (
          <p className={s.emptyLine}>올린 사진이 없습니다.</p>
        ) : (
          <div className={s.photoGrid}>
            {dailyPhotos.map((d) => (
              <button
                key={d.id}
                type="button"
                className={s.photoBtn}
                onClick={() => onPhotoClick(d.src)}
                aria-label="크게 보기"
              >
                <img src={d.src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={s.section}>
        <h4 className={s.sectionTitle}>연습 타이머</h4>
        {practiceSec > 0 ? (
          <p className={s.emptyLine} style={{ color: 'var(--text)', fontWeight: 700 }}>
            {fmtDur(practiceSec)}
          </p>
        ) : (
          <p className={s.emptyLine}>연습 기록이 없습니다.</p>
        )}
      </div>
    </div>
  )
}

export default function StudentSchedule() {
  const { studentId } = useAuth()
  const { students, events } = useData()
  const me = students.find((st) => st.id === studentId)

  const today = startOfToday()
  const todayY = today.getFullYear()
  const todayM0 = today.getMonth()
  const todayIso = toIso(todayY, todayM0, today.getDate())

  const [view, setView] = useState(() => ({ y: todayY, m0: todayM0 }))
  const [selectedIso, setSelectedIso] = useState(null)
  const [lightboxSrc, setLightboxSrc] = useState(null)

  const { y, m0 } = view
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
      const isToday = diffDays(dateObj, today) === 0
      cells.push({ type: 'day', day: d, iso, hasClass, dayEvents, isToday })
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

  function goToday() {
    setView({ y: todayY, m0: todayM0 })
    setSelectedIso(todayIso)
  }

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
            <div
              style={{
                fontSize: '3rem',
                fontWeight: 900,
                color: 'var(--accent)',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
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
          수업 캘린더
        </div>

        <div className={s.calNav}>
          <button
            type="button"
            className={s.navBtn}
            aria-label="이전 달"
            onClick={() => setView((v) => shiftMonth(v.y, v.m0, -1))}
          >
            ‹
          </button>
          <span className={s.monthLabel}>{monthLabel}</span>
          <button
            type="button"
            className={s.navBtn}
            aria-label="다음 달"
            onClick={() => setView((v) => shiftMonth(v.y, v.m0, 1))}
          >
            ›
          </button>
          <button type="button" className={s.todayBtn} onClick={goToday}>
            오늘
          </button>
        </div>

        <div className={s.calGrid}>
          {DAY_HEADERS.map((h) => (
            <div key={h} className={s.dayHead}>
              {h}
            </div>
          ))}
          {calendarCells.map((cell, idx) =>
            cell.type === 'pad' ? (
              <div key={`pad-${idx}`} />
            ) : (
              <button
                key={cell.iso}
                type="button"
                className={`${s.dayBtn} ${cell.isToday ? s.dayBtnToday : ''} ${selectedIso === cell.iso ? s.dayBtnSelected : ''}`}
                onClick={() => setSelectedIso(cell.iso)}
              >
                <div className={`${s.dayNum} ${cell.isToday ? s.dayNumToday : ''}`}>{cell.day}</div>
                <div className={s.dots}>
                  {cell.hasClass ? <span className={s.dotClass} title="정규 수업" /> : null}
                  {cell.dayEvents.map((ev) => (
                    <span
                      key={ev.id}
                      className={s.dotEvent}
                      title={ev.title}
                      style={{ background: eventDotColor(ev.type) }}
                    />
                  ))}
                </div>
              </button>
            ),
          )}
        </div>

        <div className={s.legend}>
          <span>
            <span className={s.dotClass} style={{ display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} />
            정규 수업일
          </span>
          <span>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: 999,
                background: 'var(--accent)',
                marginRight: 4,
                verticalAlign: 'middle',
              }}
            />
            멘토 일정
          </span>
        </div>

        {selectedIso ? (
          <DateDetailPanel
            iso={selectedIso}
            me={me}
            events={events}
            onClose={() => setSelectedIso(null)}
            onPhotoClick={setLightboxSrc}
          />
        ) : null}
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

      {lightboxSrc && typeof document !== 'undefined'
        ? createPortal(
            <div className={s.lightbox} role="dialog" aria-modal="true" onClick={() => setLightboxSrc(null)}>
              <button type="button" className={s.lightboxClose} onClick={() => setLightboxSrc(null)}>
                ×
              </button>
              <img
                className={s.lightboxImg}
                src={lightboxSrc}
                alt=""
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}
    </StudentLayout>
  )
}
