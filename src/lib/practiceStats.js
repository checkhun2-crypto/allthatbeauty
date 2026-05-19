/** practiceSecondsByDate → LineChart용 월별 연습량(시간) */
export function monthlyPracticePoints(practiceSecondsByDate) {
  const byMonth = {}
  for (const [date, sec] of Object.entries(practiceSecondsByDate ?? {})) {
    const month = date.slice(0, 7)
    if (!/^\d{4}-\d{2}$/.test(month)) continue
    byMonth[month] = (byMonth[month] ?? 0) + (Number(sec) || 0)
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, seconds]) => ({
      label: month.slice(5),
      value: Math.round((seconds / 3600) * 10) / 10,
    }))
}
