import { Bell, Search } from 'lucide-react'
import { trpc } from '@/providers/trpc'

export default function Header({ user }: { user: any }) {
  const { data: unreadCount } = trpc.message.getUnreadCount.useQuery()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center flex-1">
        <div className="relative max-w-md w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1F3A]/20 focus:border-[#7B1F3A]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount && unreadCount > 0 ? (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          ) : null}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#7B1F3A] flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
