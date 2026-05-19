export const DEFAULT_PASSWORD = '1234'

export function studentLoginId(name) {
  return String(name ?? '').trim()
}

export function parentLoginIdFromName(name) {
  const n = String(name ?? '').trim()
  return n ? `${n}부모` : ''
}

export function mentorLoginIdFromName(name) {
  const n = String(name ?? '').trim()
  return n ? `${n}멘토` : ''
}

export function validatePasswordChange(current, next, confirm, actualCurrent) {
  if (!current || !next || !confirm) {
    return { ok: false, message: '모든 비밀번호 항목을 입력해 주세요.' }
  }
  if (current !== actualCurrent) {
    return { ok: false, message: '현재 비밀번호가 올바르지 않아요.' }
  }
  if (next.length < 4) {
    return { ok: false, message: '새 비밀번호는 4자 이상이어야 해요.' }
  }
  if (next !== confirm) {
    return { ok: false, message: '새 비밀번호 확인이 일치하지 않아요.' }
  }
  return { ok: true }
}
