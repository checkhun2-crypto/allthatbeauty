import { attendanceRatePercent } from './rankings.js'

export function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** 누적 출석·지각·결석 기준 출석률(%) */
export function overallAttendanceRate(student) {
  return attendanceRatePercent(student)
}

/** 이번 달 출석률 — monthlyAttendance에서 현재 월, 없으면 최근 월 */
export function monthlyAttendanceRate(student, monthKey = currentMonthKey()) {
  const rows = student.monthlyAttendance ?? []
  const exact = rows.find((r) => r.month === monthKey)
  if (exact) {
    const rate = Number(exact.rate)
    return Number.isFinite(rate) ? Math.round(rate * 10) / 10 : overallAttendanceRate(student)
  }
  if (!rows.length) return overallAttendanceRate(student)
  const sorted = [...rows].sort((a, b) => a.month.localeCompare(b.month))
  const rate = Number(sorted[sorted.length - 1].rate)
  return Number.isFinite(rate) ? Math.round(rate * 10) / 10 : overallAttendanceRate(student)
}

export function formatMonthLabel(monthKey) {
  const [, m] = monthKey.split('-').map(Number)
  return `${m}월`
}
