import ui from './ui.module.css'
import { confirmDeleteStudent } from '../lib/studentDelete.js'

export default function DeleteStudentButton({ student, onDelete, className = '', size = 'default', style }) {
  function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirmDeleteStudent(student)) return
    onDelete(student.id)
  }

  const sizeClass = size === 'sm' ? ui.btnDeleteSm : ''

  return (
    <button
      type="button"
      className={`${ui.btnDelete} ${sizeClass} ${className}`.trim()}
      style={style}
      onClick={handleClick}
    >
      삭제
    </button>
  )
}
