import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import BottomNav from './BottomNav.jsx'
import MobileShell from './MobileShell.jsx'
import { mentorNavItems, studentNavItems } from '../lib/nav.js'

export function MentorLayout({ title, children, headerExtra }) {
  const { logout } = useAuth()
  const nav = useNavigate()
  return (
    <MobileShell
      title={title}
      headerRight={
        <button
          type="button"
          onClick={() => {
            logout()
            nav('/')
          }}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--muted)',
            fontSize: '0.8rem',
          }}
        >
          나가기
        </button>
      }
      footer={<BottomNav items={mentorNavItems} />}
    >
      {headerExtra}
      {children}
    </MobileShell>
  )
}

export function StudentLayout({ title, children, headerExtra }) {
  const { logout } = useAuth()
  const nav = useNavigate()
  return (
    <MobileShell
      title={title}
      headerRight={
        <button
          type="button"
          onClick={() => {
            logout()
            nav('/')
          }}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--muted)',
            fontSize: '0.8rem',
          }}
        >
          나가기
        </button>
      }
      footer={<BottomNav items={studentNavItems} />}
    >
      {headerExtra}
      {children}
    </MobileShell>
  )
}
