import { useState, useMemo } from "react"
import { useAuth } from "@/hooks/useAuth"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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

// ── Official BISU Evaluation Form HTML for Print ──
function generateEvalFormHTML(data: {
  studentName: string; hteName: string; hteAddress: string; department: string;
  startDate: string; endDate: string; scores: any[]; comments: string;
  jobPerfAvg: number; lifeSkillAvg: number; overall: number; rating: any;
  evaluatorName: string; coordinatorName: string; collegeName: string;
}): string {
  const { studentName, hteName, hteAddress, department, startDate, endDate, scores, comments, jobPerfAvg, lifeSkillAvg, overall, rating, evaluatorName, coordinatorName, collegeName } = data

  const jobPerfScores = scores.filter(s => JOB_PERFORMANCE_CRITERIA.flatMap(g => g.items).includes(s.criteriaName))
  const lifeSkillScores = scores.filter(s => LIFE_SKILLS_CRITERIA.flatMap(g => g.items).includes(s.criteriaName))

  let jobPerfRows = ""
  for (const cat of JOB_PERFORMANCE_CRITERIA) {
    const catScores = jobPerfScores.filter(s => cat.items.includes(s.criteriaName))
    if (catScores.length === 0) continue
    jobPerfRows += `<tr class="cat"><td colspan="3"><strong>${cat.category}</strong></td></tr>`
    for (const item of cat.items) {
      const s = catScores.find(sc => sc.criteriaName === item)
      jobPerfRows += `<tr><td></td><td>${item}</td><td class="r">${s ? s.rating : ''}</td></tr>`
    }
  }

  let lifeSkillRows = ""
  for (const cat of LIFE_SKILLS_CRITERIA) {
    const catScores = lifeSkillScores.filter(s => cat.items.includes(s.criteriaName))
    if (catScores.length === 0) continue
    lifeSkillRows += `<tr class="cat"><td colspan="3"><strong>${cat.category}</strong></td></tr>`
    for (const item of cat.items) {
      const s = catScores.find(sc => sc.criteriaName === item)
      lifeSkillRows += `<tr><td></td><td>${item}</td><td class="r">${s ? s.rating : ''}</td></tr>`
    }
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4 portrait; margin: 10mm 14mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Times New Roman',Times,serif; font-size:9pt; color:#000; line-height:1.3; }
  .fc { max-width:185mm; margin:0 auto; }
  .hdr { text-align:center; margin-bottom:6pt; position:relative; }
  .hdr .logo { position:absolute; left:0; top:0; width:60px; height:60px; }
  .hdr .logo img { width:60px; height:60px; object-fit:contain; }
  .hdr .univ { font-size:11pt; font-weight:bold; }
  .hdr .campus { font-size:9pt; }
  .hdr .dept { font-size:8pt; font-style:italic; }
  .hdr .title { font-size:13pt; font-weight:bold; margin:4pt 0; }
  .hdr .fno { font-size:7pt; }
  .info { margin:4pt 0; font-size:8.5pt; }
  .info table { width:100%; border-collapse:collapse; }
  .info td { padding:1pt 3pt; vertical-align:top; }
  .info .lb { font-weight:bold; width:120px; }
  .scale { margin:4pt 0; font-size:7.5pt; }
  .scale table { width:100%; border-collapse:collapse; }
  .scale th { background:#ddd; font-weight:bold; padding:2pt; border:1px solid #000; font-size:7pt; }
  .scale td { padding:1.5pt 3pt; border:1px solid #000; text-align:center; font-size:7pt; }
  table.eval { width:100%; border-collapse:collapse; margin:4pt 0; page-break-inside:avoid; }
  table.eval th { background:#ddd; font-weight:bold; padding:2.5pt 3pt; border:1px solid #000; font-size:7.5pt; text-align:center; }
  table.eval td { padding:2pt 3pt; border:1px solid #000; font-size:8pt; vertical-align:top; }
  table.eval td.r { text-align:center; width:50px; }
  table.eval tr.cat td { background:#f0f0f0; font-weight:bold; font-size:8pt; }
  .wt { font-size:7.5pt; font-style:italic; margin:2pt 0; }
  .sig { margin-top:8pt; page-break-inside:avoid; }
  .sig table { width:100%; }
  .sig td { text-align:center; width:50%; padding:4pt; }
  .sig .line { border-top:1px solid #000; width:70%; margin:0 auto; padding-top:2pt; }
  .sig .name { font-weight:bold; font-size:9pt; }
  .sig .lbl { font-size:7.5pt; }
  .overall { margin:4pt 0; font-size:9pt; }
  .overall table { width:100%; border-collapse:collapse; }
  .overall td { padding:2pt 4pt; border:1px solid #000; }
  .overall .b { font-weight:bold; }
  .fn { text-align:center; margin-top:6pt; font-size:6pt; color:#666; }
  .comments { margin:4pt 0; font-size:8pt; }
  .comments .box { border:1px solid #000; padding:4pt; min-height:40px; margin-top:2pt; }
</style>
</head>
<body>
<div class="fc">
  <div class="hdr">
    <div class="logo"><img src="data/DTR.jpg" alt="BISU Logo" onerror="this.style.display='none'" /></div>
    <div class="univ">Republic of the Philippines</div>
    <div class="univ">BOHOL ISLAND STATE UNIVERSITY</div>
    <div class="campus">Candijay Campus</div>
    <div class="dept">College of Sciences</div>
    <div class="fno">F-AQA-INS-014</div>
    <div class="title">GENERAL INTERNSHIP EVALUATION FORM</div>
    <div class="fno">(Revised 2025)</div>
  </div>

  <div class="info">
    <table>
      <tr><td class="lb">Name of Intern:</td><td>${studentName}</td><td class="lb">Period:</td><td>${startDate} to ${endDate}</td></tr>
      <tr><td class="lb">Name of HTE:</td><td>${hteName}</td><td class="lb">Department:</td><td>${department}</td></tr>
      <tr><td class="lb">HTE Address:</td><td colspan="3">${hteAddress}</td></tr>
    </table>
  </div>

  <div class="scale">
    <p><strong>Rating Scale:</strong></p>
    <table>
      <tr><th>Rating</th><th>Equivalent</th><th>Description</th><th>Rating</th><th>Equivalent</th><th>Description</th></tr>
      <tr><td>1.0</td><td>99-100</td><td>Excellent</td><td>2.0-2.4</td><td>81-85</td><td>Good</td></tr>
      <tr><td>1.1-1.2</td><td>95-98</td><td>Excellent</td><td>2.5-2.9</td><td>76-80</td><td>Fair</td></tr>
      <tr><td>1.3-1.5</td><td>90-94</td><td>Very Good</td><td>3.0</td><td>75</td><td>Fair</td></tr>
      <tr><td>1.6-1.9</td><td>86-89</td><td>Good</td><td>5.0</td><td>Below 75</td><td>Failure</td></tr>
    </table>
  </div>

  <p class="wt"><strong>Direction:</strong> Kindly assess the intern based on the scale below. Rate each item from 1 to 100.</p>

  <p><strong>A. Job Performance (80%)</strong></p>
  <table class="eval">
    <tr><th style="width:5%"></th><th>Criteria</th><th style="width:50px">Rating</th></tr>
    ${jobPerfRows}
    <tr><td colspan="2" style="text-align:right;font-weight:bold;">Job Performance Average:</td><td class="r">${jobPerfAvg.toFixed(2)}</td></tr>
  </table>

  <p><strong>B. Life Skills (20%)</strong></p>
  <table class="eval">
    <tr><th style="width:5%"></th><th>Criteria</th><th style="width:50px">Rating</th></tr>
    ${lifeSkillRows}
    <tr><td colspan="2" style="text-align:right;font-weight:bold;">Life Skills Average:</td><td class="r">${lifeSkillAvg.toFixed(2)}</td></tr>
  </table>

  <div class="overall">
    <table>
      <tr><td style="width:50%"><strong>Overall Rating:</strong> ${overall.toFixed(2)}</td><td style="width:25%"><strong>Equivalent:</strong> ${rating.equiv}</td><td style="width:25%"><strong>Description:</strong> ${rating.desc}</td></tr>
    </table>
  </div>

  ${comments ? `<div class="comments"><strong>Comments/Recommendations:</strong><div class="box">${comments}</div></div>` : ''}

  <div class="sig">
    <table>
      <tr>
        <td>
          <div class="line"></div>
          <div class="name">${evaluatorName}</div>
          <div class="lbl">Signature over Printed Name of Immediate Supervisor/Mentor</div>
        </td>
        <td>
          <div class="line"></div>
          <div class="name">${coordinatorName}</div>
          <div class="lbl">SIPP Coordinator/Internship Teacher</div>
        </td>
      </tr>
    </table>
  </div>

  <div class="fn">BISU Integrated Internship Management System — Candijay Campus</div>
</div>
</body>
</html>`
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
    const studentName = ev.student?.name || "_______________________"
    const hteName = ev.hteName || "_______________________"
    const hteAddress = "_______________________"
    const department = "Computer Science"
    const startDate = "_________________"
    const endDate = "_________________"
    const scores = ev.scores || []
    const comments = ev.comments?.replace(/\[COORDINATOR_[^\]]+\]/g, "").trim() || ""

    const jobPerfScores = scores.filter((s: any) => JOB_PERFORMANCE_CRITERIA.flatMap(g => g.items).includes(s.criteriaName))
    const lifeSkillScores = scores.filter((s: any) => LIFE_SKILLS_CRITERIA.flatMap(g => g.items).includes(s.criteriaName))
    const jobAvg = jobPerfScores.length > 0 ? jobPerfScores.reduce((a: number, s: any) => a + s.rating, 0) / jobPerfScores.length : 0
    const lifeAvg = lifeSkillScores.length > 0 ? lifeSkillScores.reduce((a: number, s: any) => a + s.rating, 0) / lifeSkillScores.length : 0
    const overall = (jobAvg * 0.8) + (lifeAvg * 0.2)
    const rating = getRatingInfo(Math.round(overall))

    const html = generateEvalFormHTML({
      studentName, hteName, hteAddress, department, startDate, endDate,
      scores, comments, jobPerfAvg: jobAvg, lifeSkillAvg: lifeAvg,
      overall, rating,
      evaluatorName: ev.evaluator?.name || "_______________________",
      coordinatorName: "ROGER E. AMOLATO, LPT",
      collegeName: "College of Sciences",
    })

    const pw = window.open("", "_blank")
    if (!pw) { alert("Please allow pop-ups."); return }
    pw.document.write(html)
    pw.document.close()
    pw.focus()
    setTimeout(() => { pw.print() }, 500)
  }

  // ── PDF Export (Official Form) ──
  async function exportOfficialPDF(ev: any) {
    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF("p", "mm", "a4")
    const pw = doc.internal.pageSize.getWidth()
    const l = 16

    const studentName = ev.student?.name || "N/A"
    const hteName = ev.hteName || "N/A"
    const scores = ev.scores || []
    const comments = ev.comments?.replace(/\[COORDINATOR_[^\]]+\]/g, "").trim() || ""

    const jobPerfScores = scores.filter((s: any) => JOB_PERFORMANCE_CRITERIA.flatMap(g => g.items).includes(s.criteriaName))
    const lifeSkillScores = scores.filter((s: any) => LIFE_SKILLS_CRITERIA.flatMap(g => g.items).includes(s.criteriaName))
    const jobAvg = jobPerfScores.length > 0 ? jobPerfScores.reduce((a: number, s: any) => a + s.rating, 0) / jobPerfScores.length : 0
    const lifeAvg = lifeSkillScores.length > 0 ? lifeSkillScores.reduce((a: number, s: any) => a + s.rating, 0) / lifeSkillScores.length : 0
    const overall = (jobAvg * 0.8) + (lifeAvg * 0.2)
    const rating = getRatingInfo(Math.round(overall))

    // Header
    doc.setFont("times", "bold")
    doc.setFontSize(10)
    doc.text("Republic of the Philippines", pw / 2, 14, { align: "center" })
    doc.setFontSize(12)
    doc.text("BOHOL ISLAND STATE UNIVERSITY", pw / 2, 20, { align: "center" })
    doc.setFontSize(9)
    doc.text("Candijay Campus", pw / 2, 25, { align: "center" })
    doc.setFontSize(8)
    doc.text("College of Sciences", pw / 2, 29, { align: "center" })
    doc.setFontSize(7)
    doc.text("F-AQA-INS-014", pw / 2, 33, { align: "center" })
    doc.setFontSize(13)
    doc.text("GENERAL INTERNSHIP EVALUATION FORM", pw / 2, 39, { align: "center" })
    doc.setFontSize(7)
    doc.text("(Revised 2025)", pw / 2, 43, { align: "center" })

    // Info
    doc.setFont("times", "normal")
    doc.setFontSize(9)
    doc.text(`Name of Intern: ${studentName}`, l, 50)
    doc.text(`Name of HTE: ${hteName}`, l, 56)
    doc.text(`HTE Address: _______________________`, l, 62)
    doc.text(`Department: Computer Science`, l, 68)
    doc.text(`Period: _________________ to _________________`, l, 74)

    // Scale
    doc.setFontSize(8)
    doc.text("Rating Scale:", l, 82)
    const { default: autoTable } = await import("jspdf-autotable")
    autoTable(doc, {
      startY: 85,
      head: [["Rating", "Equivalent", "Description", "Rating", "Equivalent", "Description"]],
      body: [
        ["1.0", "99-100", "Excellent", "2.0-2.4", "81-85", "Good"],
        ["1.1-1.2", "95-98", "Excellent", "2.5-2.9", "76-80", "Fair"],
        ["1.3-1.5", "90-94", "Very Good", "3.0", "75", "Fair"],
        ["1.6-1.9", "86-89", "Good", "5.0", "Below 75", "Failure"],
      ],
      headStyles: { halign: "center", fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 7 },
      bodyStyles: { fontSize: 7, halign: "center" },
      margin: { left: l, right: l },
    })

    const scaleEnd = (doc as any).lastAutoTable.finalY || 100

    // Job Performance
    doc.setFontSize(8)
    doc.text("A. Job Performance (80%)", l, scaleEnd + 8)
    const jpBody = jobPerfScores.map((s: any, i: number) => [String(i + 1), s.criteriaName, String(s.rating)])
    jpBody.push(["", "Job Performance Average:", jobAvg.toFixed(2)])

    autoTable(doc, {
      startY: scaleEnd + 10,
      head: [["#", "Criteria", "Rating"]],
      body: jpBody,
      headStyles: { halign: "center", fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 7 },
      bodyStyles: { fontSize: 7 },
      columnStyles: { 0: { cellWidth: 10, halign: "center" }, 1: { cellWidth: 120 }, 2: { cellWidth: 30, halign: "center" } },
      margin: { left: l, right: l },
    })

    const jpEnd = (doc as any).lastAutoTable.finalY || scaleEnd + 20

    // Life Skills
    doc.setFontSize(8)
    doc.text("B. Life Skills (20%)", l, jpEnd + 8)
    const lsBody = lifeSkillScores.map((s: any, i: number) => [String(i + 1), s.criteriaName, String(s.rating)])
    lsBody.push(["", "Life Skills Average:", lifeAvg.toFixed(2)])

    autoTable(doc, {
      startY: jpEnd + 10,
      head: [["#", "Criteria", "Rating"]],
      body: lsBody,
      headStyles: { halign: "center", fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 7 },
      bodyStyles: { fontSize: 7 },
      columnStyles: { 0: { cellWidth: 10, halign: "center" }, 1: { cellWidth: 120 }, 2: { cellWidth: 30, halign: "center" } },
      margin: { left: l, right: l },
    })

    const lsEnd = (doc as any).lastAutoTable.finalY || jpEnd + 20

    // Overall
    doc.setFontSize(9)
    doc.setFont("times", "bold")
    doc.text(`Overall Rating: ${overall.toFixed(2)}     Equivalent: ${rating.equiv}     Description: ${rating.desc}`, l, lsEnd + 10)

    // Comments
    if (comments) {
      doc.setFont("times", "normal")
      doc.setFontSize(8)
      doc.text("Comments/Recommendations:", l, lsEnd + 18)
      const commentLines = doc.splitTextToSize(comments, pw - l * 2)
      doc.text(commentLines, l, lsEnd + 24)
    }

    // Signatures
    const sigY = Math.max(lsEnd + 40, 240)
    doc.setFont("times", "normal")
    doc.setFontSize(9)
    doc.line(l, sigY, l + 70, sigY)
    doc.setFont("times", "bold")
    doc.text(ev.evaluator?.name || "_______________________", l + 35, sigY + 6, { align: "center" })
    doc.setFont("times", "normal")
    doc.setFontSize(7)
    doc.text("Signature over Printed Name of", l + 35, sigY + 11, { align: "center" })
    doc.text("Immediate Supervisor/Mentor", l + 35, sigY + 15, { align: "center" })

    doc.setFont("times", "normal")
    doc.setFontSize(9)
    doc.line(pw / 2 + 10, sigY, pw / 2 + 80, sigY)
    doc.setFont("times", "bold")
    doc.text("ROGER E. AMOLATO, LPT", pw / 2 + 45, sigY + 6, { align: "center" })
    doc.setFont("times", "normal")
    doc.setFontSize(7)
    doc.text("SIPP Coordinator/Internship Teacher", pw / 2 + 45, sigY + 11, { align: "center" })

    doc.setFontSize(6)
    doc.text("BISU Integrated Internship Management System — Candijay Campus", pw / 2, 285, { align: "center" })

    doc.save(`Evaluation_Form_${studentName.replace(/\s/g, "_")}.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] dark:text-gray-100">Evaluations</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">General Internship Evaluation Form (F-AQA-INS-014)</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isSupervisor && (
            <Dialog open={evalOpen} onOpenChange={setEvalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90"><Plus className="w-4 h-4 mr-1.5" /> New Evaluation</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl max-h-[90vh]">
                <ScrollArea className="max-h-[80vh] pr-4">
                  <DialogHeader><DialogTitle>General Internship Evaluation Form</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>Select Student</Label>
                      <Select value={String(selectedStudentId || "")} onValueChange={v => setSelectedStudentId(Number(v))}>
                        <SelectTrigger><SelectValue placeholder="Choose student..." /></SelectTrigger>
                        <SelectContent>
                          {students?.map((s: any) => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.name} — {s.company || "No HTE"}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="job_performance">Job Performance (80%)</TabsTrigger>
                        <TabsTrigger value="life_skills">Life Skills (20%)</TabsTrigger>
                      </TabsList>

                      <TabsContent value="job_performance" className="space-y-3">
                        {JOB_PERFORMANCE_CRITERIA.map(group => (
                          <div key={group.category}>
                            <p className="text-sm font-semibold text-[#7B1F3A] dark:text-[#D4AF37] mb-2">{group.category}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {group.items.map(item => (
                                <div key={item} className="flex items-center gap-2">
                                  <span className="text-xs flex-1">{item}</span>
                                  <Input type="number" min={0} max={100} value={scores[item] || ""} onChange={e => setScores({...scores, [item]: Number(e.target.value)})} className="w-20 h-8 text-xs" placeholder="1-100" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="life_skills" className="space-y-3">
                        {LIFE_SKILLS_CRITERIA.map(group => (
                          <div key={group.category}>
                            <p className="text-sm font-semibold text-[#7B1F3A] dark:text-[#D4AF37] mb-2">{group.category}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {group.items.map(item => (
                                <div key={item} className="flex items-center gap-2">
                                  <span className="text-xs flex-1">{item}</span>
                                  <Input type="number" min={0} max={100} value={scores[item] || ""} onChange={e => setScores({...scores, [item]: Number(e.target.value)})} className="w-20 h-8 text-xs" placeholder="1-100" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>

                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                        <div><p className="text-gray-500">Rated Items</p><p className="font-bold text-[#1A1A2E] dark:text-gray-100">{computed.totalRated}</p></div>
                        <div><p className="text-gray-500">Job Perf Avg</p><p className="font-bold text-[#1A1A2E] dark:text-gray-100">{computed.jobAvg || "—"}</p></div>
                        <div><p className="text-gray-500">Life Skills Avg</p><p className="font-bold text-[#1A1A2E] dark:text-gray-100">{computed.lifeAvg || "—"}</p></div>
                        <div><p className="text-gray-500">Overall</p><p className="font-bold text-[#7B1F3A] dark:text-[#D4AF37]">{computed.overall || "—"}</p></div>
                      </div>
                    </div>

                    <div><Label>Comments / Recommendations</Label><Textarea value={comments} onChange={e => setComments(e.target.value)} rows={3} /></div>

                    <Button type="submit" className="w-full bg-[#7B1F3A] hover:bg-[#7B1F3A]/90" disabled={!selectedStudentId || computed.totalRated === 0 || createMut.isPending}>
                      {createMut.isPending ? "Saving..." : `Submit Evaluation (Overall: ${computed.overall || "—"})`}
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
            { label: "Total", value: String(stats.total), color: "bg-gray-100 text-gray-600" },
            { label: "Completed", value: String(stats.completed), color: "bg-emerald-100 text-emerald-600" },
            { label: "Pending", value: String(stats.pending), color: "bg-amber-100 text-amber-600" },
            { label: "Avg Score", value: String(stats.avgScore), color: "bg-blue-100 text-blue-600" },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-xl font-bold text-[#1A1A2E] dark:text-gray-100 mt-1">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      {isCoordinator && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by student name..." className="pl-9" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ── Evaluations List ── */}
      <div className="grid gap-3">
        {(isCoordinator ? allEvals : isStudent ? myEvals : evaluations)?.map((ev: any) => (
          <Card key={ev.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedEval(ev); setViewOpen(true) }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#1A1A2E] dark:text-gray-100">{ev.student?.name || `Evaluation #${ev.id}`}</p>
                    <p className="text-xs text-gray-400">{ev.hteName || "N/A"} · {new Date(ev.createdAt).toLocaleDateString()}</p>
                    {ev.scores && ev.scores.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ev.scores.slice(0, 5).map((s: any) => (
                          <span key={s.id} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {s.criteriaName}: {s.rating}
                          </span>
                        ))}
                        {ev.scores.length > 5 && <span className="text-[10px] text-gray-400">+{ev.scores.length - 5} more</span>}
                      </div>
                    )}
                    {ev.overallGrade && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">Overall:</span>
                        <span className="text-sm font-bold text-[#1A1A2E] dark:text-gray-100">{ev.overallGrade}</span>
                        <span className={`text-[10px] font-medium ${getRatingInfo(Number(ev.overallGrade)).color}`}>
                          ({getRatingInfo(Number(ev.overallGrade)).desc})
                        </span>
                      </div>
                    )}
                    {ev.aiSummary && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="w-3 h-3" /> AI Summary Available
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </CardContent>
          </Card>
        ))}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                    <p className="text-lg font-bold text-[#1A1A2E] dark:text-gray-100">{selectedEval.overallGrade || "N/A"}</p>
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
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-emerald-50 dark:from-purple-900/20 dark:to-emerald-900/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">AI Summary</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedEval.aiSummary}</p>
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
                        <div key={s.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 border border-gray-100 dark:border-gray-700">
                          <p className="text-[10px] text-gray-500 truncate">{s.criteriaName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-[#1A1A2E] dark:text-gray-100">{s.rating}</span>
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
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedEval.comments.replace(/\[COORDINATOR_[^\]]+\]/g, "").trim()}
                    </div>
                  </div>
                )}

                {/* Print & Export Buttons */}
                <div className="flex gap-2">
                  <Button onClick={() => handleOfficialPrint(selectedEval)} variant="outline" size="sm">
                    <Printer className="w-4 h-4 mr-1.5" /> Print Official Form
                  </Button>
                  <Button onClick={() => exportOfficialPDF(selectedEval)} variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-1.5" /> Export PDF
                  </Button>
                </div>

                {/* Coordinator Actions */}
                {isCoordinator && (
                  <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
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
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCheck className="w-4 h-4" /> Approved by Coordinator
                  </div>
                )}
                {selectedEval.comments?.includes("[COORDINATOR_STATUS: RETURNED]") && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
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