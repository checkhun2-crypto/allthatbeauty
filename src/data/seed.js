export const MENTOR_NAME = '박성훈'

export const THEME_PALETTE = [
  { id: 'pink', label: '핑크', hex: '#E91E8C' },
  { id: 'rose', label: '로즈', hex: '#F06292' },
  { id: 'purple', label: '퍼플', hex: '#AB47BC' },
  { id: 'violet', label: '바이올렛', hex: '#7E57C2' },
  { id: 'indigo', label: '인디고', hex: '#5C6BC0' },
  { id: 'teal', label: '틸', hex: '#26A69A' },
  { id: 'coral', label: '코랄', hex: '#FF7043' },
  { id: 'gold', label: '골드', hex: '#FFB300' },
]

const weekSlots = [
  { day: '월', slots: [{ time: '10:00', subject: '스킨케어 기초' }, { time: '14:00', subject: '메이크업 실기' }] },
  { day: '화', slots: [{ time: '10:00', subject: '헤어 스타일링' }, { time: '15:00', subject: '포트폴리오' }] },
  { day: '수', slots: [{ time: '11:00', subject: '네일아트' }] },
  { day: '목', slots: [{ time: '10:00', subject: '메이크업 실기' }, { time: '13:00', subject: '현장 실습' }] },
  { day: '금', slots: [{ time: '10:00', subject: '종합 리뷰' }] },
]

export function buildInitialStudents() {
  return [
    {
      id: 's1',
      name: '김민지',
      course: '뷰티 마스터반',
      timetable: weekSlots,
      attendance: { present: 42, late: 2, absent: 1 },
      memo: '색조 메이크업 감각이 좋습니다. 속눈썹 연장 실기만 조금 더 연습하면 됩니다.',
      portfolio: ['https://picsum.photos/seed/s1a/400/400', 'https://picsum.photos/seed/s1b/400/400'],
      dailyResults: [],
      practiceSecondsByDate: { '2026-05-07': 1200, '2026-05-08': 900, '2026-05-09': 1500 },
      feedback: '이번 주 실기 평가 A-. 다음 주 시험 범위는 교재 3장까지입니다.',
    },
    {
      id: 's2',
      name: '이서연',
      course: '네일 전문반',
      timetable: weekSlots.map((d) => ({
        ...d,
        slots: d.slots.map((s) => ({ ...s, subject: s.subject.replace('메이크업', '네일') })),
      })),
      attendance: { present: 38, late: 1, absent: 0 },
      memo: '아트워크 섬세함이 돋보입니다.',
      portfolio: ['https://picsum.photos/seed/s2a/400/400'],
      dailyResults: [],
      practiceSecondsByDate: { '2026-05-05': 3600, '2026-05-06': 4200, '2026-05-09': 5400 },
      feedback: '젤 익스텐션 속도가 빨라졌습니다. 유지력 체크만 꾸준히 해주세요.',
    },
    {
      id: 's3',
      name: '박하은',
      course: '헤어 디자인반',
      timetable: weekSlots,
      attendance: { present: 40, late: 3, absent: 2 },
      memo: '펌 기법 이해도 높음. 상담 멘트 연습 필요.',
      portfolio: [],
      dailyResults: [],
      practiceSecondsByDate: { '2026-05-09': 600 },
      feedback: '드라이 스타일링 컬 보정에 집중하면 좋겠습니다.',
    },
  ]
}

export function buildInitialNotices() {
  const now = Date.now()
  return [
    {
      id: 'n1',
      title: '5월 실기 시험 일정 안내',
      body: '전 과정 수강생은 지정 시간에 도착해 주세요. 준비물은 개별 문자 참고.',
      author: MENTOR_NAME,
      createdAt: now - 86400000 * 2,
      attachments: [],
      comments: [
        { id: 'c1', author: '김민지', text: '확인했습니다!', at: now - 86400000 },
        { id: 'c2', author: MENTOR_NAME, text: '준비물 체크리스트는 오늘 중 업로드할게요.', at: now - 3600000 },
      ],
    },
    {
      id: 'n2',
      title: '뷰티 박람회 참관 신청',
      body: '희망자는 멘토에게 카카오톡 등으로 연락 주세요.',
      author: MENTOR_NAME,
      createdAt: now - 86400000 * 5,
      attachments: [],
      comments: [],
    },
  ]
}

export function buildInitialEvents() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const iso = (y, m, day) => `${y}-${pad(m)}-${pad(day)}`
  return [
    { id: 'e1', title: '메이크업 실기 시험', date: iso(d.getFullYear(), d.getMonth() + 1, d.getDate() + 7), type: '시험' },
    { id: 'e2', title: '중간 평가', date: iso(d.getFullYear(), d.getMonth() + 1, d.getDate() + 14), type: '평가' },
    { id: 'e3', title: '포트폴리오 제출', date: iso(d.getFullYear(), d.getMonth() + 2, 3), type: '평가' },
  ]
}

export function todayLabel() {
  const w = ['일', '월', '화', '수', '목', '금', '토']
  const d = new Date()
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${w[d.getDay()]})`
}

export function getTodaySlots(timetable) {
  const w = ['일', '월', '화', '수', '목', '금', '토']
  const dayName = w[new Date().getDay()]
  const row = timetable.find((t) => t.day === dayName)
  return row?.slots ?? []
}
