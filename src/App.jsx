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
import MentorSettings from './pages/mentor/MentorSettings.jsx'
import StudentHome from './pages/student/StudentHome.jsx'
import StudentNotices from './pages/student/StudentNotices.jsx'
import StudentNoticeDetail from './pages/student/StudentNoticeDetail.jsx'
import StudentSettings from './pages/student/StudentSettings.jsx'
import StudentPractice from './pages/student/StudentPractice.jsx'
import StudentSchedule from './pages/student/StudentSchedule.jsx'
import ParentHome from './pages/parent/ParentHome.jsx'
import ParentNotices from './pages/parent/ParentNotices.jsx'
import ParentNoticeDetail from './pages/parent/ParentNoticeDetail.jsx'
import ParentMessages from './pages/parent/ParentMessages.jsx'
import ParentSettings from './pages/parent/ParentSettings.jsx'

function LoginRoute() {
  const { role, studentId, mentorId, ready } = useAuth()
  if (!ready) return null
  if (role === 'mentor' && mentorId) return <Navigate to="/mentor/home" replace />
  if (role === 'student' && studentId) return <Navigate to="/student/home" replace />
  if (role === 'parent' && studentId) return <Navigate to="/parent/home" replace />
  return <LoginPage />
}

function ProtectedRoute({ roleRequired, children }) {
  const { role, studentId, mentorId, ready } = useAuth()
  if (!ready) return null
  if (roleRequired === 'mentor' && (role !== 'mentor' || !mentorId)) return <Navigate to="/" replace />
  if (roleRequired === 'student' && (role !== 'student' || !studentId)) {
    return <Navigate to="/" replace />
  }
  if (roleRequired === 'parent' && (role !== 'parent' || !studentId)) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <>
      <NotificationRuntime />
      <Routes>
        <Route path="/" element={<LoginRoute />} />
      <Route
        path="/mentor/*"
        element={
          <ProtectedRoute roleRequired="mentor">
            <MentorRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/*"
        element={
          <ProtectedRoute roleRequired="student">
            <StudentRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/*"
        element={
          <ProtectedRoute roleRequired="parent">
            <ParentRoutes />
          </ProtectedRoute>
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
      <Route path="settings" element={<MentorSettings />} />
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

function ParentRoutes() {
  return (
    <Routes>
      <Route path="home" element={<ParentHome />} />
      <Route path="notices" element={<ParentNotices />} />
      <Route path="notices/:id" element={<ParentNoticeDetail />} />
      <Route path="messages" element={<ParentMessages />} />
      <Route path="settings" element={<ParentSettings />} />
      <Route path="*" element={<Navigate to="/parent/home" replace />} />
    </Routes>
  )
}
