import { Link } from 'react-router-dom'
import { ParentLayout } from '../../components/RoleLayout.jsx'
import { useData } from '../../context/DataContext.jsx'
import { formatTs } from '../../lib/nav.js'
import p from './parent.module.css'

export default function ParentNotices() {
  const { notices } = useData()
  return (
    <ParentLayout title="공지">
      <div className={p.page}>
        {notices.length === 0 ? (
          <p className={p.emptyState}>등록된 공지가 없습니다.</p>
        ) : (
          notices.map((n) => (
            <Link key={n.id} to={`/parent/notices/${n.id}`} className={`${p.card} ${p.linkCard}`}>
              <p className={p.noticeTitle}>{n.title}</p>
              <p className={p.muted}>
                {formatTs(n.createdAt)} · {n.author}
              </p>
            </Link>
          ))
        )}
      </div>
    </ParentLayout>
  )
}
