import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MentorLayout } from '../../components/RoleLayout.jsx'
import PasswordChangeForm from '../../components/PasswordChangeForm.jsx'
import ui from '../../components/ui.module.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { DEFAULT_PASSWORD, validatePasswordChange } from '../../lib/accounts.js'
import { useMentorScope } from '../../hooks/useMentorScope.js'

export default function MentorSettings() {
  const { logout, mentorId } = useAuth()
  const { mentors, addMentor, removeMentor, resetMentorPassword, updateMentorPassword } = useData()
  const { currentMentor, isSuperAdmin } = useMentorScope()
  const nav = useNavigate()

  const [newMentorName, setNewMentorName] = useState('')
  const [newMentorPw, setNewMentorPw] = useState(DEFAULT_PASSWORD)
  const [mentorMsg, setMentorMsg] = useState('')

  const me = mentors.find((m) => m.id === mentorId)

  function handlePasswordChange(current, next, confirm) {
    const v = validatePasswordChange(current, next, confirm, me?.password ?? '')
    if (!v.ok) return v
    updateMentorPassword(mentorId, next)
    return { ok: true }
  }

  function handleAddMentor(e) {
    e.preventDefault()
    setMentorMsg('')
    const r = addMentor({ name: newMentorName, password: newMentorPw })
    if (!r.ok) {
      setMentorMsg(r.message)
      return
    }
    setMentorMsg(`${r.mentor.loginId} 멘토가 등록되었습니다.`)
    setNewMentorName('')
    setNewMentorPw(DEFAULT_PASSWORD)
  }

  return (
    <MentorLayout title="설정">
      <section className={ui.card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>내 계정</div>
        {me ? (
          <p className={ui.muted} style={{ marginTop: 0 }}>
            아이디: <strong>{me.loginId}</strong>
            {me.isSuperAdmin ? ' · 슈퍼 관리자' : ''}
          </p>
        ) : null}
      </section>

      <section className={ui.card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>비밀번호 변경</div>
        <PasswordChangeForm onSubmit={handlePasswordChange} />
      </section>

      {isSuperAdmin ? (
        <section className={ui.card}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>멘토 관리</div>
          <p className={ui.muted} style={{ marginTop: 0 }}>
            슈퍼 관리자만 다른 멘토 계정을 추가·삭제할 수 있습니다.
          </p>
          <form onSubmit={handleAddMentor}>
            <label className={ui.muted} style={{ display: 'block', marginBottom: 4 }}>
              멘토 이름
            </label>
            <input
              className={ui.input}
              value={newMentorName}
              onChange={(e) => setNewMentorName(e.target.value)}
              placeholder="예: 김철수 → 김철수멘토"
              required
            />
            <label className={ui.muted} style={{ display: 'block', margin: '10px 0 4px' }}>
              초기 비밀번호
            </label>
            <input
              className={ui.input}
              type="password"
              value={newMentorPw}
              onChange={(e) => setNewMentorPw(e.target.value)}
            />
            <button type="submit" className={ui.btn} style={{ width: '100%', marginTop: 10 }}>
              멘토 등록
            </button>
          </form>
          {mentorMsg ? <p className={ui.muted} style={{ marginTop: 8, color: '#2e7d32' }}>{mentorMsg}</p> : null}

          <div style={{ marginTop: 16 }}>
            {mentors.map((m) => (
              <div
                key={m.id}
                className={ui.row}
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{m.name}</div>
                  <div className={ui.muted}>{m.loginId}</div>
                </div>
                <div className={ui.row} style={{ gap: 6 }}>
                  {!m.isSuperAdmin ? (
                    <>
                      <button
                        type="button"
                        className={`${ui.btn} ${ui.btnSm} ${ui.btnGhost}`}
                        onClick={() => {
                          if (window.confirm(`${m.name} 멘토 비밀번호를 1234로 초기화할까요?`)) {
                            resetMentorPassword(m.id)
                          }
                        }}
                      >
                        비번 초기화
                      </button>
                      <button
                        type="button"
                        className={`${ui.btn} ${ui.btnSm} ${ui.btnDanger}`}
                        onClick={() => {
                          if (window.confirm(`${m.name} 멘토를 삭제할까요?`)) {
                            removeMentor(m.id)
                          }
                        }}
                      >
                        삭제
                      </button>
                    </>
                  ) : (
                    <span className={ui.chip}>슈퍼</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className={ui.card}>
        <button
          type="button"
          className={`${ui.btn} ${ui.btnDanger}`}
          style={{ width: '100%' }}
          onClick={() => {
            logout()
            nav('/')
          }}
        >
          로그아웃
        </button>
      </section>
    </MentorLayout>
  )
}
