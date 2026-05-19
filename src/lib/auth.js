import { SUPER_MENTOR_ID } from '../data/seed.js'

export const AUTH_STORAGE_KEY = 'ol-dat-beauty-academy-auth-v1'

const EMPTY_SESSION = {
  role: null,
  mentorId: null,
  studentId: null,
  remember: false,
  credentials: null,
}

function readStoredSession(storage) {
  try {
    const raw = storage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.role === 'mentor') {
      return {
        role: 'mentor',
        mentorId: parsed.mentorId ?? SUPER_MENTOR_ID,
        studentId: null,
        remember: parsed.remember !== false,
        credentials: parsed.credentials ?? null,
      }
    }
    if (parsed?.role === 'student' && parsed?.studentId) {
      return {
        role: 'student',
        mentorId: null,
        studentId: parsed.studentId,
        remember: parsed.remember !== false,
        credentials: parsed.credentials ?? null,
      }
    }
    if (parsed?.role === 'parent' && parsed?.studentId) {
      return {
        role: 'parent',
        mentorId: null,
        studentId: parsed.studentId,
        remember: parsed.remember !== false,
        credentials: parsed.credentials ?? null,
      }
    }
    return null
  } catch {
    return null
  }
}

export function loadAuthSession() {
  const fromLocal = readStoredSession(localStorage)
  if (fromLocal?.remember) return fromLocal
  const fromSession = readStoredSession(sessionStorage)
  if (fromSession) return fromSession
  return EMPTY_SESSION
}

export function saveAuthSession(session, { remember = false, credentials = null } = {}) {
  if (!session?.role) {
    clearAuthStorage()
    return
  }
  const payload = {
    role: session.role,
    mentorId: session.role === 'mentor' ? session.mentorId : null,
    studentId: session.studentId ?? null,
    remember,
    credentials: remember ? credentials : null,
  }
  if (remember) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
  } else {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...payload, remember: false }))
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

export function clearAuthStorage() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}

/** 삭제된 수강생·학부모가 로그인 중이면 세션 제거 */
export function clearAuthSessionIfStudent(studentId) {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const raw = storage.getItem(AUTH_STORAGE_KEY)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      const match =
        (parsed.role === 'student' && parsed.studentId === studentId) ||
        (parsed.role === 'parent' && parsed.studentId === studentId)
      if (match) storage.removeItem(AUTH_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }
}

export function verifyMentorLogin(loginId, password, mentors) {
  const mentor = mentors.find((m) => m.loginId === loginId.trim())
  if (!mentor) return null
  if (password !== mentor.password) return null
  return mentor
}

export function verifyStudentLogin(students, loginId, password) {
  const id = loginId.trim()
  const student = students.find((s) => s.loginId === id || s.name === id)
  if (!student) return null
  if (password !== (student.password ?? '1234')) return null
  return student
}

export function verifyParentLogin(students, loginId, password) {
  const id = loginId.trim()
  const student = students.find((s) => s.parentLoginId === id)
  if (!student) return null
  if (password !== (student.parentPassword ?? '1234')) return null
  return student
}
