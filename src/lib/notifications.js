const PING_KEY = 'ol-dat-academy-notice-ping'
const REM_PREFIX = 'ol-dat-class-reminder-'

export function getNotificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  const r = await Notification.requestPermission()
  return r
}

function showBrowserNotification(title, body) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  try {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
      })
      return
    }
  } catch {
    /* fall through */
  }
  try {
    new Notification(title, { body, icon: '/vite.svg' })
  } catch {
    /* ignore */
  }
}

export function broadcastNewNotice(title) {
  const payload = JSON.stringify({ t: Date.now(), title })
  try {
    localStorage.setItem(PING_KEY, payload)
  } catch {
    /* ignore */
  }
  try {
    const ch = new BroadcastChannel('ol-dat-academy')
    ch.postMessage({ type: 'notice', title })
    ch.close()
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent('academy-new-notice', { detail: { title } }))
  } catch {
    /* ignore */
  }
}

export function listenNewNotice(callback) {
  const onStorage = (e) => {
    if (e.key !== PING_KEY || !e.newValue) return
    try {
      const { title } = JSON.parse(e.newValue)
      if (title) callback(title)
    } catch {
      /* ignore */
    }
  }
  window.addEventListener('storage', onStorage)
  let bc
  try {
    bc = new BroadcastChannel('ol-dat-academy')
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'notice' && ev.data.title) callback(ev.data.title)
    }
  } catch {
    /* ignore */
  }
  return () => {
    window.removeEventListener('storage', onStorage)
    try {
      bc?.close()
    } catch {
      /* ignore */
    }
  }
}

export function notifyClassSoon(studentName, subject, timeLabel) {
  const title = '수업 알림 (30분 전)'
  const body = `${studentName}님 · ${timeLabel} ${subject}`
  showBrowserNotification(title, body)
}

export function reminderKeyForSlot(studentId, dayName, time, subject) {
  return `${REM_PREFIX}${studentId}_${dayName}_${time}_${subject}`.replace(/\s+/g, '_')
}

export function wasReminderSent(key) {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

export function markReminderSent(key) {
  try {
    sessionStorage.setItem(key, '1')
  } catch {
    /* ignore */
  }
}
