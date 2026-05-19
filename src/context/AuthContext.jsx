import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  clearAuthStorage,
  loadAuthSession,
  saveAuthSession,
  verifyMentorLogin,
  verifyParentLogin,
  verifyStudentLogin,
} from '../lib/auth.js'
import { SUPER_MENTOR_ID } from '../data/seed.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const initial = loadAuthSession()
  const [role, setRole] = useState(initial.role)
  const [mentorId, setMentorId] = useState(initial.mentorId ?? SUPER_MENTOR_ID)
  const [studentId, setStudentId] = useState(initial.studentId)
  const [rememberMe, setRememberMe] = useState(initial.remember)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  const loginMentor = useCallback((loginId, password, mentors, { remember = false } = {}) => {
    const mentor = verifyMentorLogin(loginId, password, mentors)
    if (!mentor) return false
    setRole('mentor')
    setMentorId(mentor.id)
    setStudentId(null)
    setRememberMe(remember)
    saveAuthSession(
      { role: 'mentor', mentorId: mentor.id, studentId: null },
      {
        remember,
        credentials: { tab: 'mentor', loginId, password },
      },
    )
    return true
  }, [])

  const loginStudent = useCallback((loginId, password, students, { remember = false } = {}) => {
    const student = verifyStudentLogin(students, loginId, password)
    if (!student) return false
    setRole('student')
    setStudentId(student.id)
    setMentorId(null)
    setRememberMe(remember)
    saveAuthSession(
      { role: 'student', mentorId: null, studentId: student.id },
      {
        remember,
        credentials: { tab: 'student', loginId, password },
      },
    )
    return true
  }, [])

  const loginParent = useCallback((loginId, password, students, { remember = false } = {}) => {
    const student = verifyParentLogin(students, loginId, password)
    if (!student) return false
    setRole('parent')
    setStudentId(student.id)
    setMentorId(null)
    setRememberMe(remember)
    saveAuthSession(
      { role: 'parent', mentorId: null, studentId: student.id },
      {
        remember,
        credentials: { tab: 'parent', loginId, password },
      },
    )
    return true
  }, [])

  const logout = useCallback(() => {
    setRole(null)
    setMentorId(null)
    setStudentId(null)
    setRememberMe(false)
    clearAuthStorage()
  }, [])

  const value = useMemo(
    () => ({
      role,
      mentorId,
      studentId,
      ready,
      loginMentor,
      loginStudent,
      loginParent,
      logout,
      rememberMe,
      isMentor: role === 'mentor' && !!mentorId,
      isStudent: role === 'student' && !!studentId,
      isParent: role === 'parent' && !!studentId,
    }),
    [role, mentorId, studentId, ready, rememberMe, loginMentor, loginStudent, loginParent, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
