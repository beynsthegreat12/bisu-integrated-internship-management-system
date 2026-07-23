import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { Bell, Search, CheckCheck, Info, AlertCircle, CheckCircle2, XCircle, ArrowRight, Moon, Sun, Monitor } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { useTheme } from '@/providers/theme-provider'

const typeIcons: Record<string, any> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
}

const typeColors: Record<string, string> = {
  info: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  success: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
}

export default function Header({ user }: { user: any }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  const { data: notifCount, refetch: refetchCount } = trpc.notification.getUnreadCount.useQuery()
  const { data: notifList, refetch: refetchList } = trpc.notification.list.useQuery({ limit: 10 })
  const markAllMut = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => { refetchCount(); refetchList() },
  })
  const markReadMut = trpc.notification.markAsRead.useMutation({
    onSuccess: () => { refetchCount(); refetchList() },
  })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unreadCount = notifCount?.count || 0

  const themeIcons: Record<string, any> = { light: Sun, dark: Moon, system: Monitor }
  const ThemeIcon = themeIcons[theme] || Sun

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 transition-colors">
      <div className="flex items-center flex-1">
        <div className="relative max-w-md w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1F3A]/20 focus:border-[#7B1F3A] transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="w-5 h-5" />
          </button>

          {themeOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              {['light', 'dark', 'system'].map((t) => {
                const Icon = themeIcons[t]
                const labels: Record<string, string> = { light: 'Light', dark: 'Dark', system: 'System' }
                return (
                  <button
                    key={t}
                    onClick={() => { setTheme(t as any); setThemeOpen(false) }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                      theme === t
                        ? 'text-[#7B1F3A] dark:text-[#D4AF37] bg-[#7B1F3A]/5 dark:bg-[#7B1F3A]/10'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${t === 'light' ? 'rounded-t-lg' : ''} ${t === 'system' ? 'rounded-b-lg' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    {labels[t]}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-[#1A1A2E] dark:text-gray-100">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllMut.mutate()}
                    className="text-xs text-[#7B1F3A] dark:text-[#D4AF37] hover:text-[#9B2D4A] font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {(!notifList || notifList.length === 0) ? (
                  <div className="p-6 text-center text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifList.map((n) => {
                    const Icon = typeIcons[n.type] || Info
                    const color = typeColors[n.type] || typeColors.info
                    return (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-[#7B1F3A]/[0.02] dark:bg-[#7B1F3A]/[0.05]' : ''
                        }`}
                        onClick={() => {
                          if (!n.isRead) markReadMut.mutate({ id: n.id })
                          setNotifOpen(false)
                        }}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm ${!n.isRead ? 'font-semibold text-[#1A1A2E] dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
                                {n.title}
                              </p>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#7B1F3A] dark:bg-[#D4AF37] flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            {n.message && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                            )}
                            <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
                              {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {notifList && notifList.length > 0 && (
                <Link
                  to="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 text-xs text-[#7B1F3A] dark:text-[#D4AF37] hover:bg-gray-50 dark:hover:bg-gray-700 font-medium border-t border-gray-100 dark:border-gray-700"
                >
                  View all notifications <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#7B1F3A] dark:bg-[#9B2D4A] flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}