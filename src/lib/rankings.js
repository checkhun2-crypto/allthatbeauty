export function attendanceRatePercent(s) {
  const a = s?.attendance ?? { present: 0, late: 0, absent: 0 }
  const t = (Number(a.present) || 0) + (Number(a.late) || 0) + (Number(a.absent) || 0)
  if (!t) return 0
  return Math.round((a.present / t) * 1000) / 10
}

export function totalPracticeSeconds(s) {
  const o = s.practiceSecondsByDate ?? {}
  return Object.values(o).reduce((acc, v) => acc + (Number(v) || 0), 0)
}

export function growthLastMonth(s) {
  const arr = [...(s.monthlyScores ?? [])].sort((a, b) => a.month.localeCompare(b.month))
  if (arr.length < 2) return 0
  return arr[arr.length - 1].score - arr[arr.length - 2].score
}

export function rankBy(students, getter, higherIsBetter = true) {
  const rows = students.map((s) => ({ id: s.id, name: s.name, value: getter(s) }))
  rows.sort((a, b) => (higherIsBetter ? b.value - a.value : a.value - b.value))
  return rows.map((r, i) => ({ ...r, rank: i + 1 }))
}

export function badgesForStudent(studentId, students) {
  const att = rankBy(students, attendanceRatePercent, true)
  const gr = rankBy(students, growthLastMonth, true)
  const pr = rankBy(students, totalPracticeSeconds, true)
  const out = []
  if (att[0]?.id === studentId) out.push({ key: 'attendance', label: '출석왕', emoji: '📌' })
  if (gr[0]?.id === studentId) out.push({ key: 'growth', label: '이달의 성장왕', emoji: '📈' })
  if (pr[0]?.id === studentId) out.push({ key: 'practice', label: '연습왕', emoji: '⏱️' })
  return out
}
