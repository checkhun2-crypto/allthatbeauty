import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { loadAuthSession } from '../lib/auth.js'
import styles from './LoginPage.module.css'

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`

function LoginLogo() {
  const [logoFailed, setLogoFailed] = useState(false)

  if (logoFailed) {
    return (
      <div
        className={styles.logoFallback}
        role="img"
        aria-label="올댓뷰티아카데미"
      >
        ✦
      </div>
    )
  }

  return (
    <img
      src={LOGO_SRC}
      alt="올댓뷰티아카데미"
      className={styles.logo}
      width={240}
      height={72}
      onError={() => setLogoFailed(true)}
    />
  )
}

function tabClass(tab, current) {
  if (tab !== current) return styles.tab
  if (tab === 'parent') return styles.tabParentActive
  return styles.tabActive
}

function RememberLoginRow({ checked, onChange }) {
  return (
    <label className={styles.rememberRow}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>로그인 상태 유지</span>
    </label>
  )
}

export default function LoginPage() {
  const { loginMentor, loginStudent, loginParent } = useAuth()
  const { students, mentors } = useData()
  const nav = useNavigate()

  const [tab, setTab] = useState('mentor')
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPwHelp, setShowPwHelp] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)

  useEffect(() => {
    const saved = loadAuthSession()
    if (saved.remember) setKeepLoggedIn(true)
    const c = saved.credentials
    if (!c) return
    if (c.tab) setTab(c.tab)
    if (c.loginId != null) setLoginId(c.loginId)
    if (c.password != null) setPassword(c.password)
  }, [])

  function clearError() {
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    clearError()
    const opts = { remember: keepLoggedIn }
    if (tab === 'mentor') {
      if (loginMentor(loginId, password, mentors, opts)) {
        nav('/mentor/home')
        return
      }
    } else if (tab === 'student') {
      if (loginStudent(loginId, password, students, opts)) {
        nav('/student/home')
        return
      }
    } else if (tab === 'parent') {
      if (loginParent(loginId, password, students, opts)) {
        nav('/parent/home')
        return
      }
    }
    setError('아이디 또는 비밀번호가 올바르지 않아요.')
  }

  const idPlaceholder =
    tab === 'mentor' ? '박성훈멘토' : tab === 'student' ? '김민지' : '김민지부모'

  return (
    <div className={styles.page}>
      <div className={styles.blob} aria-hidden />
      <div className={styles.blob2} aria-hidden />
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.logoWrap}>
            <LoginLogo />
          </div>
          <p className={styles.sub}>멘토 · 수강생 · 학부모 로그인</p>

          <div className={styles.tabs}>
            <button
              type="button"
              className={tabClass('mentor', tab)}
              onClick={() => {
                setTab('mentor')
                clearError()
              }}
            >
              멘토
            </button>
            <button
              type="button"
              className={tabClass('student', tab)}
              onClick={() => {
                setTab('student')
                clearError()
              }}
            >
              수강생
            </button>
            <button
              type="button"
              className={tabClass('parent', tab)}
              onClick={() => {
                setTab('parent')
                clearError()
              }}
            >
              학부모
            </button>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              아이디
              <input
                className={styles.input}
                type="text"
                autoComplete="username"
                placeholder={idPlaceholder}
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
            </label>
            <p className={styles.idHint}>
              {tab === 'mentor' && '이름+멘토 (예: 박성훈멘토)'}
              {tab === 'student' && '수강생 한글 이름 (예: 김민지)'}
              {tab === 'parent' && '자녀이름+부모 (예: 김민지부모)'}
            </p>
            <label className={styles.label}>
              비밀번호
              <input
                className={styles.input}
                type="password"
                autoComplete="current-password"
                placeholder="••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <RememberLoginRow checked={keepLoggedIn} onChange={setKeepLoggedIn} />
            <button type="submit" className={styles.btnPrimary}>
              로그인
            </button>
          </form>

          <button type="button" className={styles.forgotBtn} onClick={() => setShowPwHelp(true)}>
            아이디 · 비밀번호 안내
          </button>
        </div>
      </div>

      {showPwHelp ? (
        <div className={styles.modalBackdrop} onClick={() => setShowPwHelp(false)} role="presentation">
          <div
            className={styles.modal}
            role="dialog"
            aria-labelledby="pw-help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="pw-help-title" className={styles.modalTitle}>
              아이디 · 비밀번호 안내
            </h2>
            <p className={styles.modalText}>
              <strong>멘토</strong>: 이름+멘토 (예: 박성훈멘토)
              <br />
              <strong>수강생</strong>: 한글 이름 (예: 김민지, 이서연)
              <br />
              <strong>학부모</strong>: 자녀이름+부모 (예: 김민지부모)
            </p>
            <p className={styles.modalText}>
              비밀번호를 잊으셨다면 담당 멘토에게 문의해 주세요. 멘토가 초기 비밀번호(1234)로 재설정할 수
              있습니다.
            </p>
            <p className={styles.modalHint}>
              체험용 초기 비밀번호: <strong>1234</strong>
            </p>
            <button type="button" className={styles.btnPrimary} onClick={() => setShowPwHelp(false)}>
              확인
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
