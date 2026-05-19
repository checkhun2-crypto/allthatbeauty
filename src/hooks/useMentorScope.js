import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'

export function useMentorScope() {
  const { mentorId, isMentor } = useAuth()
  const { mentors, students } = useData()

  const currentMentor = useMemo(
    () => mentors.find((m) => m.id === mentorId) ?? null,
    [mentors, mentorId],
  )

  const myStudents = useMemo(() => {
    if (!isMentor || !mentorId) return []
    return students.filter((s) => s.mentorId === mentorId)
  }, [students, mentorId, isMentor])

  const isSuperAdmin = !!currentMentor?.isSuperAdmin

  return { currentMentor, myStudents, isSuperAdmin, mentorId }
}
