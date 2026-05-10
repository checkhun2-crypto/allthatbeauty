import { Link } from 'react-router-dom'
import { MentorLayout } from '../../components/RoleLayout.jsx'
import ui from '../../components/ui.module.css'
import { useData } from '../../context/DataContext.jsx'
import { formatTs } from '../../lib/nav.js'

export default function MentorNotices() {
  const { notices } = useData()
  return (
    <MentorLayout
      title="공지"
      headerExtra={
        <Link to="/mentor/notices/new" className={ui.btnSm} style={{ ...fabStyle, position: 'fixed', zIndex: 30 }}>
          새 공지
        </Link>
      }
    >
      {notices.map((n) => (
        <Link key={n.id} to={`/mentor/notices/${n.id}`} className={ui.card} style={{ display: 'block' }}>
          <div style={{ fontWeight: 700 }}>{n.title}</div>
          <div className={ui.muted}>{formatTs(n.createdAt)} · 댓글 {n.comments.length}</div>
        </Link>
      ))}
    </MentorLayout>
  )
}

const fabStyle = {
  right: 'max(16px, calc(50% - 180px + 16px))',
  bottom: 'calc(72px + env(safe-area-inset-bottom))',
  borderRadius: 999,
  padding: '10px 14px',
  textDecoration: 'none',
  color: '#fff',
  background: 'var(--accent)',
  fontWeight: 700,
  fontSize: '0.85rem',
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
}
