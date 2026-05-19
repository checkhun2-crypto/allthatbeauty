import { useState } from 'react'
import ui from './ui.module.css'
import { validatePasswordChange } from '../lib/accounts.js'

export default function PasswordChangeForm({ onSubmit, hint }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const result = onSubmit(current, next, confirm)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setSuccess('비밀번호가 변경되었습니다.')
    setCurrent('')
    setNext('')
    setConfirm('')
  }

  return (
    <form onSubmit={handleSubmit}>
      {hint ? (
        <p className={ui.muted} style={{ marginTop: 0 }}>
          {hint}
        </p>
      ) : null}
      <label className={ui.muted} style={{ display: 'block', marginBottom: 4 }}>
        현재 비밀번호
      </label>
      <input
        className={ui.input}
        type="password"
        autoComplete="current-password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
      />
      <label className={ui.muted} style={{ display: 'block', margin: '10px 0 4px' }}>
        새 비밀번호
      </label>
      <input
        className={ui.input}
        type="password"
        autoComplete="new-password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
      />
      <label className={ui.muted} style={{ display: 'block', margin: '10px 0 4px' }}>
        새 비밀번호 확인
      </label>
      <input
        className={ui.input}
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      {error ? <p style={{ color: '#c62828', fontSize: '0.82rem', marginTop: 8 }}>{error}</p> : null}
      {success ? <p style={{ color: '#2e7d32', fontSize: '0.82rem', marginTop: 8 }}>{success}</p> : null}
      <button type="submit" className={ui.btn} style={{ width: '100%', marginTop: 10 }}>
        비밀번호 변경
      </button>
    </form>
  )
}

export function usePasswordChangeHandler(getActualPassword, changePassword) {
  return (current, next, confirm) => {
    const v = validatePasswordChange(current, next, confirm, getActualPassword())
    if (!v.ok) return v
    changePassword(next)
    return { ok: true }
  }
}
