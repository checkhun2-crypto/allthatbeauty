import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MentorLayout } from '../../components/RoleLayout.jsx'
import ui from '../../components/ui.module.css'
import { useData } from '../../context/DataContext.jsx'
import { MENTOR_NAME } from '../../data/seed.js'

function readFileAsDataUrl(file, maxBytes) {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      reject(new Error('용량 초과'))
      return
    }
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

export default function MentorNoticeNew() {
  const { addNotice } = useData()
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [videoLink, setVideoLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  return (
    <MentorLayout title="새 공지">
      <button type="button" className={`${ui.btnGhost} ${ui.btnSm}`} style={{ marginBottom: 10 }} onClick={() => nav(-1)}>
        취소
      </button>
      {err ? (
        <p style={{ color: '#c62828', fontSize: '0.85rem' }}>{err}</p>
      ) : null}
      <div className={ui.card}>
        <label className={ui.muted}>제목</label>
        <input className={ui.input} style={{ marginTop: 4 }} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className={ui.card}>
        <label className={ui.muted}>본문</label>
        <textarea className={ui.textarea} style={{ marginTop: 4 }} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className={ui.card}>
        <label className={ui.muted}>사진 (여러 장)</label>
        <input
          style={{ marginTop: 6 }}
          type="file"
          accept="image/*"
          multiple
          id="notice-imgs"
        />
        <label className={ui.muted} style={{ display: 'block', marginTop: 12 }}>
          동영상 파일 (3MB 이하, 데모 저장)
        </label>
        <input style={{ marginTop: 6 }} type="file" accept="video/*" id="notice-vid" />
        <label className={ui.muted} style={{ display: 'block', marginTop: 12 }}>
          또는 동영상 URL (YouTube 등)
        </label>
        <input
          className={ui.input}
          style={{ marginTop: 4 }}
          placeholder="https://..."
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
        />
      </div>
      <button
        type="button"
        className={ui.btn}
        style={{ width: '100%' }}
        disabled={busy}
        onClick={async () => {
          setErr('')
          if (!title.trim() || !body.trim()) {
            setErr('제목과 본문을 입력해 주세요.')
            return
          }
          setBusy(true)
          const attachments = []
          const imgInput = document.getElementById('notice-imgs')
          const vidInput = document.getElementById('notice-vid')
          try {
            const files = imgInput?.files ? Array.from(imgInput.files).slice(0, 6) : []
            for (const f of files) {
              const src = await readFileAsDataUrl(f, 900_000)
              attachments.push({ type: 'image', src })
            }
            const vf = vidInput?.files?.[0]
            if (vf) {
              const src = await readFileAsDataUrl(vf, 3_000_000)
              attachments.push({ type: 'video', src })
            } else if (videoLink.trim()) {
              attachments.push({ type: 'videoLink', href: videoLink.trim() })
            }
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
          } catch {
            setErr('파일 용량이 너무 큽니다. 사진/동영상 크기를 줄이거나 URL만 사용해 주세요.')
          } finally {
            setBusy(false)
          }
        }}
      >
        {busy ? '업로드 중…' : '등록하기'}
      </button>
    </MentorLayout>
  )
}
