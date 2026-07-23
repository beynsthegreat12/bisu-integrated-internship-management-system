import { useMemo } from 'react'
import { trpc } from '@/providers/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router'
import {
  Users, Building2, ClipboardList, AlertCircle, ArrowRight,
  TrendingUp, GraduationCap, Clock, CheckSquare, FileText,
  Star, Plus, Eye, UserCheck, XCircle, Calendar
} from 'lucide-react'

export default function SippDashboard() {
  const { data: userStats } = trpc.user.stats.useQuery()
  const { data: assignments } = trpc.assignment.list.useQuery({})
  const { data: evaluations } = trpc.evaluation.list.useQuery({})
  const { data: htes } = trpc.hte.list.useQuery({})
  const { data: visits } = trpc.siteVisit.list.useQuery({})

  // Assignment stats
  const assignmentStats = useMemo(() => {
    if (!assignments) return { active: 0, completed: 0, cancelled: 0, pullOut: 0, total: 0 }
    return {
      active: assignments.filter(a => a.status === 'active').length,
      completed: assignments.filter(a => a.status === 'completed').length,
      cancelled: assignments.filter(a => a.status === 'cancelled').length,
      pullOut: assignments.filter(a => a.status === 'pull_out').length,
      total: assignments.length,
    }
  }, [assignments])

  // Completion rate
  const completionRate = assignmentStats.total > 0
    ? Math.round((assignmentStats.completed / assignmentStats.total) * 100)
    : 0

  // Placement rate (active / total students)
  const placementRate = userStats?.students && userStats?.students > 0
    ? Math.round((assignmentStats.active / userStats.students) * 100)
    : 0

  const totalHtes = htes?.length || 0
  const totalEvals = evaluations?.length || 0
  const scheduledVisits = visits?.filter(v => v.status === 'scheduled').length || 0
  const completedVisits = visits?.filter(v => v.status === 'completed').length || 0

  const quickActions = [
    { label: 'Assign Student', path: '/sipp/students', icon: Plus, color: 'bg-[#7B1F3A] hover:bg-[#7B1F3A]/90' },
    { label: 'Manage HTEs', path: '/sipp/htes', icon: Building2, color: 'bg-[#D4A843] hover:bg-[#D4A843]/90' },
    { label: 'Evaluations', path: '/sipp/evaluations', icon: Star, color: 'bg-gray-800 hover:bg-gray-700' },
    { label: 'Site Visits', path: '/sipp/visits', icon: Calendar, color: 'bg-blue-600 hover:bg-blue-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">SIPP Coordinator Dashboard</h1>
          <p className="text-gray-500 mt-1">System-wide internship program overview.</p>
        </div>
        <span className="text-sm text-gray-500">
          <Clock className="w-4 h-4 inline mr-1" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link key={action.path} to={action.path}>
            <Button className={`w-full ${action.color} text-white h-11`}>
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Students', value: String(userStats?.students || 0), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Active Interns', value: String(assignmentStats.active), icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'HTE Partners', value: String(totalHtes), icon: Building2, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Completed', value: String(assignmentStats.completed), icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Pull-Outs', value: String(assignmentStats.pullOut), icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
          { label: 'Evaluations', value: String(totalEvals), icon: Star, color: 'text-orange-600', bg: 'bg-orange-100' },
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

      {/* Detailed Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Placement & Completion */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Program Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Placement Rate</span>
                  <span className="font-bold text-[#1A1A2E]">{placementRate}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                    style={{ width: `${placementRate}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{assignmentStats.active} of {userStats?.students || 0} students placed</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Completion Rate</span>
                  <span className="font-bold text-[#1A1A2E]">{completionRate}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#7B1F3A] to-[#D4AF37] rounded-full"
                    style={{ width: `${completionRate}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{assignmentStats.completed} of {assignmentStats.total} internships completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Internship Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-500" />
              Internship Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Active
                </span>
                <span className="text-sm font-bold text-emerald-600">{assignmentStats.active}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> Completed
                </span>
                <span className="text-sm font-bold text-purple-600">{assignmentStats.completed}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-gray-600" /> Cancelled
                </span>
                <span className="text-sm font-bold text-gray-600">{assignmentStats.cancelled}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Pull-Out
                </span>
                <span className="text-sm font-bold text-red-600">{assignmentStats.pullOut}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Visits & Evaluations */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Visits & Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Scheduled Visits</span>
                <span className="text-sm font-bold text-blue-600">{scheduledVisits}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg">
                <span className="text-sm text-gray-600">Completed Visits</span>
                <span className="text-sm font-bold text-emerald-600">{completedVisits}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Evaluations</span>
                <span className="text-sm font-bold text-purple-600">{totalEvals}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Visit Completion</span>
                  <span className="font-bold text-[#1A1A2E]">
                    {visits && visits.length > 0
                      ? Math.round((completedVisits / visits.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full"
                    style={{ width: `${visits && visits.length > 0 ? Math.round((completedVisits / visits.length) * 100) : 0}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Internships */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Active Internships
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignmentStats.active === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p>No active internships</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments?.filter(a => a.status === 'active').slice(0, 5).map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{assignment.student?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{assignment.hte?.name || 'No HTE'}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                  </div>
                ))}
                <Link to="/sipp/students" className="flex items-center text-sm text-[#7B1F3A] hover:underline mt-3">
                  View all internships <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Evaluations */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-purple-500" />
              Recent Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!evaluations || evaluations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ClipboardList className="w-8 h-8 mx-auto mb-2" />
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
                    <Badge className={evaluation.aiSummary ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {evaluation.aiSummary ? 'AI Summary' : 'Manual'}
                    </Badge>
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

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Internships', count: assignmentStats.total, color: 'bg-blue-50', textColor: 'text-blue-700', desc: 'All time' },
          { label: 'Placement Rate', count: `${placementRate}%`, color: 'bg-emerald-50', textColor: 'text-emerald-700', desc: `${assignmentStats.active} active` },
          { label: 'Completion Rate', count: `${completionRate}%`, color: 'bg-purple-50', textColor: 'text-purple-700', desc: `${assignmentStats.completed} done` },
          { label: 'Pull-Out Rate', count: `${assignmentStats.total > 0 ? Math.round((assignmentStats.pullOut / assignmentStats.total) * 100) : 0}%`, color: 'bg-red-50', textColor: 'text-red-700', desc: `${assignmentStats.pullOut} pulled out` },
        ].map(item => (
          <Card key={item.label} className={`border-0 ${item.color}`}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${item.textColor}`}>{item.count}</p>
              <p className="text-xs text-gray-600 mt-1">{item.label}</p>
              <p className="text-[10px] text-gray-400">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}