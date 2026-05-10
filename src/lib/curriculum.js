const dayOrder = ['월', '화', '수', '목', '금', '토', '일']

export function distributeCurriculum(weekRows, items, startDateIso) {
  if (!weekRows?.length || !items?.length) return weekRows
  const sorted = [...weekRows].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))
  let start = new Date()
  if (startDateIso) {
    const [y, m, d] = startDateIso.split('-').map(Number)
    start = new Date(y, m - 1, d)
  }
  const offset = Math.abs((start.getFullYear() * 366 + start.getMonth() * 31 + start.getDate()) % items.length)
  let i = 0
  return sorted.map((row) => ({
    ...row,
    slots: row.slots.map((sl) => {
      const label = items[(offset + i) % items.length]
      i += 1
      return { ...sl, subject: `${label}`, curriculumTag: true }
    }),
  }))
}
