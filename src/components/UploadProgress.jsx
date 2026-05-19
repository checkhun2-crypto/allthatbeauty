import styles from './UploadProgress.module.css'

export default function UploadProgress({ percent, label = '업로드 중…' }) {
  const pct = Math.min(100, Math.max(0, Math.round(percent ?? 0)))
  if (pct <= 0) return null
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.label}>
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
