import { DEFAULT_PASSWORD, mentorLoginIdFromName } from './accounts.js'

export function normalizeMentor(m) {
  const name = String(m.name ?? '').trim()
  const loginId = m.loginId?.trim() || mentorLoginIdFromName(name)
  return {
    ...m,
    name,
    loginId,
    password: m.password ?? DEFAULT_PASSWORD,
    isSuperAdmin: !!m.isSuperAdmin,
  }
}

export function normalizeMentors(list) {
  return list.map(normalizeMentor)
}

export function findMentorByLoginId(mentors, loginId) {
  const id = loginId.trim()
  return mentors.find((m) => m.loginId === id)
}
