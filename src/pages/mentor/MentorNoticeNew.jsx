import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MentorLayout } from '../../components/RoleLayout.jsx'
import NoticeMediaUpload from '../../components/NoticeMediaUpload.jsx'
import ui from '../../components/ui.module.css'
import { useData } from '../../context/DataContext.jsx'
import { MENTOR_NAME } from '../../data/seed.js'

export default function MentorNoticeNew() {
  const { addNotice } = useData()
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  return (
    <MentorLayout title="새 공지">
      <button type="button" className={`${ui.btnGhost} ${ui.btnSm}`} style={{ marginBottom: 10 }} onClick={() => nav(-1)}>
        취소
      </button>
      {err ? <p style={{ color: '#c62828', fontSize: '0.85rem' }}>{err}</p> : null}
      <div className={ui.card}>
        <label className={ui.muted}>제목</label>
        <input className={ui.input} style={{ marginTop: 4 }} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className={ui.card}>
        <label className={ui.muted}>본문</label>
        <textarea className={ui.textarea} style={{ marginTop: 4 }} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className={ui.card}>
        <NoticeMediaUpload onChange={setAttachments} disabled={busy} />
      </div>
      <button
        type="button"
        className={ui.btn}
        style={{ width: '100%' }}
        disabled={busy}
        onClick={() => {
          setErr('')
          if (!title.trim() || !body.trim()) {
            setErr('제목과 본문을 입력해 주세요.')
            return
          }
          setBusy(true)
          try {
            const id = `n_${Date.now()}`
            addNotice({
              id,
              title: title.trim(),
              body: body.trim(),
              author: MENTOR_NAME,
              createdAt: Date.now(),
              attachments,
              comments: [],
            })
            nav(`/mentor/notices/${id}`)
          } finally {
            setBusy(false)
          }
        }}
      >
        등록하기
      </button>
    </MentorLayout>
  )
}
