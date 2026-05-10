function defaultMonthlyScores(seed) {
  const base = seed === 's1' ? 78 : seed === 's2' ? 70 : 74
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05']
  return months.map((month, i) => ({ month, score: Math.min(100, base + i * 3 + (seed === 's2' ? 1 : 0)) }))
}

function defaultMonthlyAttendance(seed) {
  const base = seed === 's1' ? 90 : seed === 's2' ? 94 : 86
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05']
  return months.map((month, i) => ({ month, rate: Math.min(100, base + i - (seed === 's3' ? 2 : 0)) }))
}

export function normalizeStudent(s) {
  const portfolio = (s.portfolio ?? []).map((p, idx) => {
    if (typeof p === 'string') return { id: `legacy_${s.id}_${idx}`, src: p }
    return { id: p.id ?? `p_${s.id}_${idx}`, src: p.src }
  })
  const dailyResults = Array.isArray(s.dailyResults) ? s.dailyResults : []
  const timetable = Array.isArray(s.timetable) ? s.timetable : []
  const timetableBase =
    s.timetableBase && Array.isArray(s.timetableBase) && s.timetableBase.length
      ? s.timetableBase
      : JSON.parse(JSON.stringify(timetable.length ? timetable : []))
  const monthlyScores =
    Array.isArray(s.monthlyScores) && s.monthlyScores.length ? s.monthlyScores : defaultMonthlyScores(s.id)
  const monthlyAttendance =
    Array.isArray(s.monthlyAttendance) && s.monthlyAttendance.length
      ? s.monthlyAttendance
      : defaultMonthlyAttendance(s.id)
  const practiceSecondsByDate =
    s.practiceSecondsByDate && typeof s.practiceSecondsByDate === 'object' ? s.practiceSecondsByDate : {}
  const curriculumStartDate = s.curriculumStartDate || '2026-05-01'
  return {
    ...s,
    portfolio,
    dailyResults,
    timetable,
    timetableBase,
    monthlyScores,
    monthlyAttendance,
    practiceSecondsByDate,
    curriculumStartDate,
  }
}

export function normalizeStudents(list) {
  return list.map(normalizeStudent)
}

export function todayIso() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function readImageDataUrl(file, maxBytes) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('이미지 파일만 업로드할 수 있습니다.'))
      return
    }
    if (file.size > maxBytes) {
      reject(new Error('파일이 너무 큽니다. 더 작은 사진을 선택해 주세요.'))
      return
    }
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(new Error('읽기 실패'))
    r.readAsDataURL(file)
  })
}
