import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MentorLayout } from '../../components/RoleLayout.jsx'
import ui from '../../components/ui.module.css'
import { useData } from '../../context/DataContext.jsx'
import { ddayFrom, formatIsoDate } from '../../lib/nav.js'

export default function MentorSchedule() {
  const { events, addEvent, removeEvent, academy, applyCurriculumWithItems } = useData()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState('시험')
  const [curText, setCurText] = useState(() => academy.curriculumItems.join('\n'))

  useEffect(() => {
    setCurText(academy.curriculumItems.join('\n'))
  }, [academy.curriculumItems])

  return (
    <MentorLayout title="일정 · D-day">
      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          커리큘럼 자동 일정 배분
        </div>
        <p className={ui.muted} style={{ marginTop: 0 }}>
          한 줄에 하나씩 커리큘럼 항목을 입력하세요. 각 수강생의 <strong>시작일</strong>은 수강생 상세에서 설정한 뒤, 아래 버튼으로 주간 타임테이블에 자동 반영합니다.
        </p>
        <textarea
          className={ui.textarea}
          placeholder={'예:\n스킨 분석\n클렌징 실기\n베이스 메이크업\n색조 메이크업'}
          value={curText}
          onChange={(e) => setCurText(e.target.value)}
        />
        <button
          type="button"
          className={ui.btn}
          style={{ marginTop: 8, width: '100%' }}
          onClick={() => {
            const items = curText
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
            applyCurriculumWithItems(items)
          }}
        >
          커리큘럼 저장 및 전체 배분
        </button>
        {academy.curriculumItems.length ? (
          <p className={ui.muted} style={{ marginBottom: 0, marginTop: 8 }}>
            저장된 항목 {academy.curriculumItems.length}개 · 수강생 앱 타임테이블이 갱신됩니다.
          </p>
        ) : null}
      </section>

      <section className={ui.card}>
        <div className={ui.badge} style={{ marginBottom: 8 }}>
          일정 추가
        </div>
        <input className={ui.input} placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={ui.input} style={{ marginTop: 8 }} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <select className={ui.input} style={{ marginTop: 8 }} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="시험">시험</option>
          <option value="평가">평가</option>
          <option value="특강">특강</option>
          <option value="기타">기타</option>
        </select>
        <button
          type="button"
          className={ui.btn}
          style={{ width: '100%', marginTop: 10 }}
          onClick={() => {
            if (!title.trim() || !date) return
            addEvent({ id: `e_${Date.now()}`, title: title.trim(), date, type })
            setTitle('')
            setDate('')
          }}
        >
          추가
        </button>
      </section>

      {events.map((ev) => (
        <div key={ev.id} className={ui.card}>
          <div className={ui.row} style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{ev.title}</div>
              <div className={ui.muted}>
                {formatIsoDate(ev.date)} · {ev.type}
              </div>
            </div>
            <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem' }}>{ddayFrom(ev.date)}</div>
          </div>
          <button type="button" className={`${ui.btnGhost} ${ui.btnSm}`} style={{ marginTop: 8 }} onClick={() => removeEvent(ev.id)}>
            삭제
          </button>
        </div>
      ))}
      <Link to="/mentor/ranking" className={`${ui.btnGhost} ${ui.btnSm}`} style={{ display: 'inline-block', marginTop: 8 }}>
        랭킹 보기
      </Link>
    </MentorLayout>
  )
}
