import { useMemo } from 'react'
import { trpc } from '@/providers/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router'
import {
  Users, Building2, ClipboardList, Calendar, AlertCircle,
  ArrowRight, Clock, UserCheck, XCircle, FileText, CheckSquare,
  TrendingUp, GraduationCap, Plus, Eye
} from 'lucide-react'

export default function CoordinatorDashboard() {
  const { data: userStats } = trpc.user.stats.useQuery()
  const { data: reports } = trpc.report.list.useQuery({ status: 'pending' })
  const { data: allReports } = trpc.report.list.useQuery({})
  const { data: visits } = trpc.siteVisit.list.useQuery({})
  const { data: assignments } = trpc.assignment.list.useQuery({})
  const { data: htes } = trpc.hte.list.useQuery({})
  const { data: tasks } = trpc.task.list.useQuery({})
  const { data: pullOuts } = trpc.assignment.pullOutCount.useQuery()

  // Compute stats
  const activeStudents = assignments?.filter(a => a.status === 'active').length || 0
  const pendingReports = reports?.length || 0
  const completedVisits = visits?.filter(v => v.status === 'completed').length || 0
  const scheduledVisits = visits?.filter(v => v.status === 'scheduled').length || 0
  const pendingTasks = tasks?.filter(t => t.status === 'pending' || t.status === 'in_progress').length || 0
  const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0
  const totalHtes = htes?.length || 0
  const pullOutCount = pullOuts?.count || 0

  // Report stats
  const reportStats = useMemo(() => {
    if (!allReports) return { total: 0, approved: 0, rejected: 0, pending: 0, rate: 0 }
    const total = allReports.length
    const approved = allReports.filter(r => r.status === 'approved').length
    const rejected = allReports.filter(r => r.status === 'rejected').length
    const pending = allReports.filter(r => r.status === 'pending').length
    return {
      total, approved, rejected, pending,
      rate: total > 0 ? Math.round((approved / total) * 100) : 0
    }
  }, [allReports])

  const quickActions = [
    { label: 'Assign Student', path: '/coordinator/students', icon: Plus, color: 'bg-[#7B1F3A] hover:bg-[#7B1F3A]/90' },
    { label: 'Review Reports', path: '/coordinator/reports', icon: FileText, color: 'bg-[#D4A843] hover:bg-[#D4A843]/90' },
    { label: 'Schedule Visit', path: '/coordinator/visits', icon: Calendar, color: 'bg-gray-800 hover:bg-gray-700' },
    { label: 'View DTRs', path: '/coordinator/dtr', icon: Clock, color: 'bg-blue-600 hover:bg-blue-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Coordinator Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor and manage internship activities.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            <Clock className="w-4 h-4 inline mr-1" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
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

      {/* Main Stats Cards */}
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

      {/* Second Row: Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Reports Overview */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              Reports Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Submitted</span>
                <span className="text-sm font-bold text-[#1A1A2E]">{reportStats.total}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Approved
                </span>
                <span className="text-sm font-bold text-emerald-600">{reportStats.approved}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
                </span>
                <span className="text-sm font-bold text-amber-600">{reportStats.pending}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-600" /> Rejected
                </span>
                <span className="text-sm font-bold text-red-600">{reportStats.rejected}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Approval Rate</span>
                  <span className="font-bold text-[#1A1A2E]">{reportStats.rate}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#7B1F3A] to-[#D4AF37] rounded-full transition-all"
                    style={{ width: `${reportStats.rate}%` }}
                  />
                </div>
              </div>
              <Link to="/coordinator/reports" className="flex items-center text-xs text-[#7B1F3A] hover:underline mt-2">
                Manage Reports <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Site Visits Overview */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Site Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Scheduled</span>
                <span className="text-sm font-bold text-blue-600">{scheduledVisits}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-bold text-emerald-600">{completedVisits}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-bold text-[#1A1A2E]">{visits?.length || 0}</span>
              </div>
              <div className="pt-2">
                {visits && visits.filter(v => v.status === 'scheduled').length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium">Upcoming:</p>
                    {visits.filter(v => v.status === 'scheduled').slice(0, 3).map(v => (
                      <div key={v.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                        <span>{v.student?.name || 'Unknown'}</span>
                        <span className="text-gray-400">{v.visitDate ? new Date(v.visitDate).toLocaleDateString() : ''}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-2">No upcoming visits</p>
                )}
              </div>
              <Link to="/coordinator/visits" className="flex items-center text-xs text-[#7B1F3A] hover:underline mt-1">
                Schedule a Visit <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* HTE & Students Overview */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green-500" />
              HTE Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Students</span>
                <span className="text-sm font-bold text-[#1A1A2E]">{userStats?.students || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">HTE Partners</span>
                <span className="text-sm font-bold text-[#1A1A2E]">{totalHtes}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg">
                <span className="text-sm text-gray-600">Active Interns</span>
                <span className="text-sm font-bold text-amber-600">{activeStudents}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-600">Pull-Outs</span>
                <span className="text-sm font-bold text-red-600">{pullOutCount}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Placement Rate</span>
                  <span className="font-bold text-[#1A1A2E]">
                    {userStats?.students && userStats?.students > 0
                      ? Math.round((activeStudents / userStats.students) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all"
                    style={{ width: `${userStats?.students && userStats?.students > 0 ? Math.round((activeStudents / userStats.students) * 100) : 0}%` }}
                  />
                </div>
              </div>
              <Link to="/coordinator/htes" className="flex items-center text-xs text-[#7B1F3A] hover:underline mt-1">
                Manage HTEs <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
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

        {/* Upcoming Site Visits */}
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