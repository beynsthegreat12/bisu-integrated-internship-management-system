import { Link, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  Clock,
  FileText,
  CheckSquare,
  ClipboardList,
  Calendar,
  Building2,
  Users,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  AlertTriangle,
  User,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const menuConfig: Record<string, Array<{ label: string; icon: React.ElementType; path: string }>> = {
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { label: 'Daily Time Record', icon: Clock, path: '/student/dtr' },
    { label: 'Accomplishment Reports', icon: FileText, path: '/student/reports' },
    { label: 'Tasks', icon: CheckSquare, path: '/student/tasks' },
    { label: 'Requirements', icon: ClipboardList, path: '/student/requirements' },
    { label: 'Profile', icon: User, path: '/student/profile' },
  ],
  coordinator: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/coordinator/dashboard' },
    { label: 'Students', icon: Users, path: '/coordinator/students' },
    { label: 'Daily Time Record', icon: Clock, path: '/coordinator/dtr' },
    { label: 'Reports', icon: FileText, path: '/coordinator/reports' },
    { label: 'Tasks', icon: CheckSquare, path: '/coordinator/tasks' },
    { label: 'Evaluations', icon: ClipboardList, path: '/coordinator/evaluations' },
    { label: 'Site Visits', icon: Calendar, path: '/coordinator/visits' },
    { label: 'HTE Partners', icon: Building2, path: '/coordinator/htes' },
    { label: 'Pull-Out Monitor', icon: AlertTriangle, path: '/coordinator/pullouts' },
    { label: 'Requirements', icon: ClipboardList, path: '/coordinator/requirements' },
    { label: 'Profile', icon: User, path: '/coordinator/profile' },
    { label: 'Settings', icon: Settings, path: '/coordinator/settings' },
  ],
  supervisor: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/supervisor/dashboard' },
    { label: 'Tasks', icon: CheckSquare, path: '/supervisor/tasks' },
    { label: 'Evaluations', icon: ClipboardList, path: '/supervisor/evaluations' },
    { label: 'Profile', icon: User, path: '/supervisor/profile' },
  ],
  sipp_coordinator: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/sipp/dashboard' },
    { label: 'Students', icon: Users, path: '/sipp/students' },
    { label: 'HTE Partners', icon: Building2, path: '/sipp/htes' },
    { label: 'Evaluations', icon: ClipboardList, path: '/sipp/evaluations' },
    { label: 'Site Visits', icon: Calendar, path: '/sipp/visits' },
    { label: 'Profile', icon: User, path: '/sipp/profile' },
    { label: 'Settings', icon: Settings, path: '/sipp/settings' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/coordinator/dashboard' },
    { label: 'Students', icon: Users, path: '/coordinator/students' },
    { label: 'Daily Time Record', icon: Clock, path: '/coordinator/dtr' },
    { label: 'Reports', icon: FileText, path: '/coordinator/reports' },
    { label: 'Tasks', icon: CheckSquare, path: '/coordinator/tasks' },
    { label: 'Evaluations', icon: ClipboardList, path: '/coordinator/evaluations' },
    { label: 'Site Visits', icon: Calendar, path: '/coordinator/visits' },
    { label: 'HTE Partners', icon: Building2, path: '/coordinator/htes' },
    { label: 'Users', icon: Settings, path: '/coordinator/users' },
    { label: 'Profile', icon: User, path: '/coordinator/profile' },
    { label: 'Settings', icon: Settings, path: '/coordinator/settings' },
  ],
}

export default function Sidebar({ user }: { user: any }) {
  const location = useLocation()
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const menuItems = menuConfig[user.role] || menuConfig.student
  const roleLabel = user.role === 'sipp_coordinator' ? 'SIPP Coordinator' : user.role.charAt(0).toUpperCase() + user.role.slice(1)

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 rounded-lg bg-[#7B1F3A] dark:bg-[#9B2D4A] flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <h1 className="text-sm font-bold text-[#1A1A2E] dark:text-gray-100 truncate">BISU Internship</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Management System</p>
          </div>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {(() => {
              const hour = new Date().getHours()
              if (hour < 12) return 'Good Morning'
              if (hour < 18) return 'Good Afternoon'
              return 'Good Evening'
            })()}
          </p>
          <p className="text-sm font-semibold text-[#1A1A2E] dark:text-gray-100 truncate">{roleLabel}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#7B1F3A]/10 dark:bg-[#7B1F3A]/20 text-[#7B1F3A] dark:text-[#D4AF37] border-l-2 border-[#7B1F3A] dark:border-[#D4AF37]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#7B1F3A] dark:text-[#D4AF37]' : ''}`} />
              {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-2 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden sm:flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="ml-3">Collapse</span>}
        </button>
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 sm:hidden p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out sm:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-2">
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {sidebarContent}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden sm:flex bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-col transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}