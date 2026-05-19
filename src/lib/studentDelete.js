export function canDeleteStudent(student, { mentorId, isSuperAdmin }) {
  if (!student) return false
  if (isSuperAdmin) return true
  return student.mentorId === mentorId
}

export function confirmDeleteStudent(student) {
  return window.confirm(
    `「${student.name}」 수강생과 연결된 학부모 계정(${student.parentLoginId})을 삭제할까요?\n\n` +
      `출결, 피드백, 포트폴리오, 멘토 메시지 등 모든 데이터가 영구 삭제되며 복구할 수 없습니다.`,
  )
}
