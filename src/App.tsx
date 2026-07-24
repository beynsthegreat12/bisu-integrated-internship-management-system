import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from './hooks/useAuth'
import { Suspense, lazy } from 'react'
import { Spinner } from './components/ui/spinner'

// Layout
import DashboardLayout from './components/layout/DashboardLayout'

// Pages
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import NotFound from './pages/NotFound'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Register from './pages/Register'

// Dashboard pages (lazy loaded)
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const CoordinatorDashboard = lazy(() => import('./pages/coordinator/CoordinatorDashboard'))
const SupervisorDashboard = lazy(() => import('./pages/supervisor/SupervisorDashboard'))
const SippDashboard = lazy(() => import('./pages/sipp/SippDashboard'))

// Feature pages
const DTRPage = lazy(() => import('./pages/features/DTRPage'))
const ReportsPage = lazy(() => import('./pages/features/ReportsPage'))
const TasksPage = lazy(() => import('./pages/features/TasksPage'))
const EvaluationsPage = lazy(() => import('./pages/features/EvaluationsPage'))
const SiteVisitsPage = lazy(() => import('./pages/features/SiteVisitsPage'))
const MessagesPage = lazy(() => import('./pages/features/MessagesPage'))
const HTEsPage = lazy(() => import('./pages/features/HTEsPage'))
const AssignmentsPage = lazy(() => import('./pages/features/AssignmentsPage'))
const PullOutMonitoring = lazy(() => import('./pages/features/PullOutMonitoring'))
const RequirementsPage = lazy(() => import('./pages/features/RequirementsPage'))
const ProfilePage = lazy(() => import('./pages/features/ProfilePage'))
const UsersPage = lazy(() => import('./pages/features/UsersPage'))
const SettingsPage = lazy(() => import('./pages/features/SettingsPage'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="h-8 w-8" />
    </div>
  )
}

function RoleBasedRedirect() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <LoadingFallback />
  if (!user) return <Navigate to="/login" replace />
  
  switch (user.role) {
    case 'student':
      return <Navigate to="/student/dashboard" replace />
    case 'coordinator':
      return <Navigate to="/coordinator/dashboard" replace />
    case 'supervisor':
      return <Navigate to="/supervisor/dashboard" replace />
    case 'sipp_coordinator':
      return <Navigate to="/sipp/dashboard" replace />
    case 'admin':
      return <Navigate to="/coordinator/dashboard" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user, isLoading, isAuthenticated } = useAuth()
  
  if (isLoading) return <LoadingFallback />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user?.role || '')) return <Navigate to="/" replace />
  
  return <DashboardLayout>{children}</DashboardLayout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<RoleBasedRedirect />} />
      
      {/* Student Routes */}
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="dtr" element={<DTRPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="requirements" element={<RequirementsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Routes>
          </Suspense>
        </ProtectedRoute>
      } />
      
      {/* Coordinator Routes */}
      <Route path="/coordinator/*" element={
        <ProtectedRoute allowedRoles={['coordinator', 'admin', 'sipp_coordinator']}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="dashboard" element={<CoordinatorDashboard />} />
              <Route path="students" element={<AssignmentsPage />} />
              <Route path="dtr" element={<DTRPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="evaluations" element={<EvaluationsPage />} />
              <Route path="visits" element={<SiteVisitsPage />} />
              <Route path="htes" element={<HTEsPage />} />
              <Route path="pullouts" element={<PullOutMonitoring />} />
              <Route path="requirements" element={<RequirementsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Routes>
          </Suspense>
        </ProtectedRoute>
      } />
      
      {/* Supervisor Routes */}
      <Route path="/supervisor/*" element={
        <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="dashboard" element={<SupervisorDashboard />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="evaluations" element={<EvaluationsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Routes>
          </Suspense>
        </ProtectedRoute>
      } />
      
      {/* SIPP Routes */}
      <Route path="/sipp/*" element={
        <ProtectedRoute allowedRoles={['sipp_coordinator', 'admin']}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="dashboard" element={<SippDashboard />} />
              <Route path="students" element={<AssignmentsPage />} />
              <Route path="htes" element={<HTEsPage />} />
              <Route path="evaluations" element={<EvaluationsPage />} />
              <Route path="visits" element={<SiteVisitsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Routes>
          </Suspense>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}