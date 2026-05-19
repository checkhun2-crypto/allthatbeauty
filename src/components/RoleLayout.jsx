import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import BottomNav from './BottomNav.jsx'
import MobileShell from './MobileShell.jsx'
import { mentorNavItems, parentNavItems, studentNavItems } from '../lib/nav.js'
import parentStyles from '../pages/parent/parent.module.css'

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
  return (
    <MobileShell
      title={title}
      footer={<BottomNav items={studentNavItems} />}
    >
      {headerExtra}
      {children}
    </MobileShell>
  )
}

export function ParentLayout({ title, children, headerExtra, hideHeaderTitle = false }) {
  const { logout } = useAuth()
  const nav = useNavigate()
  return (
    <div className={parentStyles.theme}>
      <MobileShell
        title={title}
        hideHeaderTitle={hideHeaderTitle}
        viewportClassName={parentStyles.viewportOverride}
        mainClassName={parentStyles.mainOverride}
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
              color: '#64748b',
              fontSize: '0.8rem',
            }}
          >
            나가기
          </button>
        }
        footer={<BottomNav items={parentNavItems} tone="parent" />}
      >
        {headerExtra}
        {children}
      </MobileShell>
    </div>
  )
}
