import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { MENTOR_NAME } from '../data/seed.js'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { setMentor, setStudent } = useAuth()
  const { students } = useData()
  const nav = useNavigate()
  const [pick, setPick] = useState('')

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logo}>✦</div>
        <h1 className={styles.title}>올댓뷰티아카데미</h1>
        <p className={styles.sub}>멘토 {MENTOR_NAME} · 수강생 전용 앱</p>

        <button
          type="button"
          className={styles.btnPrimary}
          onClick={() => {
            setMentor()
            nav('/mentor/home')
          }}
        >
          멘토로 입장
        </button>

        <div className={styles.divider}>수강생</div>
        <select
          className={styles.select}
          value={pick}
          onChange={(e) => setPick(e.target.value)}
        >
          <option value="">이름을 선택하세요</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.course}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.btnSecondary}
          disabled={!pick}
          onClick={() => {
            setStudent(pick)
            nav('/student/home')
          }}
        >
          수강생으로 입장
        </button>
      </div>
    </div>
  )
}
