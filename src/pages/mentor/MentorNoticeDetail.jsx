import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MentorLayout } from '../../components/RoleLayout.jsx'
import ui from '../../components/ui.module.css'
import { useData } from '../../context/DataContext.jsx'
import { MENTOR_NAME } from '../../data/seed.js'
import { youtubeIdFromUrl } from '../../lib/embed.js'
import { formatTs } from '../../lib/nav.js'

export default function MentorNoticeDetail() {
  const { id } = useParams()
  const { notices, addComment } = useData()
  const nav = useNavigate()
  const notice = useMemo(() => notices.find((n) => n.id === id), [notices, id])
  const [text, setText] = useState('')

  if (!notice) {
    return (
      <MentorLayout title="공지">
        <p>없는 글입니다.</p>
      </MentorLayout>
    )
  }

  return (
    <MentorLayout title="공지 상세">
      <button type="button" className={`${ui.btnGhost} ${ui.btnSm}`} style={{ marginBottom: 10 }} onClick={() => nav(-1)}>
        ← 목록
      </button>
      <article className={ui.card}>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>{notice.title}</h2>
        <div className={ui.muted}>
          {notice.author} · {formatTs(notice.createdAt)}
        </div>
        <p style={{ whiteSpace: 'pre-wrap' }}>{notice.body}</p>
        {notice.attachments?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notice.attachments.map((a, i) => {
              if (a.type === 'image') return <img key={i} src={a.src} alt="" style={{ borderRadius: 12 }} />
              if (a.type === 'video' && a.src) return <video key={i} controls src={a.src} style={{ borderRadius: 12 }} />
              if (a.type === 'videoLink' && a.href) {
                const yid = youtubeIdFromUrl(a.href)
                if (yid) {
                  return (
                    <iframe
                      key={i}
                      title="video"
                      style={{ width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: 12 }}
                      src={`https://www.youtube.com/embed/${yid}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                }
                return (
                  <a key={i} href={a.href} target="_blank" rel="noreferrer" className={ui.muted}>
                    동영상 링크 열기
                  </a>
                )
              }
              return null
            })}
          </div>
        ) : null}
      </article>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          댓글 {notice.comments.length}
        </div>
        {notice.comments.map((c) => (
          <div key={c.id} style={{ borderBottom: '1px solid var(--border)', padding: '8px 0' }}>
            <div style={{ fontWeight: 600 }}>{c.author}</div>
            <div className={ui.muted}>{formatTs(c.at)}</div>
            <div>{c.text}</div>
          </div>
        ))}
        <div style={{ marginTop: 10 }}>
          <textarea className={ui.textarea} placeholder="댓글을 입력하세요" value={text} onChange={(e) => setText(e.target.value)} />
          <button
            type="button"
            className={ui.btn}
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => {
              if (!text.trim()) return
              addComment(notice.id, {
                id: `c_${Date.now()}`,
                author: MENTOR_NAME,
                text: text.trim(),
                at: Date.now(),
              })
              setText('')
            }}
          >
            댓글 등록
          </button>
        </div>
      </section>
    </MentorLayout>
  )
}
