/** 날짜(YYYY-MM-DD) 기준 내림차순 그룹 */
export function groupByDateField(items, dateKey = 'date') {
  const map = new Map()
  for (const item of items) {
    const date = item[dateKey] ?? 'unknown'
    if (!map.has(date)) map.set(date, [])
    map.get(date).push(item)
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, groupItems]) => ({
      date,
      items: groupItems.sort((a, b) => (b.id ?? '').localeCompare(a.id ?? '')),
    }))
}
