import { useNavigate } from 'react-router-dom'
import { ParentLayout } from '../../components/RoleLayout.jsx'
import PasswordChangeForm from '../../components/PasswordChangeForm.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { validatePasswordChange } from '../../lib/accounts.js'
import p from './parent.module.css'

export default function ParentSettings() {
  const { logout, studentId } = useAuth()
  const { students, updateParentPassword } = useData()
  const nav = useNavigate()
  const child = students.find((s) => s.id === studentId)

  return (
    <ParentLayout title="설정">
      <div className={p.page}>
        <section className={p.card}>
          <h2 className={p.cardTitle}>비밀번호 변경</h2>
          <p className={p.muted}>
            아이디: <strong>{child?.parentLoginId}</strong>
          </p>
          <PasswordChangeForm
            onSubmit={(current, next, confirm) => {
              const v = validatePasswordChange(current, next, confirm, child?.parentPassword ?? '')
              if (!v.ok) return v
              if (!child) return { ok: false, message: '자녀 정보를 찾을 수 없습니다.' }
              updateParentPassword(child.id, next)
              return { ok: true }
            }}
          />
        </section>
        <section className={p.card}>
          <h2 className={p.cardTitle}>안내</h2>
          <p className={p.muted}>
            학부모 계정은 연결된 자녀의 출결, 성장 기록, 포트폴리오(공개 시), 일정, 공지, 멘토
            메시지만 볼 수 있습니다. 다른 수강생 정보나 수강생 개인 메모·채팅은 제공되지 않습니다.
          </p>
        </section>
        <section className={p.card}>
          <button
            type="button"
            className={p.btnLogout}
            onClick={() => {
              logout()
              nav('/')
            }}
          >
            로그아웃
          </button>
        </section>
      </div>
    </ParentLayout>
  )
}
