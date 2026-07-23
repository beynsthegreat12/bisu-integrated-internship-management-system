import { useMemo } from 'react'
import { trpc } from '@/providers/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router'
import {
  Users, CheckSquare, ClipboardList, AlertCircle, ArrowRight,
  Clock, FileText, TrendingUp, Plus, Star, MessageSquare,
  UserCheck, GraduationCap
} from 'lucide-react'

export default function SupervisorDashboard() {
  const { data: tasks } = trpc.task.list.useQuery({})
  const { data: evaluations } = trpc.evaluation.list.useQuery({})
  const { data: messages } = trpc.message.listConversations.useQuery()

  // Task stats
  const taskStats = useMemo(() => {
    if (!tasks) return { pending: 0, inProgress: 0, completed: 0, overdue: 0, total: 0 }
    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.status === 'overdue').length,
      total: tasks.length,
    }
  }, [tasks])

  // Student count from tasks
  const studentCount = useMemo(() => {
    if (!tasks) return 0
    return new Set(tasks.map(t => t.studentId)).size
  }, [tasks])

  // Evaluation stats
  const evalStats = useMemo(() => {
    if (!evaluations) return { total: 0, withSummary: 0 }
    return {
      total: evaluations.length,
      withSummary: evaluations.filter(e => e.aiSummary).length,
    }
  }, [evaluations])

  // Task completion rate
  const completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0

  const quickActions = [
    { label: 'Create Task', path: '/supervisor/tasks', icon: Plus, color: 'bg-[#7B1F3A] hover:bg-[#7B1F3A]/90' },
    { label: 'Evaluate', path: '/supervisor/evaluations', icon: Star, color: 'bg-[#D4A843] hover:bg-[#D4A843]/90' },
    { label: 'Messages', path: '/supervisor/messages', icon: MessageSquare, color: 'bg-blue-600 hover:bg-blue-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Supervisor Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your assigned interns and tasks.</p>
        </div>
        <span className="text-sm text-gray-500">
          <Clock className="w-4 h-4 inline mr-1" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Link key={action.path} to={action.path}>
            <Button className={`w-full ${action.color} text-white h-11`}>
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Assigned Interns', value: String(studentCount), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Pending', value: String(taskStats.pending), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'In Progress', value: String(taskStats.inProgress), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Completed', value: String(taskStats.completed), icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Overdue', value: String(taskStats.overdue), icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
          { label: 'Evaluations', value: String(evalStats.total), icon: Star, color: 'text-orange-600', bg: 'bg-orange-100' },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                  <p className="text-xl font-bold text-[#1A1A2E] mt-1">{s.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Task Completion */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Task Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-[#1A1A2E]">{completionRate}%</div>
              <p className="text-sm text-gray-500 mt-1">{taskStats.completed} of {taskStats.total} tasks completed</p>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7B1F3A] to-emerald-500 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-2.5 bg-amber-50 rounded-lg text-center">
                <p className="text-[10px] text-gray-500">Pending + In Progress</p>
                <p className="text-lg font-bold text-amber-600">{taskStats.pending + taskStats.inProgress}</p>
              </div>
              <div className="p-2.5 bg-red-50 rounded-lg text-center">
                <p className="text-[10px] text-gray-500">Overdue</p>
                <p className="text-lg font-bold text-red-600">{taskStats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Tasks */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-500" />
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!tasks || tasks.filter(t => t.status !== 'completed').length === 0) ? (
              <div className="text-center py-8 text-gray-400">
                <CheckSquare className="w-8 h-8 mx-auto mb-2" />
                <p>No active tasks</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.filter(t => t.status !== 'completed').slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <p className="text-xs text-gray-400">Student #{task.studentId}</p>
                    </div>
                    <Badge className={`ml-2 ${
                      task.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
                <Link to="/supervisor/tasks" className="flex items-center text-xs text-[#7B1F3A] hover:underline mt-2">
                  Manage all tasks <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evaluations Overview */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-500" />
              Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {evalStats.total === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Star className="w-8 h-8 mx-auto mb-2" />
                <p>No evaluations yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Evaluations</span>
                  <span className="text-sm font-bold text-[#1A1A2E]">{evalStats.total}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">With AI Summary</span>
                  <span className="text-sm font-bold text-emerald-600">{evalStats.withSummary}</span>
                </div>
                <div className="pt-2">
                  {evaluations && evaluations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Recent:</p>
                      {evaluations.slice(0, 3).map(e => (
                        <div key={e.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                          <span>Evaluation #{e.id}</span>
                          <span className="text-gray-400">
                            Grade: {e.overallGrade || 'N/A'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Link to="/supervisor/evaluations" className="flex items-center text-xs text-[#7B1F3A] hover:underline mt-1">
                  View all evaluations <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Distribution */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#7B1F3A]" />
            Task Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Pending', count: taskStats.pending, color: 'bg-gray-200', textColor: 'text-gray-700' },
              { label: 'In Progress', count: taskStats.inProgress, color: 'bg-blue-200', textColor: 'text-blue-700' },
              { label: 'Completed', count: taskStats.completed, color: 'bg-emerald-200', textColor: 'text-emerald-700' },
              { label: 'Overdue', count: taskStats.overdue, color: 'bg-red-200', textColor: 'text-red-700' },
            ].map(item => (
              <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${item.textColor}`}>{item.count}</div>
                <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                {taskStats.total > 0 && (
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${Math.round((item.count / taskStats.total) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}