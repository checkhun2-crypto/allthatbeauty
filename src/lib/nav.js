export const mentorNavItems = [
  { to: '/mentor/home', label: '홈', icon: '🏠' },
  { to: '/mentor/students', label: '수강생', icon: '👥' },
  { to: '/mentor/notices', label: '공지', icon: '📣' },
  { to: '/mentor/schedule', label: '일정', icon: '📅' },
  { to: '/mentor/ranking', label: '랭킹', icon: '🏆' },
]

export const studentNavItems = [
  { to: '/student/home', label: '홈', icon: '🏠' },
  { to: '/student/notices', label: '공지', icon: '📣' },
  { to: '/student/practice', label: '연습', icon: '⏱️' },
  { to: '/student/schedule', label: '내 일정', icon: '📅' },
  { to: '/student/settings', label: '설정', icon: '⚙️' },
]

export function formatTs(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function formatIsoDate(iso) {
  const [, m, day] = iso.split('-').map(Number)
  return `${m}월 ${day}일`
}

export function ddayFrom(iso) {
  const t = new Date(`${iso}T00:00:00`)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.round((t - now) / 86400000)
  if (diff === 0) return 'D-Day'
  if (diff > 0) return `D-${diff}`
  return `D+${Math.abs(diff)}`
}
