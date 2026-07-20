import { trpc } from '@/providers/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router'
import {
  Users,
  Building2,
  ClipboardList,
  Calendar,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

export default function CoordinatorDashboard() {
  const { data: userStats } = trpc.user.stats.useQuery()
  const { data: reports } = trpc.report.list.useQuery({ status: 'pending' })
  const { data: visits } = trpc.siteVisit.list.useQuery({ status: 'scheduled' })

  const stats = [
    {
      label: 'Total Interns',
      value: String(userStats?.students || 0),
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      path: '/coordinator/students',
    },
    {
      label: 'Active HTEs',
      value: String(userStats?.supervisors || 0),
      icon: Building2,
      color: 'bg-green-100 text-green-600',
      path: '/coordinator/htes',
    },
    {
      label: 'Pending Reviews',
      value: String(reports?.length || 0),
      icon: ClipboardList,
      color: 'bg-amber-100 text-amber-600',
      path: '/coordinator/reports',
    },
    {
      label: 'Upcoming Visits',
      value: String(visits?.length || 0),
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
      path: '/coordinator/visits',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Coordinator Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor and manage internship activities.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.path}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-500" />
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
                    </div>
                    <Badge variant="secondary">{report.status}</Badge>
                  </div>
                ))}
                <Link to="/coordinator/reports" className="flex items-center text-sm text-[#7B1F3A] hover:underline mt-3">
                  View all reports <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Upcoming Site Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!visits || visits.length === 0) ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No scheduled visits</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visits.slice(0, 5).map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{visit.student?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{visit.visitDate ? new Date(visit.visitDate).toLocaleDateString() : 'No date'}</p>
                    </div>
                    <Badge variant="outline">{visit.status}</Badge>
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
