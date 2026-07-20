import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Users, AlertTriangle, Building2, Calendar, Clock, Search,
  FileText, Download, CheckCircle2, XCircle, ChevronRight, Info,
  UserCheck, ArrowUpRight, GripHorizontal
} from "lucide-react"

export default function PullOutMonitoring() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [pullOutDialogOpen, setPullOutDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [pullOutReason, setPullOutReason] = useState("")
  const [viewOpen, setViewOpen] = useState(false)

  const { data: assignments, refetch } = trpc.assignment.list.useQuery({})
  const { data: pullOutList, refetch: refetchPullOuts } = trpc.assignment.pullOutList.useQuery(undefined, { enabled: user?.role === "coordinator" || user?.role === "admin" || user?.role === "sipp_coordinator" })
  const { data: pullOutCount, refetch: refetchCount } = trpc.assignment.pullOutCount.useQuery(undefined, { enabled: user?.role === "coordinator" || user?.role === "admin" || user?.role === "sipp_coordinator" })
  const pullOutMut = trpc.assignment.pullOutStudent.useMutation({
    onSuccess: () => { refetch(); refetchPullOuts(); refetchCount(); setPullOutDialogOpen(false); setPullOutReason("") }
  })

  const filteredPullOuts = (pullOutList || []).filter((a: any) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (a.student?.name?.toLowerCase() || "").includes(term) ||
           (a.hte?.name?.toLowerCase() || "").includes(term)
  })

  function handlePullOut() {
    if (!selectedAssignment || !pullOutReason.trim()) return
    pullOutMut.mutate({ id: selectedAssignment.id, reason: pullOutReason })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Pull-Out Monitoring</h1>
          <p className="text-gray-500 mt-1">Monitor and manage students who are pulled out from the internship program.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pulled Out</p>
                <p className="text-2xl font-bold text-red-600">{pullOutCount?.count || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Active Interns</p>
                <p className="text-2xl font-bold text-blue-600">{assignments?.filter((a: any) => a.status === "active").length || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">{assignments?.filter((a: any) => a.status === "completed").length || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by student or company..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9"
          />
        </div>
      </div>

      {/* Pulled Out Students List */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1A1A2E]">Pulled Out Students</h3>
          <Badge variant="outline" className="text-red-600 border-red-200">{filteredPullOuts.length} student{filteredPullOuts.length !== 1 ? "s" : ""}</Badge>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredPullOuts.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No pulled out students yet.</p>
              <p className="text-xs mt-1">Use the active interns list below to pull out a student.</p>
            </div>
          ) : (
            filteredPullOuts.map((a: any) => (
              <div key={a.id} className="p-4 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => { setSelectedAssignment(a); setViewOpen(true) }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-[#1A1A2E]">{a.student?.name || "N/A"}</p>
                      <Badge className="text-[10px] bg-red-100 text-red-700 border-red-200">Pulled Out</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {a.hte?.name || "N/A"}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {a.startDate ? new Date(a.startDate).toLocaleDateString() : "N/A"}</span>
                    </div>
                    {a.location?.startsWith("PULL_OUT_REASON:") && (
                      <p className="text-xs text-red-600 mt-1.5">{a.location.replace("PULL_OUT_REASON: ", "")}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 mt-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Active Interns (for Pull Out action) */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#1A1A2E]">Active Interns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Company / HTE</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(!assignments || assignments.filter((a: any) => a.status === "active").length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p>No active interns found.</p>
                  </td>
                </tr>
              ) : (
                assignments.filter((a: any) => a.status === "active").map((a: any) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1A1A2E] text-sm">{a.student?.name || "N/A"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.hte?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {a.startDate ? new Date(a.startDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1.5" />
                        Active
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Dialog open={pullOutDialogOpen && selectedAssignment?.id === a.id} onOpenChange={(open) => { if (!open) setPullOutDialogOpen(false); setSelectedAssignment(null) }}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                            onClick={() => setSelectedAssignment(a)}
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" /> Pull Out
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              Pull Out Student
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium">{a.student?.name}</p>
                              <p className="text-xs text-gray-500">{a.hte?.name}</p>
                            </div>
                            <div>
                              <Label>Reason for Pull Out <span className="text-red-500">*</span></Label>
                              <Textarea
                                value={pullOutReason}
                                onChange={e => setPullOutReason(e.target.value)}
                                placeholder="e.g. Academic deficiency, violation of company policy, personal reasons..."
                                rows={3}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex gap-3">
                              <Button variant="outline" className="flex-1" onClick={() => setPullOutDialogOpen(false)}>Cancel</Button>
                              <Button
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                onClick={handlePullOut}
                                disabled={pullOutMut.isPending || !pullOutReason.trim()}
                              >
                                {pullOutMut.isPending ? "Processing..." : "Confirm Pull Out"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Pull Out Details */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Pull Out Details
            </DialogTitle>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Student</p>
                  <p className="text-sm font-semibold text-[#1A1A2E]">{selectedAssignment.student?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Company</p>
                  <p className="text-sm">{selectedAssignment.hte?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Start Date</p>
                  <p className="text-sm">{selectedAssignment.startDate ? new Date(selectedAssignment.startDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Status</p>
                  <Badge className="mt-1 text-xs bg-red-100 text-red-700">Pulled Out</Badge>
                </div>
              </div>
              {selectedAssignment.location?.startsWith("PULL_OUT_REASON:") && (
                <div>
                  <Label className="text-[10px] text-gray-500 uppercase font-semibold">Reason</Label>
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {selectedAssignment.location.replace("PULL_OUT_REASON: ", "")}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}