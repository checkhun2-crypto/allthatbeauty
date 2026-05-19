import { useState } from 'react'
import { Link } from 'react-router-dom'
import DeleteStudentButton from '../../components/DeleteStudentButton.jsx'
import { MentorLayout } from '../../components/RoleLayout.jsx'
import ui from '../../components/ui.module.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { DEFAULT_PASSWORD, parentLoginIdFromName, studentLoginId } from '../../lib/accounts.js'
import { canDeleteStudent } from '../../lib/studentDelete.js'
import { useMentorScope } from '../../hooks/useMentorScope.js'

function StudentCard({ student, canDelete, onDeleted }) {
  const sum = student.attendance.present + student.attendance.late + student.attendance.absent
  const rate = sum ? Math.round((student.attendance.present / sum) * 1000) / 10 : 0

  return (
    <div className={ui.card}>
      <Link
        to={`/mentor/students/${student.id}`}
        style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      >
        <div style={{ fontWeight: 700 }}>{student.name}</div>
        <div className={ui.muted}>{student.course}</div>
        <div className={ui.muted} style={{ fontSize: '0.75rem', marginTop: 4 }}>
          수강생 {student.loginId} · 학부모 {student.parentLoginId}
        </div>
        <div style={{ marginTop: 8 }} className={ui.row}>
          <span className={ui.chip}>출석률 {rate}%</span>
          <span className={ui.chip}>지각 {student.attendance.late}</span>
        </div>
      </Link>
      {canDelete ? (
        <DeleteStudentButton
          student={student}
          onDelete={onDeleted}
          size="sm"
          className=""
          style={{ width: '100%', marginTop: 10 }}
        />
      ) : null}
    </div>
  )
}

export default function MentorStudents() {
  const { mentorId } = useAuth()
  const { students, mentors, addStudent, removeStudent } = useData()
  const { myStudents, isSuperAdmin } = useMentorScope()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [password, setPassword] = useState(DEFAULT_PASSWORD)
  const [formError, setFormError] = useState('')
  const [done, setDone] = useState('')

  function resetForm() {
    setName('')
    setCourse('')
    setPassword(DEFAULT_PASSWORD)
    setFormError('')
  }

  function handleDeleted(studentId) {
    const removed = students.find((s) => s.id === studentId)
    setDone(removed ? `${removed.name} 수강생이 삭제되었습니다.` : '수강생이 삭제되었습니다.')
  }

  function handleRegister(e) {
    e.preventDefault()
    setFormError('')
    setDone('')
    const trimmed = name.trim()
    if (!trimmed) {
      setFormError('이름을 입력해 주세요.')
      return
    }
    const pool = isSuperAdmin ? students : myStudents
    if (pool.some((s) => s.name === trimmed)) {
      setFormError('같은 이름의 수강생이 이미 있습니다.')
      return
    }
    addStudent({
      name: trimmed,
      course,
      password,
      mentorId,
    })
    const sid = studentLoginId(trimmed)
    const pid = parentLoginIdFromName(trimmed)
    setDone(`${trimmed} 수강생 등록 완료 (수강생: ${sid}, 학부모: ${pid})`)
    resetForm()
    setShowForm(false)
  }

  const deleteCtx = { mentorId, isSuperAdmin }

  return (
    <MentorLayout title={isSuperAdmin ? '전체 수강생' : '수강생'}>
      <section className={ui.card}>
        <div className={ui.row} style={{ justifyContent: 'space-between', marginBottom: showForm ? 10 : 0 }}>
          <span style={{ fontWeight: 700 }}>수강생 등록</span>
          <button type="button" className={`${ui.btn} ${ui.btnSm}`} onClick={() => setShowForm((v) => !v)}>
            {showForm ? '닫기' : '+ 등록'}
          </button>
        </div>
        {done ? <p className={ui.muted} style={{ color: '#2e7d32', margin: '8px 0 0' }}>{done}</p> : null}
        {showForm ? (
          <form onSubmit={handleRegister} style={{ marginTop: 10 }}>
            <label className={ui.muted} style={{ display: 'block', marginBottom: 4 }}>
              이름 (수강생 아이디로 사용)
            </label>
            <input className={ui.input} value={name} onChange={(e) => setName(e.target.value)} required />
            <p className={ui.muted} style={{ fontSize: '0.75rem', margin: '6px 0 0' }}>
              학부모 아이디는 자동으로 「이름+부모」 (예: 김민지부모)
            </p>
            <label className={ui.muted} style={{ display: 'block', margin: '10px 0 4px' }}>
              과정
            </label>
            <input className={ui.input} value={course} onChange={(e) => setCourse(e.target.value)} placeholder="예: 뷰티 마스터반" />
            <label className={ui.muted} style={{ display: 'block', margin: '10px 0 4px' }}>
              초기 비밀번호 (수강생·학부모 동일)
            </label>
            <input className={ui.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {formError ? <p style={{ color: '#c62828', fontSize: '0.82rem', marginTop: 8 }}>{formError}</p> : null}
            <button type="submit" className={ui.btn} style={{ width: '100%', marginTop: 12 }}>
              등록하기
            </button>
          </form>
        ) : null}
      </section>

      {isSuperAdmin ? (
        mentors.map((mentor) => {
          const group = students.filter((s) => s.mentorId === mentor.id)
          if (group.length === 0) return null
          return (
            <section key={mentor.id}>
              <h3 style={{ margin: '4px 0 10px', fontSize: '0.95rem', color: 'var(--muted)' }}>
                {mentor.name} 멘토 · {group.length}명
              </h3>
              {group.map((s) => (
                <StudentCard
                  key={s.id}
                  student={s}
                  canDelete={canDeleteStudent(s, deleteCtx)}
                  onDeleted={(id) => {
                    removeStudent(id)
                    handleDeleted(id)
                  }}
                />
              ))}
            </section>
          )
        })
      ) : myStudents.length === 0 ? (
        <p className={ui.muted}>담당 수강생이 없습니다.</p>
      ) : (
        myStudents.map((s) => (
          <StudentCard
            key={s.id}
            student={s}
            canDelete={canDeleteStudent(s, deleteCtx)}
            onDeleted={(id) => {
              removeStudent(id)
              handleDeleted(id)
            }}
          />
        ))
      )}

      {isSuperAdmin && students.length === 0 ? <p className={ui.muted}>등록된 수강생이 없습니다.</p> : null}
    </MentorLayout>
  )
}
