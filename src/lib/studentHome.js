import { rankBy } from './rankings.js'

/** 중요 공지 우선, 없으면 최신 공지 */
export function featuredNotice(notices) {
  if (!notices?.length) return null
  const sorted = [...notices].sort((a, b) => b.createdAt - a.createdAt)
  const important = sorted.find((n) => n.important)
  return important ?? sorted[0]
}

export function myRankRow(students, studentId, getter, higherIsBetter = true) {
  const rows = rankBy(students, getter, higherIsBetter)
  return rows.find((r) => r.id === studentId) ?? null
}

export function upcomingExamEvents(events, limit = 3) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return events
    .filter((e) => (e.type === '시험' || e.type === '평가') && new Date(`${e.date}T00:00:00`) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit)
}
