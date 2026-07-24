import { useState, useMemo } from "react"
import { useAuth } from "@/hooks/useAuth"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ClipboardList, Plus, Calendar, FileSpreadsheet, FileText, Printer,
  Search, CheckCircle2, XCircle, Clock4, TrendingUp, UserCheck,
  Info, Download, Filter, X, Users, Star, Eye, ArrowUpRight,
  ChevronRight, CheckCheck, AlertTriangle, GripHorizontal, Sparkles
} from "lucide-react"

// ── Criteria definitions ──
const JOB_PERFORMANCE_CRITERIA = [
  { category: "Personal Skills", items: [
    "Personal Discipline", "Critical Thinking", "Motivation", "Problem Solving",
    "Planning & Organizing", "Ethical Thinking", "Entrepreneurial Thinking",
    "Innovation", "Perseverance", "Continuous Improvement"
  ]},
  { category: "Interpersonal Skills", items: [
    "Teamwork & Collaboration", "Oral & Written Communication", "Conflict Resolution"
  ]},
  { category: "Technical Understanding", items: [
    "Computer Concepts Application", "Design & Implementation",
    "Technical Standards Recognition", "Research in CS", "Knowledge Integration"
  ]},
]

const LIFE_SKILLS_CRITERIA = [
  { category: "Cooperativeness", items: ["Takes Direction & Guidance"] },
  { category: "Human Relations", items: ["Proper Decorum"] },
  { category: "Leadership", items: ["Influences Others"] },
  { category: "Decision Making", items: ["Sound Judgment"] },
  { category: "Planning", items: ["Sets Clear Targets"] },
  { category: "Adaptability", items: ["Prioritizes Multiple Tasks"] },
  { category: "Dependability", items: ["Executes Work as Instructed", "Works with Minimum Supervision"] },
  { category: "Communication", items: ["Oral Communication", "Written Communication"] },
  { category: "Conduct", items: ["Filipino Values & Industry Values", "Commitment to Job", "Compliance with Guidelines"] },
  { category: "Attendance", items: ["Punctuality", "Regular Attendance"] },
]

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function getRatingInfo(score: number) {
  if (score >= 99) return { equiv: "1.0", desc: "Excellent", color: "text-emerald-600" }
  if (score >= 95) return { equiv: "1.2", desc: "Excellent", color: "text-emerald-600" }
  if (score >= 93) return { equiv: "1.3", desc: "Very Good", color: "text-blue-600" }
  if (score >= 90) return { equiv: "1.5", desc: "Very Good", color: "text-blue-600" }
  if (score >= 86) return { equiv: "1.9", desc: "Good", color: "text-amber-600" }
  if (score >= 80) return { equiv: "2.0", desc: "Good", color: "text-amber-600" }
  if (score >= 75) return { equiv: "3.0", desc: "Fair", color: "text-orange-600" }
  return { equiv: "5.0", desc: "Failure", color: "text-red-600" }
}

