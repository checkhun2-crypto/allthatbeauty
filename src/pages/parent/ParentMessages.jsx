import { ParentLayout } from '../../components/RoleLayout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { formatTs } from '../../lib/nav.js'
import p from './parent.module.css'

export default function ParentMessages() {
  const { studentId } = useAuth()
  const { parentMessages } = useData()
  const list = parentMessages
    .filter((m) => m.studentId === studentId)
    .sort((a, b) => b.createdAt - a.createdAt)

  return (
    <ParentLayout title="멘토 메시지">
      <div className={p.page}>
        {list.length === 0 ? (
          <p className={p.emptyState}>받은 메시지가 없습니다.</p>
        ) : (
          list.map((m) => (
            <article key={m.id} className={p.card}>
              <h2 className={p.noticeTitle}>{m.title}</h2>
              <p className={p.muted}>{formatTs(m.createdAt)}</p>
              <p className={`${p.bodyText} ${p.messageBody}`}>{m.body}</p>
            </article>
          ))
        )}
      </div>
    </ParentLayout>
  )
}
