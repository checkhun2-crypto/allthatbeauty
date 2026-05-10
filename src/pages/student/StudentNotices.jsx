import { Link } from 'react-router-dom'
import { StudentLayout } from '../../components/RoleLayout.jsx'
import ui from '../../components/ui.module.css'
import { useData } from '../../context/DataContext.jsx'
import { formatTs } from '../../lib/nav.js'

export default function StudentNotices() {
  const { notices } = useData()
  return (
    <StudentLayout title="공지">
      {notices.map((n) => (
        <Link key={n.id} to={`/student/notices/${n.id}`} className={ui.card} style={{ display: 'block' }}>
          <div style={{ fontWeight: 700 }}>{n.title}</div>
          <div className={ui.muted}>
            {formatTs(n.createdAt)} · 댓글 {n.comments.length}
          </div>
        </Link>
      ))}
    </StudentLayout>
  )
}
