import { useEffect, useRef, useState } from 'react'
import ui from './ui.module.css'

function fmt(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function PracticeTimer({ studentId, addPracticeSeconds }) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startedAt = useRef(null)

  useEffect(() => {
    if (!running || !startedAt.current) return undefined
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000))
    }, 400)
    return () => clearInterval(id)
  }, [running])

  return (
    <div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', letterSpacing: '0.06em' }}>
        {fmt(elapsed)}
      </div>
      <div className={ui.row} style={{ gap: 8, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={ui.btn}
          disabled={running}
          onClick={() => {
            startedAt.current = Date.now()
            setElapsed(0)
            setRunning(true)
          }}
        >
          시작
        </button>
        <button
          type="button"
          className={ui.btnGhost}
          disabled={!running}
          onClick={() => {
            if (!startedAt.current) return
            const sec = Math.floor((Date.now() - startedAt.current) / 1000)
            startedAt.current = null
            setRunning(false)
            if (sec > 0) addPracticeSeconds(studentId, sec)
            setElapsed(0)
          }}
        >
          정지·기록
        </button>
        <button
          type="button"
          className={`${ui.btnGhost} ${ui.btnSm}`}
          onClick={() => {
            startedAt.current = null
            setRunning(false)
            setElapsed(0)
          }}
        >
          초기화
        </button>
      </div>
    </div>
  )
}
