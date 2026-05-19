import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  buildInitialEvents,
  buildInitialMentors,
  buildInitialNotices,
  buildInitialParentMessages,
  buildInitialStudents,
  defaultWeekTimetable,
  SUPER_MENTOR_ID,
} from '../data/seed'
import { DEFAULT_PASSWORD, mentorLoginIdFromName } from '../lib/accounts.js'
import { distributeCurriculum } from '../lib/curriculum.js'
import { normalizeMentors } from '../lib/mentorWork.js'
import { clearAuthSessionIfStudent } from '../lib/auth.js'
import { broadcastNewNotice } from '../lib/notifications.js'
import { normalizeStudents, todayIso } from '../lib/studentWork.js'

const STORAGE_KEY = 'ol-dat-beauty-academy-data-v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const saved = typeof window !== 'undefined' ? loadState() : null
  const [mentors, setMentors] = useState(() => normalizeMentors(saved?.mentors ?? buildInitialMentors()))
  const initialStudents = normalizeStudents(saved?.students ?? buildInitialStudents())
  const [students, setStudents] = useState(() => initialStudents)
  const [notices, setNotices] = useState(saved?.notices ?? buildInitialNotices())
  const [events, setEvents] = useState(saved?.events ?? buildInitialEvents())
  const [academy, setAcademy] = useState(() => saved?.academy ?? { curriculumItems: [] })
  const [aiChatsByStudent, setAiChatsByStudent] = useState(() => saved?.aiChatsByStudent ?? {})
  const [parentMessages, setParentMessages] = useState(
    () => saved?.parentMessages ?? buildInitialParentMessages(),
  )

  useEffect(() => {
    const payload = {
      mentors,
      students,
      notices,
      events,
      academy,
      aiChatsByStudent,
      parentMessages,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [mentors, students, notices, events, academy, aiChatsByStudent, parentMessages])

  const updateStudentMemo = useCallback((id, memo) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, memo } : s)))
  }, [])

  const updateStudentFeedback = useCallback((id, feedback) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, feedback } : s)))
  }, [])

  const updateStudentCurriculumStart = useCallback((id, isoDate) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, curriculumStartDate: isoDate } : s)))
  }, [])

  const setAcademyCurriculumItems = useCallback((items) => {
    setAcademy((a) => ({ ...a, curriculumItems: items }))
  }, [])

  const applyCurriculumWithItems = useCallback((itemsRaw) => {
    const items = (itemsRaw ?? []).map((t) => String(t).trim()).filter(Boolean)
    setAcademy((a) => ({ ...a, curriculumItems: items }))
    if (!items.length) return
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        timetable: distributeCurriculum(s.timetableBase, items, s.curriculumStartDate),
      })),
    )
  }, [])

  const applyCurriculumToAllStudents = useCallback(() => {
    applyCurriculumWithItems(academy.curriculumItems)
  }, [academy.curriculumItems, applyCurriculumWithItems])

  const addStudentPortfolioItem = useCallback((studentId, payload) => {
    const date = todayIso()
    const entry =
      typeof payload === 'string'
        ? { id: `pf_${Date.now()}`, src: payload, date }
        : {
            id: `pf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            date: payload.date ?? date,
            src: payload.src,
            cloudinaryPublicId: payload.cloudinaryPublicId,
          }
    setStudents((prev) =>
      prev.map((s) =>
        s.id !== studentId ? s : { ...s, portfolio: [...s.portfolio, entry].slice(-40) },
      ),
    )
  }, [])

  const addStudentPortfolioItems = useCallback((studentId, uploads) => {
    const date = todayIso()
    const entries = uploads.map((u, i) => ({
      id: `pf_${Date.now()}_${i}`,
      date,
      src: u.url,
      cloudinaryPublicId: u.publicId,
    }))
    setStudents((prev) =>
      prev.map((s) =>
        s.id !== studentId ? s : { ...s, portfolio: [...s.portfolio, ...entries].slice(-40) },
      ),
    )
  }, [])

  const removeStudentPortfolioItem = useCallback((studentId, itemId) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id !== studentId ? s : { ...s, portfolio: s.portfolio.filter((p) => p.id !== itemId) },
      ),
    )
  }, [])

  const addStudentDailyResult = useCallback((studentId, { src, note, cloudinaryPublicId }) => {
    const date = todayIso()
    const item = {
      id: `dr_${Date.now()}`,
      date,
      src,
      note: note?.trim() ?? '',
      cloudinaryPublicId,
    }
    setStudents((prev) =>
      prev.map((s) => (s.id !== studentId ? s : { ...s, dailyResults: [...s.dailyResults, item] })),
    )
  }, [])

  const addStudentDailyResults = useCallback((studentId, uploads, note = '') => {
    const date = todayIso()
    const trimmedNote = note?.trim() ?? ''
    const items = uploads.map((u, i) => ({
      id: `dr_${Date.now()}_${i}`,
      date,
      src: u.url,
      cloudinaryPublicId: u.publicId,
      note: i === 0 ? trimmedNote : '',
    }))
    setStudents((prev) =>
      prev.map((s) => (s.id !== studentId ? s : { ...s, dailyResults: [...s.dailyResults, ...items] })),
    )
  }, [])

  const removeStudentDailyResult = useCallback((studentId, itemId) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id !== studentId ? s : { ...s, dailyResults: s.dailyResults.filter((d) => d.id !== itemId) },
      ),
    )
  }, [])

  const addPracticeSeconds = useCallback((studentId, seconds) => {
    const n = Math.max(0, Math.floor(seconds))
    if (!n) return
    const date = todayIso()
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        const map = { ...(s.practiceSecondsByDate ?? {}) }
        map[date] = (map[date] ?? 0) + n
        return { ...s, practiceSecondsByDate: map }
      }),
    )
  }, [])

  const appendAiMessage = useCallback((studentId, role, content) => {
    const ts = Date.now()
    setAiChatsByStudent((prev) => {
      const cur = prev[studentId] ?? { messages: [] }
      return {
        ...prev,
        [studentId]: { messages: [...cur.messages, { role, content, ts }] },
      }
    })
  }, [])

  const clearAiChat = useCallback((studentId) => {
    setAiChatsByStudent((prev) => ({ ...prev, [studentId]: { messages: [] } }))
  }, [])

  const addNotice = useCallback((notice) => {
    setNotices((prev) => [notice, ...prev])
    if (typeof window !== 'undefined') {
      broadcastNewNotice(notice.title)
    }
  }, [])

  const addComment = useCallback((noticeId, comment) => {
    setNotices((prev) =>
      prev.map((n) =>
        n.id === noticeId ? { ...n, comments: [...n.comments, comment] } : n,
      ),
    )
  }, [])

  const addEvent = useCallback((ev) => {
    setEvents((prev) => [...prev, ev].sort((a, b) => a.date.localeCompare(b.date)))
  }, [])

  const removeEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const addStudent = useCallback((payload) => {
    const id = `s_${Date.now()}`
    const timetable = JSON.parse(JSON.stringify(defaultWeekTimetable))
    const student = normalizeStudents([
      {
        id,
        name: payload.name.trim(),
        mentorId: payload.mentorId || SUPER_MENTOR_ID,
        password: payload.password || DEFAULT_PASSWORD,
        parentPassword: DEFAULT_PASSWORD,
        portfolioPublicToParent: true,
        course: payload.course.trim() || '일반반',
        timetable,
        attendance: { present: 0, late: 0, absent: 0 },
        memo: '',
        feedback: '',
        portfolio: [],
        dailyResults: [],
        practiceSecondsByDate: {},
      },
    ])[0]
    setStudents((prev) => [...prev, student])
    return id
  }, [])

  const addMentor = useCallback(
    ({ name, password }) => {
      const trimmed = name.trim()
      if (!trimmed) return { ok: false, message: '멘토 이름을 입력해 주세요.' }
      const loginId = mentorLoginIdFromName(trimmed)
      if (mentors.some((m) => m.loginId === loginId)) {
        return { ok: false, message: '이미 존재하는 멘토 아이디입니다.' }
      }
      const mentor = normalizeMentors([
        {
          id: `m_${Date.now()}`,
          name: trimmed,
          loginId,
          password: password || DEFAULT_PASSWORD,
          isSuperAdmin: false,
        },
      ])[0]
      setMentors((prev) => [...prev, mentor])
      return { ok: true, mentor }
    },
    [mentors],
  )

  const removeMentor = useCallback((mentorId) => {
    setMentors((prev) => {
      const target = prev.find((m) => m.id === mentorId)
      if (!target || target.isSuperAdmin) return prev
      return prev.filter((m) => m.id !== mentorId)
    })
    setStudents((prev) => prev.filter((s) => s.mentorId !== mentorId))
  }, [])

  const updateMentorPassword = useCallback((mentorId, newPassword) => {
    setMentors((prev) =>
      prev.map((m) => (m.id === mentorId ? { ...m, password: newPassword } : m)),
    )
  }, [])

  const resetMentorPassword = useCallback((mentorId) => {
    setMentors((prev) =>
      prev.map((m) => (m.id === mentorId ? { ...m, password: DEFAULT_PASSWORD } : m)),
    )
  }, [])

  const updateStudentPassword = useCallback((studentId, newPassword) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, password: newPassword } : s)),
    )
  }, [])

  const resetStudentPassword = useCallback((studentId) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, password: DEFAULT_PASSWORD } : s)),
    )
  }, [])

  const resetParentPassword = useCallback((studentId) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, parentPassword: DEFAULT_PASSWORD } : s)),
    )
  }, [])

  const updateParentPassword = useCallback((studentId, newPassword) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, parentPassword: newPassword } : s)),
    )
  }, [])

  const setPortfolioPublicToParent = useCallback((studentId, value) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, portfolioPublicToParent: !!value } : s)),
    )
  }, [])

  const removeStudent = useCallback((studentId) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId))
    setParentMessages((prev) => prev.filter((m) => m.studentId !== studentId))
    setAiChatsByStudent((prev) => {
      if (!prev[studentId]) return prev
      const next = { ...prev }
      delete next[studentId]
      return next
    })
    clearAuthSessionIfStudent(studentId)
  }, [])

  const sendParentMessage = useCallback((studentId, { title, body }) => {
    const msg = {
      id: `pm_${Date.now()}`,
      studentId,
      title: title?.trim() || '멘토 안내',
      body: body.trim(),
      createdAt: Date.now(),
    }
    setParentMessages((prev) => [msg, ...prev])
    return msg
  }, [])

  const value = useMemo(
    () => ({
      mentors,
      students,
      notices,
      events,
      academy,
      aiChatsByStudent,
      parentMessages,
      updateStudentMemo,
      updateStudentFeedback,
      updateStudentCurriculumStart,
      setAcademyCurriculumItems,
      applyCurriculumWithItems,
      applyCurriculumToAllStudents,
      addStudentPortfolioItem,
      addStudentPortfolioItems,
      removeStudentPortfolioItem,
      addStudentDailyResult,
      addStudentDailyResults,
      removeStudentDailyResult,
      addPracticeSeconds,
      appendAiMessage,
      clearAiChat,
      addNotice,
      addComment,
      addEvent,
      removeEvent,
      addStudent,
      removeStudent,
      addMentor,
      removeMentor,
      updateMentorPassword,
      resetMentorPassword,
      updateStudentPassword,
      resetStudentPassword,
      resetParentPassword,
      updateParentPassword,
      setPortfolioPublicToParent,
      sendParentMessage,
    }),
    [
      mentors,
      students,
      notices,
      events,
      academy,
      aiChatsByStudent,
      parentMessages,
      updateStudentMemo,
      updateStudentFeedback,
      updateStudentCurriculumStart,
      setAcademyCurriculumItems,
      applyCurriculumWithItems,
      applyCurriculumToAllStudents,
      addStudentPortfolioItem,
      addStudentPortfolioItems,
      removeStudentPortfolioItem,
      addStudentDailyResult,
      addStudentDailyResults,
      removeStudentDailyResult,
      addPracticeSeconds,
      appendAiMessage,
      clearAiChat,
      addNotice,
      addComment,
      addEvent,
      removeEvent,
      addStudent,
      removeStudent,
      addMentor,
      removeMentor,
      updateMentorPassword,
      resetMentorPassword,
      updateStudentPassword,
      resetStudentPassword,
      resetParentPassword,
      updateParentPassword,
      setPortfolioPublicToParent,
      sendParentMessage,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData outside DataProvider')
  return ctx
}
