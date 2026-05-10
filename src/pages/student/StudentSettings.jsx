import { useState } from 'react'
import { StudentLayout } from '../../components/RoleLayout.jsx'
import ui from '../../components/ui.module.css'
import { useTheme } from '../../context/ThemeContext.jsx'
import { getNotificationPermission, requestNotificationPermission } from '../../lib/notifications.js'

export default function StudentSettings() {
  const { dark, setDark, accentId, setAccentId, palette } = useTheme()
  const [perm, setPerm] = useState(() => getNotificationPermission())
  const [busy, setBusy] = useState(false)

  async function enableNotify() {
    setBusy(true)
    const r = await requestNotificationPermission()
    setPerm(r)
    setBusy(false)
  }

  return (
    <StudentLayout title="설정">
      <section className={ui.card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>알림</div>
        <p className={ui.muted} style={{ marginTop: 0 }}>
          허용 시 수업 30분 전·새 공지를 브라우저 알림으로 받을 수 있습니다. (앱이 켜져 있을 때 가장 정확합니다.)
        </p>
        <div className={ui.row} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={ui.muted}>현재 권한: {perm === 'unsupported' ? '미지원' : perm}</span>
          {perm !== 'granted' && perm !== 'unsupported' ? (
            <button type="button" className={`${ui.btn} ${ui.btnSm}`} disabled={busy} onClick={enableNotify}>
              {busy ? '…' : '알림 허용'}
            </button>
          ) : null}
        </div>
      </section>
      <section className={ui.card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>다크 모드</div>
        <label className={ui.row} style={{ justifyContent: 'space-between' }}>
          <span className={ui.muted}>어두운 테마 사용</span>
          <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
        </label>
      </section>
      <section className={ui.card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>테마 색상</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {palette.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setAccentId(c.id)}
              style={{
                border: accentId === c.id ? '2px solid var(--text)' : '1px solid var(--border)',
                borderRadius: 12,
                padding: '10px 6px',
                background: c.hex,
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.72rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.35)',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className={ui.muted} style={{ marginBottom: 0, marginTop: 10 }}>
          기본 컬러는 핑크(#E91E8C)입니다. 선택한 색은 앱 전체 포인트 컬러로 적용됩니다.
        </p>
      </section>
    </StudentLayout>
  )
}
