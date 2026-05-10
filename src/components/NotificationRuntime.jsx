import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import {
  listenNewNotice,
  markReminderSent,
  notifyClassSoon,
  reminderKeyForSlot,
  wasReminderSent,
} from '../lib/notifications.js'

export function NotificationRuntime() {
  const { role, studentId } = useAuth()
  const { students } = useData()
  const lastPing = useRef({ title: '', at: 0 })

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return undefined
    navigator.serviceWorker.register('/sw.js').catch(() => {})
    return undefined
  }, [])

  useEffect(() => {
    const handler = (title) => {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/mentor')) return
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
      const now = Date.now()
      if (title === lastPing.current.title && now - lastPing.current.at < 2500) return
      lastPing.current = { title, at: now }
      try {
        if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: '새 공지',
            body: title,
          })
        } else {
          new Notification('새 공지', { body: title, icon: '/vite.svg' })
        }
      } catch {
        /* ignore */
      }
    }
    const offStorage = listenNewNotice(handler)
    const onWin = (e) => {
      const t = e.detail?.title
      if (t) handler(t)
    }
    window.addEventListener('academy-new-notice', onWin)
    return () => {
      offStorage()
      window.removeEventListener('academy-new-notice', onWin)
    }
  }, [])

  useEffect(() => {
    if (role !== 'student' || !studentId) return undefined
    if (typeof Notification === 'undefined') return undefined

    const dayNames = ['일', '월', '화', '수', '목', '금', '토']

    function todayClassStartsMs(timeStr) {
      const [hh, mm] = timeStr.split(':').map(Number)
      const d = new Date()
      d.setHours(hh, mm, 0, 0)
      return d.getTime()
    }

    const tick = () => {
      if (Notification.permission !== 'granted') return
      const me = students.find((s) => s.id === studentId)
      if (!me) return
      const dayName = dayNames[new Date().getDay()]
      const row = me.timetable.find((t) => t.day === dayName)
      if (!row) return
      for (const sl of row.slots) {
        const start = todayClassStartsMs(sl.time)
        const until = start - Date.now()
        if (until >= 25 * 60 * 1000 && until <= 35 * 60 * 1000) {
          const key = reminderKeyForSlot(me.id, dayName, sl.time, sl.subject)
          if (!wasReminderSent(key)) {
            notifyClassSoon(me.name, sl.subject, sl.time)
            markReminderSent(key)
          }
        }
      }
    }

    tick()
    const id = setInterval(tick, 45000)
    return () => clearInterval(id)
  }, [role, studentId, students])

  return null
}
