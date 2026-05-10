import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MentorLayout } from '../../components/RoleLayout.jsx'
import GrowthCharts from '../../components/GrowthCharts.jsx'
import ui from '../../components/ui.module.css'
import { useData } from '../../context/DataContext.jsx'
import { formatIsoDate } from '../../lib/nav.js'

function groupDailyByDate(items) {
  const map = new Map()
  for (const d of items) {
    if (!map.has(d.date)) map.set(d.date, [])
    map.get(d.date).push(d)
  }
  return [...map.entries()]
    .map(([date, list]) => ({ date, items: list.sort((a, b) => b.id.localeCompare(a.id)) }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export default function MentorStudentDetail() {
  const { id } = useParams()
  const { students, updateStudentMemo, updateStudentFeedback } = useData()
  const student = useMemo(() => students.find((s) => s.id === id), [students, id])
  const [memo, setMemo] = useState(student?.memo ?? '')
  const [feedback, setFeedback] = useState(student?.feedback ?? '')

  useEffect(() => {
    if (!student) return
    setMemo(student.memo)
    setFeedback(student.feedback)
  }, [student])

  if (!student) {
    return (
      <MentorLayout title="수강생">
        <p>찾을 수 없습니다.</p>
      </MentorLayout>
    )
  }

  return (
    <MentorLayout title={student.name}>
      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          타임테이블
        </div>
        {student.timetable.map((row) => (
          <div key={row.day} style={{ marginBottom: 8 }}>
            <strong>{row.day}</strong>
            <div style={{ marginTop: 4 }}>
              {row.slots.map((sl) => (
                <span key={sl.time} className={ui.chip} style={{ marginRight: 6 }}>
                  {sl.time} {sl.subject}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          출결
        </div>
        <div className={ui.row} style={{ gap: 12 }}>
          <Stat label="출석" value={student.attendance.present} tone="ok" />
          <Stat label="지각" value={student.attendance.late} tone="warn" />
          <Stat label="결석" value={student.attendance.absent} tone="bad" />
        </div>
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          성장 그래프
        </div>
        <GrowthCharts monthlyScores={student.monthlyScores} monthlyAttendance={student.monthlyAttendance} />
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          커리큘럼 시작일
        </div>
        <p className={ui.muted} style={{ marginTop: 0 }}>
          일정 탭에서 커리큘럼을 저장한 뒤 배분하면, 이 날짜를 기준으로 주간 슬롯에 항목이 채워집니다.
        </p>
        <CurriculumStartEditor student={student} />
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          멘토 메모
        </div>
        <textarea className={ui.textarea} value={memo} onChange={(e) => setMemo(e.target.value)} />
        <button type="button" className={ui.btn} style={{ marginTop: 8, width: '100%' }} onClick={() => updateStudentMemo(student.id, memo)}>
          메모 저장
        </button>
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          수강생에게 보이는 피드백
        </div>
        <textarea className={ui.textarea} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        <button
          type="button"
          className={ui.btn}
          style={{ marginTop: 8, width: '100%' }}
          onClick={() => updateStudentFeedback(student.id, feedback)}
        >
          피드백 저장
        </button>
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          포트폴리오
        </div>
        {student.portfolio.length === 0 ? (
          <p className={ui.muted}>등록된 이미지가 없습니다.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {student.portfolio.map((p) => (
              <img key={p.id} src={p.src} alt="" style={{ borderRadius: 12, width: '100%', height: 120, objectFit: 'cover' }} />
            ))}
          </div>
        )}
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          오늘의 결과물 · 제출 기록
        </div>
        {student.dailyResults.length === 0 ? (
          <p className={ui.muted}>아직 제출된 결과물이 없습니다.</p>
        ) : (
          groupDailyByDate(student.dailyResults).map(({ date, items }) => (
            <div key={date} style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {formatIsoDate(date)} · {items.length}장
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {items.map((d) => (
                  <figure key={d.id} style={{ margin: 0 }}>
                    <img src={d.src} alt="" style={{ borderRadius: 12, width: '100%', height: 110, objectFit: 'cover' }} />
                    {d.note ? (
                      <figcaption className={ui.muted} style={{ fontSize: '0.75rem', marginTop: 4 }}>
                        {d.note}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </MentorLayout>
  )
}

function Stat({ label, value, tone }) {
  const color =
    tone === 'ok' ? '#2e7d32' : tone === 'warn' ? '#f9a825' : '#c62828'
  return (
    <div>
      <div className={ui.muted} style={{ fontSize: '0.75rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value}</div>
    </div>
  )
}

function CurriculumStartEditor({ student }) {
  const { updateStudentCurriculumStart } = useData()
  const [iso, setIso] = useState(student.curriculumStartDate ?? '')
  useEffect(() => {
    setIso(student.curriculumStartDate ?? '')
  }, [student.curriculumStartDate, student.id])
  return (
    <>
      <input className={ui.input} type="date" value={iso} onChange={(e) => setIso(e.target.value)} />
      <button
        type="button"
        className={ui.btn}
        style={{ marginTop: 8, width: '100%' }}
        onClick={() => updateStudentCurriculumStart(student.id, iso)}
      >
        시작일 저장
      </button>
    </>
  )
}
