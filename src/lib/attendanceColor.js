/** 출석률 구간: 높음(초록) / 중간(주황) / 낮음(빨강) */
export function attendanceRateTier(percent) {
  const p = Math.min(100, Math.max(0, Number(percent) || 0))
  if (p >= 80) return 'high'
  if (p >= 60) return 'mid'
  return 'low'
}
