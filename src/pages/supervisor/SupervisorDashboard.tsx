import { trpc } from '@/providers/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router'
import {
  Users,
  CheckSquare,
  ClipboardList,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

export default function SupervisorDashboard() {
  const { data: tasks } = trpc.task.list.useQuery({})
  const { data: evaluations } = trpc.evaluation.list.useQuery({})

  const assignedTasks = tasks?.filter(t => t.status !== 'completed') || []
  const completedTasks = tasks?.filter(t => t.status === 'completed') || []

  const stats = [
    {
      label: 'Assigned Interns',
      value: String(new Set(tasks?.map(t => t.studentId)).size || 0),
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Active Tasks',
      value: String(assignedTasks.length),
      icon: CheckSquare,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Completed Tasks',
      value: String(completedTasks.length),
      icon: CheckSquare,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Evaluations',
      value: String(evaluations?.length || 0),
      icon: ClipboardList,
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Supervisor Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your assigned interns and tasks.</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-500" />
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No active tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.student?.name || 'Unknown'}</p>
                    </div>
                    <Badge variant={task.status === 'in_progress' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
                <Link to="/supervisor/tasks" className="flex items-center text-sm text-[#7B1F3A] hover:underline mt-3">
                  Manage tasks <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-purple-500" />
              Recent Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!evaluations || evaluations.length === 0) ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No evaluations yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {evaluations.slice(0, 5).map((evaluation) => (
                  <div key={evaluation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Evaluation #{evaluation.id}</p>
                      <p className="text-xs text-gray-500">
                        Grade: {evaluation.overallGrade || 'N/A'} | {new Date(evaluation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {evaluation.aiSummary ? (
                      <Badge variant="default" className="bg-green-100 text-green-700">AI Summary</Badge>
                    ) : (
                      <Badge variant="outline">No Summary</Badge>
                    )}
                  </div>
                ))}
                <Link to="/supervisor/evaluations" className="flex items-center text-sm text-[#7B1F3A] hover:underline mt-3">
                  View all evaluations <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
