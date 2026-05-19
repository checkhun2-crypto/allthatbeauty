import { useParams } from 'react-router-dom'
import { ParentLayout } from '../../components/RoleLayout.jsx'
import { useData } from '../../context/DataContext.jsx'
import { formatTs } from '../../lib/nav.js'
import p from './parent.module.css'

export default function ParentNoticeDetail() {
  const { id } = useParams()
  const { notices } = useData()
  const notice = notices.find((n) => n.id === id)

  if (!notice) {
    return (
      <ParentLayout title="공지">
        <p className={p.emptyState}>공지를 찾을 수 없습니다.</p>
      </ParentLayout>
    )
  }

  return (
    <ParentLayout title="공지">
      <article className={p.card}>
        <h2 className={p.noticeTitle}>{notice.title}</h2>
        <p className={p.muted}>
          {formatTs(notice.createdAt)} · {notice.author}
        </p>
        <p className={`${p.bodyText} ${p.messageBody}`}>{notice.body}</p>
        {notice.attachments?.length > 0 ? (
          <div className={p.attachments}>
            {notice.attachments.map((a, i) =>
              a.type === 'image' ? (
                <img key={i} src={a.src} alt="" className={p.attachmentImg} />
              ) : null,
            )}
          </div>
        ) : null}
      </article>
    </ParentLayout>
  )
}
