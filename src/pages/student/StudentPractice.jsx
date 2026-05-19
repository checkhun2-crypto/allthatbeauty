import { useMemo, useState } from 'react'
import { StudentLayout } from '../../components/RoleLayout.jsx'
import PracticeTimer from '../../components/PracticeTimer.jsx'
import MediaGallery from '../../components/MediaGallery.jsx'
import ui from '../../components/ui.module.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { fmtDur } from '../../lib/formatDuration.js'
import { formatIsoDate } from '../../lib/nav.js'
import { todayIso } from '../../lib/studentWork.js'

function DailyResultsSection({ items, onUploaded, onDelete }) {
  const [note, setNote] = useState('')
  return (
    <section className={ui.card}>
      <div className={ui.badge} style={{ marginBottom: 8 }}>
        오늘의 결과물
      </div>
      <p className={ui.muted} style={{ marginTop: 0 }}>
        오늘 수업·실습 결과 사진을 여러 장 선택해 올릴 수 있어요.
      </p>
      <textarea
        className={ui.textarea}
        style={{ minHeight: 64, marginBottom: 8 }}
        placeholder="한 줄 메모 (선택, 첫 사진에만 표시)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <MediaGallery
        items={items}
        multiple
        showNote
        uploadLabel="갤러리에서 사진 선택"
        cloudinaryFolder="ol-dat-academy/daily-results"
        emptyText="오늘 올린 결과물이 없습니다."
        onDelete={onDelete}
        onUploaded={async (uploads) => {
          await onUploaded(uploads, note)
          setNote('')
        }}
      />
    </section>
  )
}

export default function StudentPractice() {
  const { studentId } = useAuth()
  const {
    students,
    addPracticeSeconds,
    addStudentPortfolioItems,
    removeStudentPortfolioItem,
    addStudentDailyResults,
    removeStudentDailyResult,
  } = useData()
  const me = students.find((s) => s.id === studentId)

  const rows = useMemo(() => {
    if (!me) return []
    const o = me.practiceSecondsByDate ?? {}
    return Object.keys(o)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({ date, sec: o[date] || 0 }))
  }, [me])

  if (!me) {
    return (
      <StudentLayout title="연습">
        <p>프로필을 찾을 수 없습니다.</p>
      </StudentLayout>
    )
  }

  const iso = todayIso()
  const today = me.practiceSecondsByDate?.[iso] ?? 0
  const total = rows.reduce((a, r) => a + r.sec, 0)

  return (
    <StudentLayout title="연습">
      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          연습 타이머
        </div>
        <p className={ui.muted} style={{ marginTop: 0 }}>
          정지·기록 시 오늘 연습 시간에 합산됩니다.
        </p>
        <PracticeTimer studentId={me.id} addPracticeSeconds={addPracticeSeconds} />
        <p className={ui.muted} style={{ marginBottom: 0, marginTop: 10 }}>
          오늘 {fmtDur(today)} · 누적 {fmtDur(total)}
        </p>
      </section>

      <DailyResultsSection
        items={me.dailyResults}
        onUploaded={(uploads, note) => addStudentDailyResults(me.id, uploads, note)}
        onDelete={(id) => removeStudentDailyResult(me.id, id)}
      />

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          포트폴리오
        </div>
        <p className={ui.muted} style={{ marginTop: 0 }}>
          대표 작품·연습 사진을 날짜별로 모아 둡니다. 사진을 누르면 크게 볼 수 있어요.
        </p>
        <MediaGallery
          items={me.portfolio}
          multiple
          uploadLabel="갤러리에서 사진 선택"
          cloudinaryFolder="ol-dat-academy/portfolio"
          emptyText="아직 등록된 사진이 없습니다."
          onDelete={(id) => removeStudentPortfolioItem(me.id, id)}
          onUploaded={(uploads) => addStudentPortfolioItems(me.id, uploads)}
        />
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          멘토 피드백
        </div>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{me.feedback || '아직 피드백이 없습니다.'}</p>
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          날짜별 연습 기록
        </div>
        {rows.length === 0 ? (
          <p className={ui.muted}>기록이 없습니다.</p>
        ) : (
          rows.map((r) => (
            <div
              key={r.date}
              className={ui.row}
              style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}
            >
              <span>{formatIsoDate(r.date)}</span>
              <strong>{fmtDur(r.sec)}</strong>
            </div>
          ))
        )}
      </section>
    </StudentLayout>
  )
}
