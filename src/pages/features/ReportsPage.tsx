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
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText, Plus, Calendar, FileSpreadsheet, Printer, Search,
  Pencil, Trash2, AlertCircle, CheckCircle2, XCircle, Clock4,
  TrendingUp, UserCheck, Sunrise, Info, Download, Upload,
  GripHorizontal, Eye, Filter, X, Image as ImageIcon,
  Users, Building2, ClipboardCheck, ChevronDown
} from "lucide-react"

const statusConfig: Record<string, { label: string; bg: string; dot: string; icon: any }> = {
  pending:  { label: "Pending",  bg: "bg-yellow-100 text-yellow-700 border-yellow-300",  dot: "bg-yellow-500",  icon: Clock4 },
  approved: { label: "Approved", bg: "bg-emerald-100 text-emerald-700 border-emerald-300", dot: "bg-emerald-500", icon: CheckCircle2 },
  rejected: { label: "Rejected", bg: "bg-red-100 text-red-700 border-red-300",           dot: "bg-red-500",    icon: XCircle },
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function ReportsPage() {
  const { user } = useAuth()
  const isStudent = user?.role === "student"
  const isCoordinator = user?.role === "coordinator" || user?.role === "sipp_coordinator" || user?.role === "admin"

  const now = new Date()
  const [selMonth, setSelMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [coordinatorRemarks, setCoordinatorRemarks] = useState("")
  const [formData, setFormData] = useState({
    date: "", description: "", remarks: "", filePath: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterStudent, setFilterStudent] = useState<string>("all")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })

  const [year, month] = selMonth.split("-").map(Number)

  // ── Queries ──
  const { data: reports, refetch } = trpc.report.list.useQuery({})
  const { data: allReports, refetch: refetchAll } = trpc.report.coordinatorList.useQuery({
    status: filterStatus !== "all" ? filterStatus : undefined,
    month: selMonth,
    search: searchTerm || undefined,
  }, { enabled: isCoordinator })
  const { data: stats, refetch: refetchStats } = trpc.report.getCoordinatorStats.useQuery(undefined, { enabled: isCoordinator })
  const { data: students } = trpc.report.getStudents.useQuery(undefined, { enabled: isCoordinator })
  const { data: studentInfo } = trpc.report.getStudentInfo.useQuery(undefined, { enabled: isStudent })

  const createMut = trpc.report.create.useMutation({
    onSuccess: () => { refetch(); closeDialog() }
  })
  const reviewMut = trpc.report.review.useMutation({
    onSuccess: () => { refetch(); refetchAll(); refetchStats(); setReviewOpen(false); setCoordinatorRemarks("") }
  })
  const deleteMut = trpc.report.delete.useMutation({
    onSuccess: () => refetch()
  })

  // ── Stats ──
  const localStats = useMemo(() => {
    if (!reports) return { total: 0, pending: 0, approved: 0, rejected: 0 }
    return {
      total: reports.length,
      pending: reports.filter((r: any) => r.status === "pending").length,
      approved: reports.filter((r: any) => r.status === "approved").length,
      rejected: reports.filter((r: any) => r.status === "rejected").length,
    }
  }, [reports])

  function closeDialog() {
    setDialogOpen(false)
    setFormData({ date: "", description: "", remarks: "", filePath: "" })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.date || !formData.description) return
    createMut.mutate({
      date: formData.date,
      description: formData.description,
      remarks: formData.remarks || undefined,
      filePath: formData.filePath || undefined,
    })
  }

  function handleReview(status: "approved" | "rejected") {
    if (!selectedReport) return
    reviewMut.mutate({ id: selectedReport.id, status, remarks: coordinatorRemarks || undefined })
  }

  function handleDelete(id: number) {
    if (window.confirm("Delete this report?")) deleteMut.mutate({ id })
  }

  // ── Generate BISU Monthly Report HTML ──
  function generateReportHTML(data?: any[], studentName?: string, hte?: string): string {
    const name = studentName || user?.name || "__________________"
    const course = user?.email || "N/A"
    const dept = studentInfo?.user?.college?.name || "College of Sciences"
    const company = hte || studentInfo?.assignment?.hte?.name || "N/A"
    const monthLabel = `${MONTHS[month - 1]} ${year}`
    const daysInMonth = new Date(year, month, 0).getDate()

    const repData = data || reports || []
    const daysAttended = repData.filter((r: any) => {
      if (!r.date) return false
      const d = new Date(r.date)
      return d.getMonth() === month - 1 && d.getFullYear() === year
    }).length || 0

    let rows = ""
    const filtered = repData.filter((r: any) => {
      if (!r.date) return false
      const d = new Date(r.date)
      return d.getMonth() === month - 1 && d.getFullYear() === year
    }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    filtered.forEach((r: any, i: number) => {
      const d = new Date(r.date)
      rows += `<tr>
        <td>${i + 1}</td>
        <td>${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
        <td style="text-align:left;padding-left:6pt;">${r.description}</td>
        <td><span style="color:${r.status === 'approved' ? '#16a34a' : r.status === 'rejected' ? '#dc2626' : '#ca8a04'}">${r.status.toUpperCase()}</span></td>
      </tr>`
    })

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4 portrait; margin: 15mm 18mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Times New Roman',Times,serif; font-size:10pt; color:#000; line-height:1.35; }
  .fc { max-width:175mm; margin:0 auto; }
  .header { text-align:center; margin-bottom:10pt; border-bottom:2px solid #000; padding-bottom:6pt; }
  .header .tit { font-size:14pt; font-weight:bold; }
  .header .sub { font-size:10pt; margin-top:2pt; }
  .header .div { font-size:9pt; margin-top:1pt; }
  .info-table { width:100%; border-collapse:collapse; margin:6pt 0; font-size:9.5pt; }
  .info-table td { padding:2pt 4pt; vertical-align:top; }
  .info-table .lb { font-weight:bold; width:110pt; }
  .info-table .ul { border-bottom:1px solid #000; padding:0 4pt; }
  table.data { width:100%; border-collapse:collapse; font-size:9pt; margin:10pt 0; }
  table.data th, table.data td { border:1px solid #000; padding:3pt 4pt; text-align:center; }
  table.data th { background:#ddd; font-weight:bold; font-size:8.5pt; }
  .cert { margin-top:10pt; font-size:9pt; text-align:justify; }
  .sig-section { display:flex; justify-content:space-between; margin-top:20pt; }
  .sig-block { text-align:center; width:45%; }
  .sig-line { border-top:1px solid #000; width:100%; margin-bottom:3pt; padding-top:3pt; }
  .sig-name { font-weight:bold; font-size:9pt; }
  .sig-label { font-size:8pt; }
  .footer { text-align:center; margin-top:8pt; font-size:7pt; color:#666; }
</style>
</head>
<body>
<div class="fc">
  <div class="header">
    <div class="tit">BISU Integrated Internship Management System</div>
    <div class="sub">MONTHLY REPORT OF THE OJT TRAINEE</div>
    <div class="div">Candijay Campus</div>
  </div>
  <table class="info-table">
    <tr><td class="lb">NAME OF TRAINEE:</td><td class="ul">${name.toUpperCase()}</td><td class="lb" style="width:80pt;">COURSE:</td><td class="ul">${course}</td></tr>
    <tr><td class="lb">DEPARTMENT:</td><td class="ul">${dept}</td><td class="lb">COMPANY:</td><td class="ul">${company}</td></tr>
    <tr><td class="lb">FOR THE MONTH OF:</td><td class="ul">${monthLabel}</td><td class="lb">DAYS ATTENDED:</td><td class="ul">${daysAttended} / ${daysInMonth}</td></tr>
  </table>
  <table class="data">
    <thead><tr><th style="width:6%">#</th><th style="width:18%">Date</th><th style="width:52%">Work Description / Accomplishments</th><th style="width:14%">Status</th></tr></thead>
    <tbody>
      ${rows || `<tr><td colspan="4" style="padding:20pt;color:#888;">No reports submitted for this month.</td></tr>`}
    </tbody>
  </table>
  <div class="cert">I certify on my honor that the above is a true and correct report of the activities performed during the period specified.</div>
  <div class="sig-section">
    <div class="sig-block"><div class="sig-line"></div><div class="sig-name">${name}</div><div class="sig-label">(Signature over Printed Name)</div></div>
    <div class="sig-block"><div class="sig-line"></div><div class="sig-name">COORDINATOR / SUPERVISOR</div><div class="sig-label">(Signature over Printed Name)</div></div>
  </div>
  <div class="footer">BISU Integrated Internship Management System — Candijay Campus</div>
</div>
</body>
</html>`
  }

  async function exportPDF() {
    const { default: jsPDF } = await import("jspdf")
    const { default: autoTable } = await import("jspdf-autotable")
    const doc = new jsPDF("p", "mm", "a4")
    const pw = doc.internal.pageSize.getWidth()
    const l = 16

    const name = user?.name || "__________________"
    const course = user?.email || "N/A"
    const dept = studentInfo?.user?.college?.name || "College of Sciences"
    const company = studentInfo?.assignment?.hte?.name || "N/A"
    const monthLabel = `${MONTHS[month - 1]} ${year}`
    const daysInMonth = new Date(year, month, 0).getDate()
    const daysAttended = reports?.filter((r: any) => {
      if (!r.date) return false; const d = new Date(r.date)
      return d.getMonth() === month - 1 && d.getFullYear() === year
    }).length || 0

    doc.setFont("times", "bold"); doc.setFontSize(14)
    doc.text("BISU Integrated Internship Management System", pw / 2, 18, { align: "center" })
    doc.setFontSize(12); doc.text("MONTHLY REPORT OF THE OJT TRAINEE", pw / 2, 25, { align: "center" })
    doc.setFont("times", "normal"); doc.setFontSize(9)
    doc.text("Candijay Campus", pw / 2, 31, { align: "center" })

    doc.setFont("times", "normal"); doc.setFontSize(10)
    doc.text(`NAME OF TRAINEE: ${name.toUpperCase()}`, l, 42)
    doc.text(`COURSE: ${course}`, pw - l, 42, { align: "right" })
    doc.text(`DEPARTMENT: ${dept}`, l, 49)
    doc.text(`COMPANY: ${company}`, pw - l, 49, { align: "right" })
    doc.text(`FOR THE MONTH OF: ${monthLabel}`, l, 56)
    doc.text(`DAYS ATTENDED: ${daysAttended} / ${daysInMonth}`, pw - l, 56, { align: "right" })

    const body: string[][] = []
    if (reports) {
      const filtered = reports.filter((r: any) => {
        if (!r.date) return false; const d = new Date(r.date)
        return d.getMonth() === month - 1 && d.getFullYear() === year
      }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      filtered.forEach((r: any, i: number) => {
        const d = new Date(r.date)
        body.push([String(i + 1), d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), r.description, r.status.toUpperCase()])
      })
    }
    autoTable(doc, {
      startY: 64, head: [["#", "Date", "Work Description / Accomplishments", "Status"]],
      headStyles: { halign: "center", fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.2 },
      body, bodyStyles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.2 },
      columnStyles: { 0: { cellWidth: 12, halign: "center" }, 1: { cellWidth: 35, halign: "center" }, 2: { cellWidth: 100, halign: "left" }, 3: { cellWidth: 25, halign: "center" } },
      margin: { left: l, right: l },
    })

    const finalY = (doc as any).lastAutoTable.finalY || 150
    doc.setFont("times", "normal"); doc.setFontSize(9)
    doc.text("I certify on my honor that the above is a true and correct report of the activities performed during the period specified.", l, finalY + 14)
    const sigY = finalY + 30
    doc.setDrawColor(0); doc.line(l, sigY, l + 65, sigY)
    doc.setFont("times", "bold"); doc.setFontSize(10); doc.text(name, l + 32, sigY + 6, { align: "center" })
    doc.setFont("times", "normal"); doc.setFontSize(8); doc.text("(Signature over Printed Name)", l + 32, sigY + 12, { align: "center" })
    const rsx = pw / 2 + 10
    doc.setDrawColor(0); doc.line(rsx, sigY, rsx + 65, sigY)
    doc.setFont("times", "bold"); doc.setFontSize(10); doc.text("COORDINATOR / SUPERVISOR", rsx + 32, sigY + 6, { align: "center" })
    doc.setFont("times", "normal"); doc.setFontSize(8); doc.text("(Signature over Printed Name)", rsx + 32, sigY + 12, { align: "center" })
    doc.save(`Monthly_Report_${monthLabel.replace(/\s/g, "_")}.pdf`)
  }

  async function exportExcel() {
    const XLSX = await import("xlsx")
    const data = ((isCoordinator ? allReports : reports) || []).filter((r: any) => {
      if (!r.date) return false; const d = new Date(r.date)
      return d.getMonth() === month - 1 && d.getFullYear() === year
    }).map((r: any) => ({
      Student: r.student?.name || "N/A",
      Company: r.hteName || "N/A",
      Date: r.date ? new Date(r.date).toLocaleDateString() : "",
      Description: r.description,
      Status: r.status,
      Remarks: r.remarks || "",
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, "Reports")
    ws["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 60 }, { wch: 12 }, { wch: 30 }]
    XLSX.writeFile(wb, `Reports_${selMonth}.xlsx`)
  }

  function handlePrint() {
    const pw = window.open("", "_blank")
    if (!pw) { alert("Please allow pop-ups."); return }
    pw.document.write(generateReportHTML())
    pw.document.close(); pw.focus()
    setTimeout(() => pw.print(), 500)
  }

  const activeReports = isCoordinator ? allReports : reports
  const activeStats = isCoordinator ? stats : localStats

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">
            {isCoordinator ? "Accomplishment Reports" : "My Accomplishment Reports"}
          </h1>
          <p className="text-gray-500 mt-1">BISU Monthly OJT Trainee Report · {MONTHS[month - 1]} {year}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TooltipProvider>
            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" onClick={exportPDF}><FileText className="w-4 h-4 mr-1.5" /> PDF</Button></TooltipTrigger><TooltipContent>Export Monthly Report</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" onClick={exportExcel}><FileSpreadsheet className="w-4 h-4 mr-1.5" /> Excel</Button></TooltipTrigger><TooltipContent>Export to Excel</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1.5" /> Print</Button></TooltipTrigger><TooltipContent>Print Official Report</TooltipContent></Tooltip>
          </TooltipProvider>
          {isStudent && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90"><Plus className="w-4 h-4 mr-1.5" /> Add Report</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>Submit Accomplishment Report</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required /></div>
                    <div><Label>Status</Label><div className="h-10 flex items-center text-sm text-gray-500 bg-gray-50 rounded-lg px-3 border">Pending (Auto)</div></div>
                  </div>
                  <div><Label>Work Description</Label><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe your accomplishments..." rows={4} required /></div>
                  <div><Label>Remarks (optional)</Label><Textarea value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} placeholder="Any additional notes..." rows={2} /></div>
                  <div><Label>Upload Image (optional)</Label>
                    <div className="flex items-center gap-3">
                      <Input type="file" accept="image/*" className="text-sm" />
                      <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-[#7B1F3A] hover:bg-[#7B1F3A]/90" disabled={createMut.isPending}>
                    {createMut.isPending ? "Saving..." : "Save Report"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* ── Student Info Banner ── */}
      {isStudent && studentInfo && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-[#7B1F3A]/5 to-transparent">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Name</p><p className="font-semibold text-[#1A1A2E]">{studentInfo.user?.name || "N/A"}</p></div>
              <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Course</p><p className="font-semibold text-[#1A1A2E]">{studentInfo.user?.email || "N/A"}</p></div>
              <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Department</p><p className="font-semibold text-[#1A1A2E]">{studentInfo.user?.college?.name || "N/A"}</p></div>
              <div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Company / HTE</p><p className="font-semibold text-[#1A1A2E]">{studentInfo.assignment?.hte?.name || "N/A"}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Coordinator Dashboard Stats ── */}
      {isCoordinator && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Reports", value: String(stats.total), icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
            { label: "Pending Review", value: String(stats.pending), icon: Clock4, color: "text-yellow-600", bg: "bg-yellow-100" },
            { label: "Approved", value: String(stats.approved), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
            { label: "Rejected", value: String(stats.rejected), icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
            { label: "Approval Rate", value: `${stats.approvalRate}%`, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-100" },
            { label: "Students", value: String(stats.totalStudents), icon: Users, color: "text-[#7B1F3A]", bg: "bg-[#7B1F3A]/10" },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                    <p className={`text-lg font-bold mt-0.5 ${
                      s.label === "Pending Review" ? "text-yellow-600" : s.label === "Approved" ? "text-emerald-600" : s.label === "Rejected" ? "text-red-600" : s.label === "Approval Rate" ? "text-violet-600" : "text-[#1A1A2E]"
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

      {/* ── Student Summary Cards ── */}
      {isStudent && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Reports", value: String(localStats.total), icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
            { label: "Pending", value: String(localStats.pending), icon: Clock4, color: "text-yellow-600", bg: "bg-yellow-100" },
            { label: "Approved", value: String(localStats.approved), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
            { label: "Rejected", value: String(localStats.rejected), icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                    <p className={`text-2xl font-bold mt-0.5 ${s.label === "Pending" ? "text-yellow-600" : s.label === "Approved" ? "text-emerald-600" : s.label === "Rejected" ? "text-red-600" : "text-[#1A1A2E]"}`}>{s.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}><s.icon className="w-5 h-5" /></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <Calendar className="w-5 h-5 text-gray-500" />
          <Input type="month" value={selMonth} onChange={e => setSelMonth(e.target.value)} className="w-40" />
          {isCoordinator && (
            <>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search student..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-48 pl-8 text-sm"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <Filter className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {activeReports?.length || 0} report{(activeReports?.length || 0) !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Reports Table ── */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                {isCoordinator && <th className="px-4 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Student</th>}
                {isCoordinator && <th className="px-4 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Company</th>}
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Work Description</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Submitted</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(!activeReports || activeReports.length === 0) ? (
                <tr>
                  <td colSpan={isCoordinator ? 7 : 6} className="px-4 py-12 text-center text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2" />
                    <p>No reports found</p>
                    {isStudent && <p className="text-xs mt-1">Click "Add Report" to submit your first accomplishment report.</p>}
                  </td>
                </tr>
              ) : (
                activeReports.filter((r: any) => {
                  if (!r.date) return true
                  const d = new Date(r.date)
                  return d.getMonth() === month - 1 && d.getFullYear() === year
                }).map((report: any, i: number) => (
                  <tr key={report.id} className="border-b hover:bg-gray-50/50 transition-colors">
                    {isCoordinator && (
                      <>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#1A1A2E] text-xs">{report.student?.name || "N/A"}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{report.hteName || "N/A"}</td>
                      </>
                    )}
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {report.date ? new Date(report.date).toLocaleDateString() : "-"}
                    </td>
                    <td className={`px-4 py-3 text-xs text-gray-700 max-w-[200px] ${isCoordinator ? "max-w-[180px]" : ""}`}>
                      <div className="line-clamp-2">{report.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-[10px] px-2.5 py-0.5 font-medium border ${statusConfig[report.status]?.bg || "bg-gray-100 text-gray-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[report.status]?.dot || "bg-gray-400"} inline-block mr-1.5`} />
                        {statusConfig[report.status]?.label || report.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-400">
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setSelectedReport(report); setReviewOpen(true) }} className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {isStudent && report.status === "pending" && (
                          <button onClick={() => handleDelete(report.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── View / Review Dialog ── */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <ScrollArea className="max-h-[80vh] pr-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedReport?.status === "approved" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
                 selectedReport?.status === "rejected" ? <XCircle className="w-4 h-4 text-red-600" /> :
                 <Clock4 className="w-4 h-4 text-yellow-600" />}
                Report Details
              </DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-5">
                {/* Student Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Student</p>
                    <p className="text-sm font-semibold text-[#1A1A2E]">{selectedReport.student?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Date Submitted</p>
                    <p className="text-sm">{selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Report Date</p>
                    <p className="text-sm">{selectedReport.date ? new Date(selectedReport.date).toLocaleDateString() : "N/A"}</p>
                  </div>
                  {selectedReport.hteName && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Company / HTE</p>
                      <p className="text-sm text-gray-700">{selectedReport.hteName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Status</p>
                    <Badge className={`mt-1 text-xs ${statusConfig[selectedReport.status]?.bg || ""}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[selectedReport.status]?.dot || ""} inline-block mr-1.5`} />
                      {statusConfig[selectedReport.status]?.label || selectedReport.status}
                    </Badge>
                  </div>
                </div>

                {/* Work Description */}
                <div>
                  <Label className="text-[10px] text-gray-500 uppercase font-semibold">Work Description</Label>
                  <div className="mt-1 p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedReport.description}
                  </div>
                </div>

                {/* Student Remarks */}
                {selectedReport.remarks && (
                  <div>
                    <Label className="text-[10px] text-gray-500 uppercase font-semibold">Student Remarks</Label>
                    <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      {selectedReport.remarks}
                    </div>
                  </div>
                )}

                {/* Attached Images */}
                {selectedReport.filePath && (
                  <div>
                    <Label className="text-[10px] text-gray-500 uppercase font-semibold">Attached Image</Label>
                    <div className="mt-1">
                      {selectedReport.filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <a href={selectedReport.filePath} target="_blank" rel="noopener noreferrer">
                          <img
                            src={selectedReport.filePath}
                            alt="Student attachment"
                            className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200 object-cover"
                          />
                        </a>
                      ) : (
                        <a href={selectedReport.filePath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                          <Download className="w-4 h-4" /> Download Attachment
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Reviewer Info */}
                {selectedReport.reviewer && (
                  <div>
                    <Label className="text-[10px] text-gray-500 uppercase font-semibold">Reviewed By</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedReport.reviewer.name}</p>
                    {selectedReport.reviewedAt && (
                      <p className="text-xs text-gray-400">{new Date(selectedReport.reviewedAt).toLocaleString()}</p>
                    )}
                  </div>
                )}

                {/* Coordinator Section */}
                {isCoordinator && selectedReport.status === "pending" && (
                  <div className="space-y-4 pt-2 border-t border-gray-200">
                    <div>
                      <Label className="text-sm font-semibold text-[#1A1A2E]">
                        Coordinator Remarks <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={coordinatorRemarks}
                        onChange={e => setCoordinatorRemarks(e.target.value)}
                        placeholder="Add remarks before approving or rejecting..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500 uppercase font-semibold">Upload Annotated File (optional)</Label>
                      <Input type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="mt-1 text-sm" />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleReview("approved")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        disabled={reviewMut.isPending || !coordinatorRemarks.trim()}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button
                        onClick={() => handleReview("rejected")}
                        variant="destructive"
                        className="flex-1"
                        disabled={reviewMut.isPending || !coordinatorRemarks.trim()}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
                    {!coordinatorRemarks.trim() && (
                      <p className="text-xs text-amber-600 text-center">Please add remarks before approving or rejecting.</p>
                    )}
                  </div>
                )}

                {/* View-only for already-reviewed */}
                {isCoordinator && selectedReport.status !== "pending" && selectedReport.remarks && (
                  <div>
                    <Label className="text-[10px] text-gray-500 uppercase font-semibold">Coordinator Remarks</Label>
                    <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                      {selectedReport.remarks}
                    </div>
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