import { useMemo } from 'react'
import { trpc } from '@/providers/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router'
import {
  Users, Building2, ClipboardList, Calendar, AlertCircle,
  ArrowRight, Clock, UserCheck, XCircle, FileText, CheckSquare,
  TrendingUp, GraduationCap, Plus, BarChart as BarChartIcon
} from 'lucide-react'
import { StatusPieChart, MiniDonut, SimpleBarChart, StackedBarChart, COLORS } from '@/components/charts/DashboardCharts'

export default function CoordinatorDashboard() {
  const { data: userStats } = trpc.user.stats.useQuery()
  const { data: reports } = trpc.report.list.useQuery({ status: 'pending' })
  const { data: allReports } = trpc.report.list.useQuery({})
  const { data: visits } = trpc.siteVisit.list.useQuery({})
  const { data: assignments } = trpc.assignment.list.useQuery({})
  const { data: htes } = trpc.hte.list.useQuery({})
  const { data: tasks } = trpc.task.list.useQuery({})
  const { data: pullOuts } = trpc.assignment.pullOutCount.useQuery()

  const activeStudents = assignments?.filter(a => a.status === 'active').length || 0
  const pendingReports = reports?.length || 0
  const completedVisits = visits?.filter(v => v.status === 'completed').length || 0
  const scheduledVisits = visits?.filter(v => v.status === 'scheduled').length || 0
  const pendingTasks = tasks?.filter(t => t.status === 'pending' || t.status === 'in_progress').length || 0
  const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0
  const totalHtes = htes?.length || 0
  const pullOutCount = pullOuts?.count || 0

  const reportStats = useMemo(() => {
    if (!allReports) return { total: 0, approved: 0, rejected: 0, pending: 0, rate: 0 }
    const total = allReports.length
    const approved = allReports.filter(r => r.status === 'approved').length
    const rejected = allReports.filter(r => r.status === 'rejected').length
    const pending = allReports.filter(r => r.status === 'pending').length
    return { total, approved, rejected, pending, rate: total > 0 ? Math.round((approved / total) * 100) : 0 }
  }, [allReports])

  // Pie chart data: Report status distribution
  const reportPieData = [
    { name: 'Approved', value: reportStats.approved },
    { name: 'Pending', value: reportStats.pending },
    { name: 'Rejected', value: reportStats.rejected },
  ].filter(d => d.value > 0)

  // Bar chart data: Assignment status distribution
  const assignmentStatusData = useMemo(() => {
    if (!assignments) return []
    const active = assignments.filter(a => a.status === 'active').length
    const completed = assignments.filter(a => a.status === 'completed').length
    const pullOut = assignments.filter(a => a.status === 'pull_out').length
    const cancelled = assignments.filter(a => a.status === 'cancelled').length

    return [
      { label: 'Active', value: active, color: COLORS.emerald },
      { label: 'Completed', value: completed, color: COLORS.blue },
      { label: 'Pull-Out', value: pullOut, color: COLORS.red },
      { label: 'Cancelled', value: cancelled, color: COLORS.gray },
    ]
  }, [assignments])

  // Monthly data simulation (for line chart)
  const monthlyData = [
    { name: 'Jun', reports: 5, visits: 2 },
    { name: 'Jul', reports: 8, visits: 3 },
    { name: 'Aug', reports: 12, visits: 5 },
    { name: 'Sep', reports: 7, visits: 4 },
    { name: 'Oct', reports: 10, visits: 6 },
    { name: 'Nov', reports: 15, visits: 8 },
  ]

  const quickActions = [
    { label: 'Assign Student', path: '/coordinator/students', icon: Plus, color: 'bg-[#7B1F3A] hover:bg-[#7B1F3A]/90' },
    { label: 'Review Reports', path: '/coordinator/reports', icon: FileText, color: 'bg-[#D4A843] hover:bg-[#D4A843]/90' },
    { label: 'Schedule Visit', path: '/coordinator/visits', icon: Calendar, color: 'bg-gray-800 hover:bg-gray-700' },
    { label: 'View DTRs', path: '/coordinator/dtr', icon: Clock, color: 'bg-blue-600 hover:bg-blue-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome + Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Coordinator Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor and manage internship activities.</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Active Interns', value: String(activeStudents), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'HTE Partners', value: String(totalHtes), icon: Building2, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Pending Reports', value: String(pendingReports), icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Active Tasks', value: String(pendingTasks), icon: CheckSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Pull-Outs', value: String(pullOutCount), icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
          { label: 'Completed', value: String(completedAssignments), icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100' },
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Report Status Pie Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChartIcon className="w-4 h-4 text-amber-500" />
              Report Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {reportStats.total === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No reports yet</p>
            ) : (
              <StatusPieChart data={reportPieData} />
            )}
          </CardContent>
        </Card>

        {/* Assignment Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChartIcon className="w-4 h-4 text-blue-500" />
              Internship Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {assignments?.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No assignments yet</p>
            ) : (
              <StackedBarChart data={assignmentStatusData} />
            )}
          </CardContent>
        </Card>

        {/* Mini Donuts */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Key Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              <MiniDonut
                value={reportStats.approved}
                max={reportStats.total}
                label="Approval Rate"
                color={COLORS.emerald}
              />
              <MiniDonut
                value={completedAssignments}
                max={assignments?.length || 0}
                label="Completion"
                color={COLORS.primary}
              />
              <MiniDonut
                value={activeStudents}
                max={userStats?.students || 0}
                label="Placement"
                color={COLORS.blue}
              />
              <MiniDonut
                value={completedVisits}
                max={visits?.length || 0}
                label="Visit Rate"
                color={COLORS.purple}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChartIcon className="w-4 h-4 text-purple-500" />
            Monthly Activity (Sample Data)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <SimpleBarChart
            data={monthlyData}
            dataKey="name"
            bars={[
              { key: 'reports', color: COLORS.amber, name: 'Reports' },
              { key: 'visits', color: COLORS.blue, name: 'Site Visits' },
            ]}
          />
        </CardContent>
      </Card>

      {/* Bottom Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Reports */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-500" />
              Pending Reports to Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!reports || reports.length === 0) ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No pending reports</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{report.student?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{report.description}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(report.date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2">Pending</Badge>
                  </div>
                ))}
                <Link to="/coordinator/reports" className="flex items-center text-sm text-[#7B1F3A] hover:underline mt-3">
                  View all reports <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Visits */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Upcoming Site Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!visits || visits.filter(v => v.status === 'scheduled').length === 0) ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-8 h-8 mx-auto mb-2" />
                <p>No scheduled visits</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visits.filter(v => v.status === 'scheduled').slice(0, 5).map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{visit.student?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">
                        {visit.visitDate ? new Date(visit.visitDate).toLocaleDateString() : 'No date'}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>
                  </div>
                ))}
                <Link to="/coordinator/visits" className="flex items-center text-sm text-[#7B1F3A] hover:underline mt-3">
                  View all visits <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}