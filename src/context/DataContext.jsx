import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  buildInitialEvents,
  buildInitialNotices,
  buildInitialStudents,
} from '../data/seed'
import { distributeCurriculum } from '../lib/curriculum.js'
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
  const initialStudents = normalizeStudents(saved?.students ?? buildInitialStudents())
  const [students, setStudents] = useState(() => initialStudents)
  const [notices, setNotices] = useState(saved?.notices ?? buildInitialNotices())
  const [events, setEvents] = useState(saved?.events ?? buildInitialEvents())
  const [academy, setAcademy] = useState(() => saved?.academy ?? { curriculumItems: [] })
  const [aiChatsByStudent, setAiChatsByStudent] = useState(() => saved?.aiChatsByStudent ?? {})

  useEffect(() => {
    const payload = {
      students,
      notices,
      events,
      academy,
      aiChatsByStudent,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [students, notices, events, academy, aiChatsByStudent])

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

  const addStudentPortfolioItem = useCallback((studentId, src) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id !== studentId
          ? s
          : {
              ...s,
              portfolio: [...s.portfolio, { id: `pf_${Date.now()}`, src }].slice(-20),
            },
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

  const addStudentDailyResult = useCallback((studentId, { src, note }) => {
    const date = todayIso()
    const item = { id: `dr_${Date.now()}`, date, src, note: note?.trim() ?? '' }
    setStudents((prev) =>
      prev.map((s) => (s.id !== studentId ? s : { ...s, dailyResults: [...s.dailyResults, item] })),
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

  const value = useMemo(
    () => ({
      students,
      notices,
      events,
      academy,
      aiChatsByStudent,
      updateStudentMemo,
      updateStudentFeedback,
      updateStudentCurriculumStart,
      setAcademyCurriculumItems,
      applyCurriculumWithItems,
      applyCurriculumToAllStudents,
      addStudentPortfolioItem,
      removeStudentPortfolioItem,
      addStudentDailyResult,
      removeStudentDailyResult,
      addPracticeSeconds,
      appendAiMessage,
      clearAiChat,
      addNotice,
      addComment,
      addEvent,
      removeEvent,
    }),
    [
      students,
      notices,
      events,
      academy,
      aiChatsByStudent,
      updateStudentMemo,
      updateStudentFeedback,
      updateStudentCurriculumStart,
      setAcademyCurriculumItems,
      applyCurriculumWithItems,
      applyCurriculumToAllStudents,
      addStudentPortfolioItem,
      removeStudentPortfolioItem,
      addStudentDailyResult,
      removeStudentDailyResult,
      addPracticeSeconds,
      appendAiMessage,
      clearAiChat,
      addNotice,
      addComment,
      addEvent,
      removeEvent,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData outside DataProvider')
  return ctx
}
