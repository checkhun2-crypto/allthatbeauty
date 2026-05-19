import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatIsoDate } from '../lib/nav.js'
import { groupByDateField } from '../lib/mediaGroups.js'
import { isCloudinaryConfigured, uploadFilesToCloudinary, cloudinaryConfigHint } from '../lib/cloudinary.js'
import UploadProgress from './UploadProgress.jsx'
import ui from './ui.module.css'
import styles from './MediaGallery.module.css'

/**
 * @param {object} props
 * @param {{ id: string, src: string, date?: string, note?: string }[]} props.items
 * @param {(id: string) => void} [props.onDelete]
 * @param {(uploaded: { url: string, publicId: string }[]) => void | Promise<void>} [props.onUploaded]
 * @param {boolean} [props.multiple]
 * @param {string} [props.uploadLabel]
 * @param {string} [props.cloudinaryFolder]
 * @param {boolean} [props.showNote]
 */
export default function MediaGallery({
  items = [],
  onDelete,
  onUploaded,
  multiple = true,
  uploadLabel = '사진 선택',
  cloudinaryFolder = 'ol-dat-academy',
  showNote = false,
  emptyText = '등록된 사진이 없습니다.',
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [err, setErr] = useState('')
  const [lightbox, setLightbox] = useState(null)

  const groups = useMemo(() => groupByDateField(items, 'date'), [items])

  async function handleFiles(fileList) {
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
      const uploaded = await uploadFilesToCloudinary(files, {
        folder: cloudinaryFolder,
        onProgress: (pct) => setProgress(pct),
      })
      await onUploaded?.(
        uploaded.map((u) => ({ url: u.url, publicId: u.publicId, resourceType: u.resourceType })),
      )
      setProgress(100)
    } catch (e) {
      setErr(e.message ?? '업로드에 실패했습니다.')
    } finally {
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 400)
    }
  }

  return (
    <div>
      {onUploaded ? (
        <div className={styles.uploadRow}>
          <label
            className={`${ui.btn} ${ui.btnSm}`}
            style={{
              display: 'inline-block',
              textAlign: 'center',
              opacity: uploading ? 0.6 : 1,
              pointerEvents: uploading ? 'none' : 'auto',
            }}
          >
            {uploading ? '업로드 중…' : uploadLabel}
            <input
              type="file"
              accept="image/*"
              multiple={multiple}
              hidden
              disabled={uploading}
              onChange={(e) => {
                handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </label>
          <UploadProgress percent={uploading ? progress : 0} />
        </div>
      ) : null}

      {err ? <p style={{ color: '#c62828', fontSize: '0.8rem', margin: '0 0 8px' }}>{err}</p> : null}

      {groups.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        groups.map(({ date, items: groupItems }) => (
          <section key={date} className={styles.dateGroup}>
            <h4 className={styles.dateHead}>
              {date === 'unknown' ? '날짜 없음' : formatIsoDate(date)} · {groupItems.length}장
            </h4>
            <div className={styles.grid}>
              {groupItems.map((item) => (
                <div key={item.id} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className={styles.thumbBtn}
                    onClick={() => setLightbox(item)}
                    aria-label="크게 보기"
                  >
                    <img src={item.src} alt="" loading="lazy" />
                  </button>
                  {onDelete ? (
                    <button
                      type="button"
                      className={styles.delBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(item.id)
                      }}
                    >
                      삭제
                    </button>
                  ) : null}
                  {showNote && item.note ? <p className={styles.note}>{item.note}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      {lightbox && typeof document !== 'undefined'
        ? createPortal(
            <div
              className={styles.lightbox}
              role="dialog"
              aria-modal="true"
              onClick={() => setLightbox(null)}
            >
              <button type="button" className={styles.lightboxClose} onClick={() => setLightbox(null)}>
                ×
              </button>
              <img
                className={styles.lightboxImg}
                src={lightbox.src}
                alt=""
                onClick={(e) => e.stopPropagation()}
              />
              {lightbox.note ? <p className={styles.lightboxCaption}>{lightbox.note}</p> : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
