import { Navigate, Route, Routes } from 'react-router-dom'
import { NotificationRuntime } from './components/NotificationRuntime.jsx'
import { useAuth } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MentorHome from './pages/mentor/MentorHome.jsx'
import MentorStudents from './pages/mentor/MentorStudents.jsx'
import MentorStudentDetail from './pages/mentor/MentorStudentDetail.jsx'
import MentorNotices from './pages/mentor/MentorNotices.jsx'
import MentorNoticeDetail from './pages/mentor/MentorNoticeDetail.jsx'
import MentorNoticeNew from './pages/mentor/MentorNoticeNew.jsx'
import MentorSchedule from './pages/mentor/MentorSchedule.jsx'
import MentorRanking from './pages/mentor/MentorRanking.jsx'
import StudentHome from './pages/student/StudentHome.jsx'
import StudentNotices from './pages/student/StudentNotices.jsx'
import StudentNoticeDetail from './pages/student/StudentNoticeDetail.jsx'
import StudentSettings from './pages/student/StudentSettings.jsx'
import StudentPractice from './pages/student/StudentPractice.jsx'
import StudentSchedule from './pages/student/StudentSchedule.jsx'

export default function App() {
  const { role, studentId } = useAuth()

  return (
    <>
      <NotificationRuntime />
      <Routes>
        <Route path="/" element={<LoginPage />} />
      <Route
        path="/mentor/*"
        element={
          role === 'mentor' ? <MentorRoutes /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/student/*"
        element={
          role === 'student' && studentId ? (
            <StudentRoutes />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

function MentorRoutes() {
  return (
    <Routes>
      <Route path="home" element={<MentorHome />} />
      <Route path="students" element={<MentorStudents />} />
      <Route path="students/:id" element={<MentorStudentDetail />} />
      <Route path="notices" element={<MentorNotices />} />
      <Route path="notices/new" element={<MentorNoticeNew />} />
      <Route path="notices/:id" element={<MentorNoticeDetail />} />
      <Route path="schedule" element={<MentorSchedule />} />
      <Route path="ranking" element={<MentorRanking />} />
      <Route path="*" element={<Navigate to="/mentor/home" replace />} />
    </Routes>
  )
}

function StudentRoutes() {
  return (
    <Routes>
      <Route path="home" element={<StudentHome />} />
      <Route path="notices" element={<StudentNotices />} />
      <Route path="notices/:id" element={<StudentNoticeDetail />} />
      <Route path="settings" element={<StudentSettings />} />
      <Route path="practice" element={<StudentPractice />} />
      <Route path="schedule" element={<StudentSchedule />} />
      <Route path="*" element={<Navigate to="/student/home" replace />} />
    </Routes>
  )
}
