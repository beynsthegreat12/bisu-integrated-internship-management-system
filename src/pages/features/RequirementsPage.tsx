import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { trpc } from "@/providers/trpc"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  FileText, Upload, CheckCircle2, XCircle, Clock4, Plus, AlertCircle,
  Download, Eye, Trash2, Users, Search
} from "lucide-react"

const statusConfig: Record<string, { label: string; bg: string; icon: any }> = {
  pending:  { label: "Pending",  bg: "bg-yellow-100 text-yellow-700", icon: Clock4 },
  approved: { label: "Approved", bg: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", bg: "bg-red-100 text-red-700", icon: XCircle },
}

export default function RequirementsPage() {
  const { user } = useAuth()
  const isStudent = user?.role === "student"
  const isCoordinator = user?.role === "coordinator" || user?.role === "admin" || user?.role === "sipp_coordinator"

  const [submitOpen, setSubmitOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("")
  const [filePath, setFilePath] = useState("")
  const [activeTab, setActiveTab] = useState<"list" | "students">("list")

  // Queries
  const { data: types } = trpc.requirement.listTypes.useQuery()
  const { data: myReqs, refetch } = trpc.requirement.list.useQuery({}, { enabled: isStudent })
  const { data: studentsReqs, refetch: refetchStudents } = trpc.requirement.coordinatorList.useQuery(undefined, { enabled: isCoordinator })
  const submitMut = trpc.requirement.submit.useMutation({ onSuccess: () => { refetch(); setSubmitOpen(false); setSelectedType(""); setFilePath("") } })
  const reviewMut = trpc.requirement.review.useMutation({ onSuccess: () => { refetch(); refetchStudents() } })
  const deleteMut = trpc.requirement.delete.useMutation({ onSuccess: () => { refetch(); refetchStudents() } })

  // Students with pending requirements (for coordinator)
  const studentsWithPending = studentsReqs?.filter(s => s.pending > 0) || []

  function handleSubmit() {
    if (!selectedType) return
    submitMut.mutate({ typeId: Number(selectedType), filePath: filePath || undefined })
  }

  function handleReview(id: number, status: "approved" | "rejected") {
    reviewMut.mutate({ id, status })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Requirements</h1>
          <p className="text-gray-500 mt-1">Submit and manage internship requirements</p>
        </div>
        {isStudent && (
          <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90">
                <Upload className="w-4 h-4 mr-2" /> Submit Requirement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Requirement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Requirement Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select requirement type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {types?.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>File Path / URL</Label>
                  <Input
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    placeholder="e.g. https://drive.google.com/file/..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Upload your file to Google Drive or any cloud storage, then paste the link here.</p>
                </div>
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-[#7B1F3A] hover:bg-[#7B1F3A]/90"
                  disabled={!selectedType || submitMut.isPending}
                >
                  {submitMut.isPending ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Coordinator Tabs */}
      {isCoordinator && (
        <div className="flex gap-2 border-b pb-2">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "list"
                ? "bg-[#7B1F3A]/10 text-[#7B1F3A] border-b-2 border-[#7B1F3A]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1.5" />
            All Students
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "students"
                ? "bg-[#7B1F3A]/10 text-[#7B1F3A] border-b-2 border-[#7B1F3A]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <AlertCircle className="w-4 h-4 inline mr-1.5" />
            Pending Reviews
            {studentsWithPending.length > 0 && (
              <Badge className="ml-2 bg-amber-500 text-white">{studentsWithPending.length}</Badge>
            )}
          </button>
        </div>
      )}

      {/* Student View: My Requirements */}
      {isStudent && (
        <div className="grid gap-4">
          {types?.map((type) => {
            const req = myReqs?.find(r => r.typeId === type.id)
            return (
              <Card key={type.id} className="border-0 shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      req?.status === "approved" ? "bg-emerald-100" :
                      req?.status === "rejected" ? "bg-red-100" :
                      req ? "bg-yellow-100" : "bg-gray-100"
                    }`}>
                      <FileText className={`w-5 h-5 ${
                        req?.status === "approved" ? "text-emerald-600" :
                        req?.status === "rejected" ? "text-red-600" :
                        req ? "text-yellow-600" : "text-gray-400"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1A2E]">{type.name}</p>
                      <p className="text-xs text-gray-400">{type.description || "No description"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {req ? (
                      <>
                        <Badge className={`${statusConfig[req.status]?.bg || ""}`}>
                          {statusConfig[req.status]?.label}
                        </Badge>
                        {req.filePath && (
                          <a href={req.filePath} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Button>
                          </a>
                        )}
                        <button
                          onClick={() => deleteMut.mutate({ id: req.id })}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-gray-400">Not submitted</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Coordinator View: All Students */}
      {isCoordinator && activeTab === "list" && (
        <div className="grid gap-4">
          {studentsReqs?.map((student) => (
            <Card key={student.id} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#7B1F3A]/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#7B1F3A]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1A2E]">{student.name}</p>
                      <p className="text-xs text-gray-400">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700">{student.approved} ✅</Badge>
                    <Badge className="bg-yellow-100 text-yellow-700">{student.pending} ⏳</Badge>
                    <Badge className="bg-red-100 text-red-700">{student.rejected} ❌</Badge>
                  </div>
                </div>

                {student.requirements.length > 0 && (
                  <div className="space-y-2">
                    {student.requirements.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{req.type?.name || `Type #${req.typeId}`}</span>
                          <Badge className={`text-[10px] ${statusConfig[req.status]?.bg || ""}`}>
                            {statusConfig[req.status]?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {req.filePath && (
                            <a href={req.filePath} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm">
                                <Eye className="w-3 h-3 mr-1" /> View
                              </Button>
                            </a>
                          )}
                          {req.status === "pending" && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleReview(req.id, "approved")}
                                className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50"
                                title="Approve"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReview(req.id, "rejected")}
                                className="p-1.5 rounded-md text-red-600 hover:bg-red-50"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Coordinator View: Pending Only */}
      {isCoordinator && activeTab === "students" && (
        <div className="grid gap-4">
          {studentsWithPending.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-10 text-center text-gray-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <p>No pending requirements to review!</p>
              </CardContent>
            </Card>
          ) : (
            studentsWithPending.map((student) => (
              <Card key={student.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A2E]">{student.name}</p>
                        <p className="text-xs text-gray-400">{student.pending} pending requirement(s)</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {student.requirements.filter(r => r.status === "pending").map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <span className="text-sm font-medium">{req.type?.name}</span>
                        <div className="flex items-center gap-2">
                          {req.filePath && (
                            <a href={req.filePath} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm">
                                <Eye className="w-3 h-3 mr-1" /> View
                              </Button>
                            </a>
                          )}
                          <button
                            onClick={() => handleReview(req.id, "approved")}
                            className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(req.id, "rejected")}
                            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}