export default function EvaluationsPage() {
  const { user } = useAuth()
  const isStudent = user?.role === "student"
  const isSupervisor = user?.role === "supervisor" || user?.role === "admin"
  const isCoordinator = user?.role === "coordinator" || user?.role === "sipp_coordinator" || user?.role === "admin"

  const now = new Date()
  const [selMonth, setSelMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
  const [evalOpen, setEvalOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedEval, setSelectedEval] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("job_performance")
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comments, setComments] = useState("")
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [coordinatorRemarks, setCoordinatorRemarks] = useState("")

  const [year, month] = selMonth.split("-").map(Number)

  // ── Queries ──
  const { data: evaluations, refetch } = trpc.evaluation.list.useQuery({})
  const { data: myEvals } = trpc.evaluation.getMyEvaluations.useQuery(undefined, { enabled: isStudent })
  const { data: allEvals, refetch: refetchAll } = trpc.evaluation.coordinatorList.useQuery({
    search: searchTerm || undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
  }, { enabled: isCoordinator })
  const { data: stats, refetch: refetchStats } = trpc.evaluation.getCoordinatorStats.useQuery(undefined, { enabled: isCoordinator })
  const { data: students } = trpc.evaluation.getStudents.useQuery(undefined, { enabled: isSupervisor })
  const createMut = trpc.evaluation.create.useMutation({ onSuccess: () => { refetch(); setEvalOpen(false); setScores({}); setComments("") } })
  const updateMut = trpc.evaluation.update.useMutation({ onSuccess: () => { refetch(); refetchAll(); refetchStats(); setViewOpen(false) } })
  const geminiMut = trpc.gemini.summarizeFeedback.useMutation()

  // ── Auto-compute ──
  const computed = useMemo(() => {
    const allCriteria = [...JOB_PERFORMANCE_CRITERIA.flatMap(g => g.items), ...LIFE_SKILLS_CRITERIA.flatMap(g => g.items)]
    const jobPerfItems = JOB_PERFORMANCE_CRITERIA.flatMap(g => g.items)
    const lifeSkillItems = LIFE_SKILLS_CRITERIA.flatMap(g => g.items)

    const jobScores = jobPerfItems.map(c => scores[c] || 0).filter(s => s > 0)
    const lifeScores = lifeSkillItems.map(c => scores[c] || 0).filter(s => s > 0)

    const jobAvg = jobScores.length > 0 ? jobScores.reduce((a, b) => a + b, 0) / jobScores.length : 0
    const lifeAvg = lifeScores.length > 0 ? lifeScores.reduce((a, b) => a + b, 0) / lifeScores.length : 0
    const overall = (jobAvg * 0.8) + (lifeAvg * 0.2)

    const rating = getRatingInfo(Math.round(overall))
    return { jobAvg: Math.round(jobAvg * 100) / 100, lifeAvg: Math.round(lifeAvg * 100) / 100, overall: Math.round(overall * 100) / 100, ...rating, totalRated: jobScores.length + lifeScores.length }
  }, [scores])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStudentId) return
    const allScores = [...JOB_PERFORMANCE_CRITERIA.flatMap(g => g.items), ...LIFE_SKILLS_CRITERIA.flatMap(g => g.items)]
      .map(name => ({ criteriaName: name, category: JOB_PERFORMANCE_CRITERIA.flatMap(g => g.items).includes(name) ? "job_performance" : "life_skills", rating: scores[name] || 0 }))
      .filter(s => s.rating > 0)
    createMut.mutate({ studentId: selectedStudentId, scores: allScores, comments })
  }

  function handleCoordinatorAction(status: "approved" | "returned") {
    if (!selectedEval) return
    updateMut.mutate({ id: selectedEval.id, status, coordinatorRemarks: coordinatorRemarks || undefined })
  }

  // ── Official Print ──
  function handleOfficialPrint(ev: any) {
    const name = ev.student?.name || "_______________________"
    const hte = ev.hteName || "_______________________"
    const scores = ev.scores || []
    const comments = ev.comments?.replace(/\[COORDINATOR_[^\]]+\]/g, "").trim() || ""

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  @page { size: A4 portrait; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Times New Roman',Times,serif; font-size:10pt; color:#000; }
  .hdr { text-align:center; margin-bottom:10pt; }
  .hdr .univ { font-size:12pt; font-weight:bold; }
  .hdr .campus { font-size:9pt; }
  .hdr .title { font-size:14pt; font-weight:bold; margin:4pt 0; }
  .hdr .fno { font-size:7pt; }
  .info { margin:6pt 0; font-size:9pt; }
  .info td { padding:2pt 6pt; }
  table { width:100%; border-collapse:collapse; margin:6pt 0; }
  th, td { border:1px solid #000; padding:3pt 5pt; text-align:center; font-size:9pt; }
  th { background:#ddd; font-weight:bold; }
  .l { text-align:left; }
  .sig { margin-top:15pt; }
  .sig td { border:none; text-align:center; width:50%; padding-top:20pt; }
  .sig .line { border-top:1px solid #000; width:60%; margin:0 auto; padding-top:3pt; }
  .fn { text-align:center; margin-top:8pt; font-size:7pt; color:#666; }
</style></head>
<body>
<div class="hdr">
  <div class="univ">Republic of the Philippines<br/>BOHOL ISLAND STATE UNIVERSITY</div>
  <div class="campus">Candijay Campus &mdash; College of Sciences</div>
  <div class="fno">F-AQA-INS-014</div>
  <div class="title">GENERAL INTERNSHIP EVALUATION FORM</div>
  <div class="fno">(Revised 2025)</div>
</div>
<table class="info">
  <tr><td><b>Name of Intern:</b> ${name}</td><td><b>Name of HTE:</b> ${hte}</td></tr>
  <tr><td><b>Overall Grade:</b> ${ev.overallGrade || "N/A"}</td><td><b>Rating:</b> ${ev.overallGrade ? getRatingInfo(Number(ev.overallGrade)).desc + " (" + getRatingInfo(Number(ev.overallGrade)).equiv + ")" : "Pending"}</td></tr>
</table>
<p><b>Evaluation Scores:</b></p>
<table>
  <tr><th>#</th><th>Criteria</th><th>Rating (1-100)</th><th>Equivalent</th></tr>
  ${scores.map((s: any, i: number) => `<tr><td>${i+1}</td><td class="l">${s.criteriaName}</td><td>${s.rating}</td><td>${getRatingInfo(s.rating).desc}</td></tr>`).join("")}
</table>
${comments ? `<p><b>Comments/Recommendations:</b><br/>${comments}</p>` : ""}
<div class="sig">
  <table><tr>
    <td><div class="line">${ev.evaluator?.name || "_______________________"}</div><small>Immediate Supervisor/Mentor</small></td>
    <td><div class="line">ROGER E. AMOLATO, LPT</div><small>SIPP Coordinator/Internship Teacher</small></td>
  </tr></table>
</div>
<div class="fn">BISU Integrated Internship Management System &mdash; Candijay Campus</div>
</body></html>`

    const pw = window.open("", "_blank")
    if (!pw) { alert("Please allow pop-ups."); return }
    pw.document.write(html)
    pw.document.close()
    pw.focus()
    setTimeout(() => pw.print(), 500)
  }

  // ── PDF Export ──
  async function exportPDF() {
    const { default: jsPDF } = await import("jspdf")
    const { default: autoTable } = await import("jspdf-autotable")
    const doc = new jsPDF("p", "mm", "a4")
    const pw = doc.internal.pageSize.getWidth()
    const l = 16

    const name = user?.name || "Student"
    const monthLabel = `${MONTHS[month - 1]} ${year}`

    doc.setFont("times", "bold"); doc.setFontSize(16)
    doc.text("BISU Internship Evaluation", pw / 2, 20, { align: "center" })
    doc.setFontSize(11)
    doc.text("GENERAL INTERNSHIP EVALUATION FORM", pw / 2, 28, { align: "center" })
    doc.line(l, 32, pw - l, 32)

    doc.setFont("times", "normal"); doc.setFontSize(10)
    doc.text(`Name: ${name}`, l, 40)
    doc.text(`Date: ${monthLabel}`, pw - l, 40, { align: "right" })

    const evalData = (isStudent ? myEvals : isCoordinator ? allEvals : evaluations) || []
    if (evalData.length > 0) {
      const ev = evalData[0]
      const body = (ev.scores || []).map((s: any, i: number) => [String(i + 1), s.criteriaName, String(s.rating), getRatingInfo(s.rating).desc])

      autoTable(doc, {
        startY: 48,
        head: [["#", "Criteria", "Rating (1-100)", "Equivalent"]],
        headStyles: { halign: "center", fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 8 },
        body, bodyStyles: { fontSize: 8 },
        margin: { left: l, right: l },
      })

      const fy = (doc as any).lastAutoTable.finalY || 100
      doc.text(`Overall Grade: ${ev.overallGrade || "N/A"}`, l, fy + 14)
      if (ev.comments) {
        doc.text("Comments:", l, fy + 22)
        doc.setFontSize(9)
        doc.text(ev.comments.substring(0, 200), l + 4, fy + 28)
      }
    }

    doc.save(`Evaluation_${monthLabel.replace(/\s/g, "_")}.pdf`)
  }

  async function exportExcel() {
    const XLSX = await import("xlsx")
    const data = (isCoordinator ? allEvals : evaluations || []).map((e: any) => ({
      Student: e.student?.name || "N/A",
      Company: e.hteName || "N/A",
      "Overall Grade": e.overallGrade || "Pending",
      Comments: e.comments?.substring(0, 100) || "",
      Date: e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "",
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, "Evaluations")
    ws["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 15 }]
    XLSX.writeFile(wb, `Evaluations_${selMonth}.xlsx`)
  }

  function handlePrint() {
    const pw = window.open("", "_blank")
    if (!pw) { alert("Please allow pop-ups."); return }
    pw.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      @page { size: A4; margin: 15mm; }
      body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; }
      .header { text-align: center; margin-bottom: 15pt; }
      .header h1 { font-size: 16pt; margin-bottom: 2pt; }
      .header h2 { font-size: 12pt; }
      table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
      th, td { border: 1px solid #000; padding: 4pt 6pt; text-align: center; font-size: 9pt; }
      th { background: #ddd; font-weight: bold; }
      .info { margin-bottom: 8pt; }
    </style></head><body>
    <div class="header"><h1>BISU Internship Evaluation</h1><h2>GENERAL INTERNSHIP EVALUATION FORM</h2></div>
    <p class="info"><strong>Name:</strong> ${user?.name || "N/A"} &nbsp;&nbsp;&nbsp; <strong>Date:</strong> ${MONTHS[month - 1]} ${year}</p>
    <table><thead><tr><th>#</th><th>Criteria</th><th>Rating</th><th>Equivalent</th></tr></thead><tbody>
    ${(myEvals != null && myEvals[0] != null && myEvals[0].scores != null ? myEvals[0].scores : []).map((s: any, i: number) =>
      `<tr><td>${i + 1}</td><td style="text-align:left">${s.criteriaName}</td><td>${s.rating}</td><td>${getRatingInfo(s.rating).desc}</td></tr>`
    ).join("")}
    </tbody></table>
    <p><strong>Overall Grade:</strong> ${(myEvals != null && myEvals[0]?.overallGrade) || "N/A"}</p>
    ${(myEvals != null && myEvals[0]?.comments) ? `<p><strong>Comments:</strong><br>${myEvals[0].comments}</p>` : ""}
    </body></html>`)
    pw.document.close(); pw.focus()
    setTimeout(() => pw.print(), 500)
  }

  const activeEvals = isStudent ? myEvals : isCoordinator ? allEvals : evaluations

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Evaluations</h1>
          <p className="text-gray-500 mt-1">
            {isStudent ? "View your internship evaluation results" :
             isSupervisor ? "Evaluate intern performance using BISU form" :
             "Review and manage intern evaluations"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TooltipProvider>
            {(isStudent || isCoordinator) && <>
              <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" onClick={exportPDF}><FileText className="w-4 h-4 mr-1.5" /> PDF</Button></TooltipTrigger><TooltipContent>Export Evaluation PDF</TooltipContent></Tooltip>
              {isCoordinator && <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" onClick={exportExcel}><FileSpreadsheet className="w-4 h-4 mr-1.5" /> Excel</Button></TooltipTrigger><TooltipContent>Export to Excel</TooltipContent></Tooltip>}
              <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1.5" /> Print</Button></TooltipTrigger><TooltipContent>Print Evaluation</TooltipContent></Tooltip>
            </>}
          </TooltipProvider>

          {isSupervisor && (
            <Dialog open={evalOpen} onOpenChange={setEvalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90"><Plus className="w-4 h-4 mr-1.5" /> New Evaluation</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl max-h-[90vh]">
                <DialogHeader><DialogTitle>General Internship Evaluation Form</DialogTitle></DialogHeader>
                <ScrollArea className="max-h-[75vh] pr-4">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Select Student */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Student <span className="text-red-500">*</span></Label>
                        <Select value={String(selectedStudentId || "")} onValueChange={v => setSelectedStudentId(Number(v))}>
                          <SelectTrigger><SelectValue placeholder="Select student..." /></SelectTrigger>
                          <SelectContent>
                            {(students || []).map((s: any) => (
                              <SelectItem key={s.id} value={String(s.id)}>{s.name} - {s.company || "No company"}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Month</Label>
                        <Input type="month" value={selMonth} readOnly className="bg-gray-50" />
                      </div>
                    </div>

                    {/* Tabs: Job Performance / Life Skills */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="w-full">
                        <TabsTrigger value="job_performance" className="flex-1">Job Performance (80%)</TabsTrigger>
                        <TabsTrigger value="life_skills" className="flex-1">Life Skills (20%)</TabsTrigger>
                      </TabsList>

                      <TabsContent value="job_performance" className="space-y-4 mt-4">
                        {JOB_PERFORMANCE_CRITERIA.map(group => (
                          <div key={group.category}>
                            <h4 className="text-sm font-semibold text-[#7B1F3A] mb-2">{group.category}</h4>
                            <div className="space-y-2">
                              {group.items.map(criteria => (
                                <div key={criteria} className="flex items-center gap-3">
                                  <Label className="flex-1 text-sm">{criteria}</Label>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={scores[criteria] || ""}
                                    onChange={e => setScores({...scores, [criteria]: Number(e.target.value) || 0})}
                                    className="w-20 text-center"
                                    placeholder="1-100"
                                  />
                                  {scores[criteria] > 0 && (
                                    <span className={`text-xs font-medium w-16 text-center ${getRatingInfo(scores[criteria]).color}`}>
                                      {getRatingInfo(scores[criteria]).equiv}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="life_skills" className="space-y-4 mt-4">
                        {LIFE_SKILLS_CRITERIA.map(group => (
                          <div key={group.category}>
                            <h4 className="text-sm font-semibold text-[#7B1F3A] mb-2">{group.category}</h4>
                            <div className="space-y-2">
                              {group.items.map(criteria => (
                                <div key={criteria} className="flex items-center gap-3">
                                  <Label className="flex-1 text-sm">{criteria}</Label>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={scores[criteria] || ""}
                                    onChange={e => setScores({...scores, [criteria]: Number(e.target.value) || 0})}
                                    className="w-20 text-center"
                                    placeholder="1-100"
                                  />
                                  {scores[criteria] > 0 && (
                                    <span className={`text-xs font-medium w-16 text-center ${getRatingInfo(scores[criteria]).color}`}>
                                      {getRatingInfo(scores[criteria]).equiv}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>

                    {/* Auto-Computed Results */}
                    {computed.totalRated > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-semibold text-[#1A1A2E] mb-3">Auto-Computed Results</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase">Job Perf. (80%)</p>
                            <p className="text-lg font-bold text-blue-600">{computed.jobAvg.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase">Life Skills (20%)</p>
                            <p className="text-lg font-bold text-emerald-600">{computed.lifeAvg.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase">Overall</p>
                            <p className="text-lg font-bold text-[#1A1A2E]">{computed.overall.toFixed(1)}</p>
                            <p className={`text-xs font-medium ${computed.color}`}>{computed.equiv} - {computed.desc}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Comments */}
                    <div>
                      <Label>Comments & Recommendations</Label>
                      <Textarea value={comments} onChange={e => setComments(e.target.value)} rows={4} placeholder="Provide detailed feedback, observations, and recommendations..." required />
                    </div>

                    <Button type="submit" className="w-full bg-[#7B1F3A] hover:bg-[#7B1F3A]/90" disabled={createMut.isPending || !selectedStudentId}>
                      {createMut.isPending ? "Submitting..." : "Submit Evaluation"}
                    </Button>
                  </form>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      {isCoordinator && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Evaluations", value: String(stats.total), icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-100" },
            { label: "Completed", value: String(stats.completed), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
            { label: "Pending", value: String(stats.pending), icon: Clock4, color: "text-yellow-600", bg: "bg-yellow-100" },
            { label: "Avg Score", value: String(stats.avgScore), icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-100" },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                    <p className={`text-lg font-bold mt-0.5 ${
                      s.label === "Completed" ? "text-emerald-600" : s.label === "Pending" ? "text-yellow-600" : "text-[#1A1A2E]"
                    }`}>{s.value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Student Summary ── */}
      {isStudent && myEvals && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {myEvals.length > 0 ? (
            <>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Status</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {myEvals.filter((e: any) => e.overallGrade).length > 0 ? "Evaluated" : "Pending"}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Overall Grade</p>
                  <p className="text-lg font-bold text-blue-600">
                    {myEvals[0]?.overallGrade || "N/A"}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-white">
                <CardContent className="p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Rating</p>
                  <p className="text-base font-bold text-violet-600">
                    {myEvals[0]?.overallGrade ? getRatingInfo(Number(myEvals[0].overallGrade)).desc : "Pending"}
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-0 shadow-sm col-span-3">
              <CardContent className="p-6 text-center text-gray-400">
                <ClipboardList className="w-8 h-8 mx-auto mb-2" />
                <p>No evaluation records yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Filters ── */}
      {(isCoordinator || isSupervisor) && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-1 items-center gap-3 flex-wrap">
            <Calendar className="w-5 h-5 text-gray-500" />
            <Input type="month" value={selMonth} onChange={e => setSelMonth(e.target.value)} className="w-40" />
            {isCoordinator && (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Search student..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-48 pl-8 text-sm" />
                  {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36"><Filter className="w-3.5 h-3.5 mr-1" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
          <span className="text-sm text-gray-500">{activeEvals?.length || 0} evaluation{(activeEvals?.length || 0) !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* ── Evaluations List ── */}
      <div className="space-y-3">
        {(!activeEvals || activeEvals.length === 0) ? (
          <Card className="border-0 shadow-sm"><CardContent className="py-12 text-center text-gray-400">
            <ClipboardList className="w-10 h-10 mx-auto mb-3" />
            <p>No evaluations found</p>
          </CardContent></Card>
        ) : (
          activeEvals.map((ev: any) => (
            <Card key={ev.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedEval(ev); setViewOpen(true) }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-sm">
                        {ev.student?.name || ev.evaluator?.name || `Evaluation #${ev.id}`}
                      </p>
                      <Badge className={`text-[10px] px-2 py-0.5 font-medium border ${
                        ev.overallGrade ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-yellow-100 text-yellow-700 border-yellow-300"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ev.overallGrade ? "bg-emerald-500" : "bg-yellow-500"} inline-block mr-1.5`} />
                        {ev.overallGrade ? "Completed" : "Pending"}
                      </Badge>
                      {ev.hteName && <span className="text-xs text-gray-400">{ev.hteName}</span>}
                    </div>
                    {ev.scores && ev.scores.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {ev.scores.slice(0, 5).map((s: any) => (
                          <span key={s.id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {s.criteriaName}: {s.rating}
                          </span>
                        ))}
                        {ev.scores.length > 5 && <span className="text-[10px] text-gray-400">+{ev.scores.length - 5} more</span>}
                      </div>
                    )}
                    {ev.overallGrade && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Overall:</span>
                        <span className="text-sm font-bold text-[#1A1A2E]">{ev.overallGrade}</span>
                        <span className={`text-[10px] font-medium ${getRatingInfo(Number(ev.overallGrade)).color}`}>
                          ({getRatingInfo(Number(ev.overallGrade)).desc})
                        </span>
                      </div>
                    )}
                    {ev.aiSummary && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600">
                        <Sparkles className="w-3 h-3" /> AI Summary Available
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── View Dialog ── */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <ScrollArea className="max-h-[80vh] pr-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#D4AF37]" />
                Evaluation Details
              </DialogTitle>
            </DialogHeader>
            {selectedEval && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Student</p>
                    <p className="text-sm font-semibold">{selectedEval.student?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Company</p>
                    <p className="text-sm">{selectedEval.hteName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Status</p>
                    <Badge className={`mt-1 text-xs ${selectedEval.overallGrade ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {selectedEval.overallGrade ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Evaluator</p>
                    <p className="text-sm">{selectedEval.evaluator?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Overall Grade</p>
                    <p className="text-lg font-bold text-[#1A1A2E]">{selectedEval.overallGrade || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Rating</p>
                    <p className={`text-sm font-medium ${selectedEval.overallGrade ? getRatingInfo(Number(selectedEval.overallGrade)).color : "text-gray-400"}`}>
                      {selectedEval.overallGrade ? getRatingInfo(Number(selectedEval.overallGrade)).desc : "Pending"}
                    </p>
                  </div>
                </div>

                {/* AI Summary */}
                {selectedEval.aiSummary && (
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-emerald-50 border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-700">AI Summary</span>
                    </div>
                    <p className="text-sm text-gray-700">{selectedEval.aiSummary}</p>
                  </div>
                )}

                {/* Generate AI Summary Button */}
                {selectedEval.comments && !selectedEval.aiSummary && (
                  <Button
                    onClick={() => geminiMut.mutate({ evaluationId: selectedEval.id })}
                    disabled={geminiMut.isPending}
                    variant="outline"
                    size="sm"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {geminiMut.isPending ? "Generating..." : "Generate AI Summary"}
                  </Button>
                )}

                {/* Scores */}
                {selectedEval.scores && selectedEval.scores.length > 0 && (
                  <div>
                    <Label className="text-[10px] text-gray-500 uppercase font-semibold">Scores</Label>
                    <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedEval.scores.map((s: any) => (
                        <div key={s.id} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                          <p className="text-[10px] text-gray-500 truncate">{s.criteriaName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-[#1A1A2E]">{s.rating}</span>
                            <span className={`text-[10px] ${getRatingInfo(s.rating).color}`}>{getRatingInfo(s.rating).desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {selectedEval.comments && (
                  <div>
                    <Label className="text-[10px] text-gray-500 uppercase font-semibold">Comments</Label>
                    <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedEval.comments.replace(/\[COORDINATOR_[^\]]+\]/g, "").trim()}
                    </div>
                  </div>
                )}

                {/* Print Official Form Button */}
                {(isSupervisor || isCoordinator) && selectedEval.overallGrade && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleOfficialPrint(selectedEval)} variant="outline" size="sm">
                      <Printer className="w-4 h-4 mr-1.5" /> Print Official Form
                    </Button>
                  </div>
                )}

                {/* Coordinator Actions */}
                {isCoordinator && (
                  <div className="space-y-3 pt-2 border-t border-gray-200">
                    <div>
                      <Label className="text-sm font-semibold">Coordinator Remarks</Label>
                      <Textarea value={coordinatorRemarks} onChange={e => setCoordinatorRemarks(e.target.value)} rows={2} placeholder="Add remarks..." className="mt-1" />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => handleCoordinatorAction("approved")} className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={updateMut.isPending}>
                        <CheckCheck className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button onClick={() => handleCoordinatorAction("returned")} variant="outline" className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50" disabled={updateMut.isPending}>
                        <AlertTriangle className="w-4 h-4 mr-2" /> Return
                      </Button>
                    </div>
                  </div>
                )}

                {/* Coordinator status markers */}
                {selectedEval.comments?.includes("[COORDINATOR_STATUS: APPROVED]") && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center gap-2">
                    <CheckCheck className="w-4 h-4" /> Approved by Coordinator
                  </div>
                )}
                {selectedEval.comments?.includes("[COORDINATOR_STATUS: RETURNED]") && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Returned by Coordinator
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <style>{`
        @media print { body { background: white !important; } .no-print { display: none !important; } @page { margin: 12mm; size: A4; } }
      `}</style>
    </div>
  )
}