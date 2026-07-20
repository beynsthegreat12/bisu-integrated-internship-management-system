import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  FileText,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const { data: tasks } = trpc.task.list.useQuery({})
  const { data: reports } = trpc.report.list.useQuery({})
  const { data: attendanceSummary } = trpc.attendance.getSummary.useQuery({
    month: new Date().toISOString().slice(0, 7),
  })

  const pendingTasks = tasks?.filter(t => t.status === 'pending' || t.status === 'in_progress') || []
  const recentReports = reports?.slice(0, 5) || []

  const stats = [
    {
      label: 'Hours This Month',
      value: attendanceSummary?.totalHours?.toFixed(1) || '0',
      icon: Clock,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Pending Tasks',
      value: String(pendingTasks.length),
      icon: CheckSquare,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Reports Submitted',
      value: String(reports?.length || 0),
      icon: FileText,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Attendance Days',
      value: String(attendanceSummary?.totalDays || 0),
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  const quickActions = [
    { label: 'Log DTR', path: '/student/dtr', icon: Clock, color: 'bg-[#7B1F3A] hover:bg-[#7B1F3A]/90' },
    { label: 'Submit Report', path: '/student/reports', icon: FileText, color: 'bg-[#D4A843] hover:bg-[#D4A843]/90' },
    { label: 'View Tasks', path: '/student/tasks', icon: CheckSquare, color: 'bg-gray-800 hover:bg-gray-700' },
    { label: 'Messages', path: '/student/messages', icon: MessageSquare, color: 'bg-blue-600 hover:bg-blue-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Welcome, {user?.name || 'Student'}!</h1>
        <p className="text-gray-500 mt-1">Here's your internship progress overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#1A1A2E] mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link key={action.path} to={action.path}>
            <Button
              className={`w-full ${action.color} text-white`}
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-500" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No pending tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
                    </div>
                    <Badge variant={task.status === 'pending' ? 'secondary' : 'default'}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No reports submitted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{new Date(report.date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{report.description}</p>
                    </div>
                    <Badge
                      variant={report.status === 'approved' ? 'default' : report.status === 'rejected' ? 'destructive' : 'secondary'}
                    >
                      {report.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
