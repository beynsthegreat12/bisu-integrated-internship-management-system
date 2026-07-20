import { trpc } from '@/providers/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router'
import {
  Users,
  Building2,
  ClipboardList,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export default function SippDashboard() {
  const { data: userStats } = trpc.user.stats.useQuery()
  const { data: assignments } = trpc.assignment.list.useQuery({})
  const { data: evaluations } = trpc.evaluation.list.useQuery({})

  const totalInterns = assignments?.length || 0
  const completedInterns = assignments?.filter(a => a.status === 'completed').length || 0
  const completionRate = totalInterns > 0 ? Math.round((completedInterns / totalInterns) * 100) : 0

  const stats = [
    {
      label: 'Total Interns',
      value: String(totalInterns),
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'HTE Partners',
      value: String(userStats?.supervisors || 0),
      icon: Building2,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Evaluations',
      value: String(evaluations?.length || 0),
      icon: ClipboardList,
      color: 'bg-amber-100 text-amber-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">SIPP Coordinator Dashboard</h1>
        <p className="text-gray-500 mt-1">System-wide internship program overview.</p>
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
              <Users className="w-5 h-5 text-blue-500" />
              Active Internships
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!assignments || assignments.length === 0) ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No active internships</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.filter(a => a.status === 'active').slice(0, 5).map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{assignment.student?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{assignment.hte?.name || 'No HTE'} | {assignment.college?.name || ''}</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                ))}
                <Link to="/sipp/students" className="flex items-center text-sm text-[#7B1F3A] hover:underline mt-3">
                  View all internships <ArrowRight className="w-4 h-4 ml-1" />
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
                        By: {evaluation.evaluator?.name || 'Unknown'} | Grade: {evaluation.overallGrade || 'N/A'}
                      </p>
                    </div>
                    {evaluation.aiSummary ? (
                      <Badge variant="default" className="bg-green-100 text-green-700">AI</Badge>
                    ) : (
                      <Badge variant="outline">Manual</Badge>
                    )}
                  </div>
                ))}
                <Link to="/sipp/evaluations" className="flex items-center text-sm text-[#7B1F3A] hover:underline mt-3">
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
