import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MentorLayout } from '../../components/RoleLayout.jsx'
import DeleteStudentButton from '../../components/DeleteStudentButton.jsx'
import GrowthCharts from '../../components/GrowthCharts.jsx'
import ui from '../../components/ui.module.css'
import { useData } from '../../context/DataContext.jsx'
import { DEFAULT_PASSWORD } from '../../lib/accounts.js'
import { canDeleteStudent } from '../../lib/studentDelete.js'
import { useMentorScope } from '../../hooks/useMentorScope.js'
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
  const nav = useNavigate()
  const {
    students,
    updateStudentMemo,
    updateStudentFeedback,
    sendParentMessage,
    resetStudentPassword,
    resetParentPassword,
    removeStudent,
  } = useData()
  const { myStudents, isSuperAdmin, mentorId } = useMentorScope()
  const student = useMemo(() => {
    if (isSuperAdmin) return students.find((s) => s.id === id)
    return myStudents.find((s) => s.id === id)
  }, [students, myStudents, id, isSuperAdmin])
  const showDelete = student && canDeleteStudent(student, { mentorId, isSuperAdmin })
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
        <GrowthCharts student={student} />
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
          계정 정보
        </div>
        <AccountInfo student={student} onResetStudent={() => resetStudentPassword(student.id)} onResetParent={() => resetParentPassword(student.id)} />
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          학부모에게 메시지
        </div>
        <ParentMessageForm studentId={student.id} studentName={student.name} onSend={sendParentMessage} />
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          멘토 메모
        </div>
        <p className={ui.muted} style={{ marginTop: 0 }}>
          수강생·학부모에게 보이지 않는 내부 메모입니다.
        </p>
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

      {showDelete ? (
        <section className={ui.card}>
          <div
            className={ui.badge}
            style={{ marginBottom: 8, background: 'rgba(198,40,40,0.12)', color: '#c62828' }}
          >
            수강생 삭제
          </div>
          <p className={ui.muted} style={{ marginTop: 0 }}>
            삭제 시 학부모 계정과 모든 학습 데이터가 영구 삭제됩니다.
          </p>
          <DeleteStudentButton
            student={student}
            style={{ width: '100%', marginTop: 10 }}
            onDelete={() => {
              removeStudent(student.id)
              nav('/mentor/students', { replace: true })
            }}
          />
        </section>
      ) : null}
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

function AccountInfo({ student, onResetStudent, onResetParent }) {
  const [msg, setMsg] = useState('')
  return (
    <>
      <p className={ui.muted} style={{ marginTop: 0 }}>
        수강생 아이디: <strong>{student.loginId}</strong>
        <br />
        학부모 아이디: <strong>{student.parentLoginId}</strong>
      </p>
      <div className={ui.row} style={{ gap: 8, marginTop: 10 }}>
        <button
          type="button"
          className={`${ui.btn} ${ui.btnSm} ${ui.btnGhost}`}
          style={{ flex: 1 }}
          onClick={() => {
            if (window.confirm(`수강생 비밀번호를 ${DEFAULT_PASSWORD}(으)로 초기화할까요?`)) {
              onResetStudent()
              setMsg('수강생 비밀번호가 초기화되었습니다.')
            }
          }}
        >
          수강생 비번 초기화
        </button>
        <button
          type="button"
          className={`${ui.btn} ${ui.btnSm} ${ui.btnGhost}`}
          style={{ flex: 1 }}
          onClick={() => {
            if (window.confirm(`학부모 비밀번호를 ${DEFAULT_PASSWORD}(으)로 초기화할까요?`)) {
              onResetParent()
              setMsg('학부모 비밀번호가 초기화되었습니다.')
            }
          }}
        >
          학부모 비번 초기화
        </button>
      </div>
      {msg ? <p style={{ color: '#2e7d32', fontSize: '0.82rem', marginTop: 8 }}>{msg}</p> : null}
    </>
  )
}

function ParentMessageForm({ studentId, studentName, onSend }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sent, setSent] = useState('')
  return (
    <>
      <p className={ui.muted} style={{ marginTop: 0 }}>
        {studentName} 학부모에게 시험 일정, 준비물 등을 전달합니다.
      </p>
      <input
        className={ui.input}
        placeholder="제목 (예: 실기 시험 준비물)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className={ui.textarea}
        style={{ marginTop: 8 }}
        placeholder="메시지 내용"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      {sent ? <p style={{ color: '#2e7d32', fontSize: '0.82rem' }}>{sent}</p> : null}
      <button
        type="button"
        className={ui.btn}
        style={{ marginTop: 8, width: '100%' }}
        onClick={() => {
          if (!body.trim()) return
          onSend(studentId, { title, body })
          setTitle('')
          setBody('')
          setSent('학부모에게 메시지를 보냈습니다.')
        }}
      >
        메시지 보내기
      </button>
    </>
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
