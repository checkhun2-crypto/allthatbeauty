import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null)
  const [studentId, setStudentId] = useState(null)

  const value = useMemo(
    () => ({
      role,
      studentId,
      setMentor: () => {
        setRole('mentor')
        setStudentId(null)
      },
      setStudent: (id) => {
        setRole('student')
        setStudentId(id)
      },
      logout: () => {
        setRole(null)
        setStudentId(null)
      },
    }),
    [role, studentId],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
