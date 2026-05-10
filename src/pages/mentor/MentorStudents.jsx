import { Link } from 'react-router-dom'
import { MentorLayout } from '../../components/RoleLayout.jsx'
import ui from '../../components/ui.module.css'
import { useData } from '../../context/DataContext.jsx'

export default function MentorStudents() {
  const { students } = useData()
  return (
    <MentorLayout title="수강생">
      {students.map((s) => {
        const sum = s.attendance.present + s.attendance.late + s.attendance.absent
        const r = sum ? Math.round((s.attendance.present / sum) * 1000) / 10 : 0
        return (
          <Link key={s.id} to={`/mentor/students/${s.id}`} className={ui.card} style={{ display: 'block' }}>
            <div style={{ fontWeight: 700 }}>{s.name}</div>
            <div className={ui.muted}>{s.course}</div>
            <div style={{ marginTop: 8 }} className={ui.row}>
              <span className={ui.chip}>출석률 {r}%</span>
              <span className={ui.chip}>지각 {s.attendance.late}</span>
            </div>
          </Link>
        )
      })}
    </MentorLayout>
  )
}
