import { useState } from 'react'
import { isCloudinaryConfigured, uploadFilesToCloudinary, uploadToCloudinary, cloudinaryConfigHint } from '../lib/cloudinary.js'
import UploadProgress from './UploadProgress.jsx'
import ui from './ui.module.css'

export default function NoticeMediaUpload({ onChange, disabled }) {
  const [images, setImages] = useState([])
  const [video, setVideo] = useState(null)
  const [videoLink, setVideoLink] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [err, setErr] = useState('')

  function emit(nextImages, nextVideo, link) {
    const attachments = [
      ...nextImages.map((src) => ({ type: 'image', src })),
      ...(nextVideo ? [{ type: 'video', src: nextVideo }] : []),
      ...(link?.trim() ? [{ type: 'videoLink', href: link.trim() }] : []),
    ]
    onChange?.(attachments)
  }

  async function onPickImages(fileList) {
    const files = Array.from(fileList ?? []).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    setErr('')
    if (!isCloudinaryConfigured()) {
      setErr(cloudinaryConfigHint())
      return
    }
    setUploading(true)
    setProgress(0)
    try {
      const uploaded = await uploadFilesToCloudinary(files.slice(0, 8), {
        folder: 'ol-dat-academy/notices',
        onProgress: setProgress,
      })
      const urls = uploaded.map((u) => u.url)
      const next = [...images, ...urls]
      setImages(next)
      emit(next, video, videoLink)
    } catch (e) {
      setErr(e.message ?? '사진 업로드 실패')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  async function onPickVideo(file) {
    if (!file) return
    setErr('')
    if (!isCloudinaryConfigured()) {
      setErr(cloudinaryConfigHint())
      return
    }
    setUploading(true)
    setProgress(0)
    try {
      const result = await uploadToCloudinary(file, {
        folder: 'ol-dat-academy/notices',
        resourceType: 'video',
        onProgress: setProgress,
      })
      setVideo(result.url)
      setVideoLink('')
      emit(images, result.url, '')
    } catch (e) {
      setErr(e.message ?? '동영상 업로드 실패')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div>
      {err ? <p style={{ color: '#c62828', fontSize: '0.85rem' }}>{err}</p> : null}
      <UploadProgress percent={uploading ? progress : 0} label="미디어 업로드 중…" />

      <label className={ui.muted}>사진 (여러 장)</label>
      <label className={`${ui.btnGhost} ${ui.btnSm}`} style={{ display: 'block', textAlign: 'center', marginTop: 6, opacity: uploading || disabled ? 0.6 : 1 }}>
        갤러리에서 사진 선택
        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          disabled={uploading || disabled}
          onChange={(e) => {
            onPickImages(e.target.files)
            e.target.value = ''
          }}
        />
      </label>
      {images.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 10 }}>
          {images.map((src, i) => (
            <div key={src} style={{ position: 'relative' }}>
              <img src={src} alt="" style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', borderRadius: 10 }} />
              <button
                type="button"
                className={ui.btnGhost}
                style={{ position: 'absolute', top: 4, right: 4, padding: '2px 6px', fontSize: '0.65rem' }}
                disabled={disabled}
                onClick={() => {
                  const next = images.filter((_, j) => j !== i)
                  setImages(next)
                  emit(next, video, videoLink)
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <label className={ui.muted} style={{ display: 'block', marginTop: 14 }}>
        동영상 파일
      </label>
      <label className={`${ui.btnGhost} ${ui.btnSm}`} style={{ display: 'block', textAlign: 'center', marginTop: 6, opacity: uploading || disabled ? 0.6 : 1 }}>
        동영상 선택
        <input
          type="file"
          accept="video/*"
          hidden
          disabled={uploading || disabled}
          onChange={(e) => {
            onPickVideo(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </label>
      {video ? (
        <p className={ui.muted} style={{ marginTop: 8 }}>
          동영상 업로드 완료
          <button
            type="button"
            className={ui.btnGhost}
            style={{ marginLeft: 8 }}
            disabled={disabled}
            onClick={() => {
              setVideo(null)
              emit(images, null, videoLink)
            }}
          >
            제거
          </button>
        </p>
      ) : null}

      <label className={ui.muted} style={{ display: 'block', marginTop: 12 }}>
        또는 동영상 URL (YouTube 등)
      </label>
      <input
        className={ui.input}
        style={{ marginTop: 4 }}
        placeholder="https://..."
        value={videoLink}
        disabled={disabled || uploading || !!video}
        onChange={(e) => {
          setVideoLink(e.target.value)
          emit(images, video, e.target.value)
        }}
      />
    </div>
  )
}
