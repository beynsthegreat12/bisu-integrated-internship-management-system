import { useState, useMemo, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Clock, Plus, Calendar, FileSpreadsheet, FileText, Printer,
  Pencil, Trash2, AlertCircle, CheckCircle2, XCircle, Clock4,
  TrendingUp, UserCheck, Sunrise, Sunset, Info,
  ArrowUpRight, ChevronRight, GripHorizontal
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AttendanceRecord = {
  id: number
  date: string
  amArrival: string | null
  amDeparture: string | null
  pmArrival: string | null
  pmDeparture: string | null
  undertimeHours: number | null
  undertimeMinutes: number | null
  status: "present" | "absent" | "late" | "excused"
  notes: string | null
  student?: { id: number; name: string | null }
}

type DayRender = {
  dayNum: number
  dayName: string
  dateStr: string
  isWeekend: boolean
  isToday: boolean
  rec: AttendanceRecord | undefined
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const statusBadge: Record<string, { label: string; bg: string; dot: string }> = {
  present:  { label: "Present",   bg: "bg-emerald-100 text-emerald-700 border-emerald-300", dot: "bg-emerald-500" },
  late:     { label: "Late",      bg: "bg-amber-100 text-amber-700 border-amber-300",        dot: "bg-amber-500" },
  absent:   { label: "Absent",    bg: "bg-red-100 text-red-700 border-red-300",              dot: "bg-red-500" },
  excused:  { label: "Excused",   bg: "bg-blue-100 text-blue-700 border-blue-300",           dot: "bg-blue-500" },
  approved: { label: "Approved",  bg: "bg-emerald-100 text-emerald-700 border-emerald-300",  dot: "bg-emerald-500" },
  pending:  { label: "Pending",   bg: "bg-yellow-100 text-yellow-700 border-yellow-300",     dot: "bg-yellow-500" },
}

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

function minToStr(m: number): string {
  const h = Math.floor(m / 60)
  const min = Math.round(m % 60)
  return `${h}h ${min}m`
}

function getDayMinutes(rec: AttendanceRecord | undefined): number {
  if (!rec) return 0
  let total = 0
  if (rec.amArrival && rec.amDeparture) total += timeToMin(rec.amDeparture) - timeToMin(rec.amArrival)
  if (rec.pmArrival && rec.pmDeparture) total += timeToMin(rec.pmDeparture) - timeToMin(rec.pmArrival)
  return Math.max(0, total)
}

function getLateMinutes(amArrival: string | null): number {
  if (!amArrival) return 0
  const late = timeToMin(amArrival) - timeToMin("08:00")
  return Math.max(0, late)
}

function getMonthDays(y: number, m: number): number {
  return new Date(y, m, 0).getDate()
}

// ── Component ──────────────────────────────────────────────────────────────
export default function DTRPage() {
  const { user } = useAuth()
  const isStudent = user?.role === "student"
  const isSupervisorOrAdmin = user?.role === "supervisor" || user?.role === "admin" || user?.role === "coordinator"

  const now = new Date()
  const [selMonth, setSelMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    date: "", amArrival: "", amDeparture: "", pmArrival: "", pmDeparture: "",
    status: "present" as string, notes: "",
  })
  const [remarksOpenId, setRemarksOpenId] = useState<number | null>(null)
  const [showFullMonth, setShowFullMonth] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedStudentView, setSelectedStudentView] = useState<number | null>(null)
  const [studentViewOpen, setStudentViewOpen] = useState(false)
  const [coordinatorRemarks, setCoordinatorRemarks] = useState("")

  const [year, month] = selMonth.split("-").map(Number)
  const daysInMonth = getMonthDays(year, month)

  // ── Queries ──
  const { data: attendanceList, refetch } = trpc.attendance.list.useQuery({
    startDate: `${selMonth}-01`,
    endDate: `${selMonth}-${String(daysInMonth).padStart(2, "0")}`,
  })
  const todayData = trpc.attendance.getToday.useQuery(undefined, { enabled: isStudent })
  const progressData = trpc.attendance.getInternshipProgress.useQuery(undefined, { enabled: isStudent })
  const remarksQuery = trpc.attendance.getSupervisorRemarks.useQuery(
    { attendanceId: remarksOpenId ?? 0 },
    { enabled: remarksOpenId !== null },
  )
  const { data: coordinatorData } = trpc.attendance.coordinatorList.useQuery({
    month: selMonth,
    search: searchTerm || undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
  }, { enabled: isSupervisorOrAdmin })
  const { data: coordStats } = trpc.attendance.getCoordinatorStats.useQuery({
    month: selMonth,
  }, { enabled: isSupervisorOrAdmin })
  const studentAttendanceQuery = trpc.attendance.getStudentAttendance.useQuery({
    studentId: selectedStudentView ?? 0,
    month: selMonth,
  }, { enabled: selectedStudentView !== null && studentViewOpen })
  const todayRec = todayData.data
  const progress = progressData.data
  const remarks = remarksQuery.data
  
  const isTodayLoading = todayData.isLoading
  const isProgressLoading = progressData.isLoading

  const createMut = trpc.attendance.create.useMutation({ onSuccess: () => { refetch(); closeDialog() } })
  const updateMut = trpc.attendance.update.useMutation({ onSuccess: () => { refetch(); closeDialog() } })
  const deleteMut = trpc.attendance.delete.useMutation({ onSuccess: () => refetch() })

  // ── Record Map ──
  const recordMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>()
    if (!attendanceList) return map
    for (const r of attendanceList as Array<Record<string, unknown>>) {
      const date = r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date)
      map.set(date, { ...r, date } as unknown as AttendanceRecord)
    }
    return map
  }, [attendanceList])

  // ── Calendar days ──
  const calendarDays: DayRender[] = useMemo(() => {
    const days: DayRender[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selMonth}-${String(d).padStart(2, "0")}`
      const dt = new Date(year, month - 1, d)
      const dayName = DAYS[dt.getDay()]
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
      days.push({
        dayNum: d, dayName, dateStr,
        isWeekend: dayName === "Sun",
        isToday: dateStr === todayStr,
        rec: recordMap.get(dateStr),
      })
    }
    return days
  }, [recordMap, selMonth, year, month, daysInMonth, now])

  // ── Totals (auto-computed) ──
  const totals = useMemo(() => {
    let totalMin = 0, lateMin = 0, undertimeMin = 0
    let present = 0, absent = 0, lateDays = 0
    for (const day of calendarDays) {
      if (!day.rec) continue
      totalMin += getDayMinutes(day.rec)
      const lm = getLateMinutes(day.rec.amArrival)
      lateMin += lm
      if (day.rec.undertimeHours) undertimeMin += day.rec.undertimeHours * 60 + (day.rec.undertimeMinutes || 0)
      if (day.rec.status === "present") present++
      else if (day.rec.status === "absent") absent++
      else if (day.rec.status === "late") lateDays++
    }
    const rate = calendarDays.filter(d => !d.isWeekend).length > 0
      ? Math.round((present / calendarDays.filter(d => !d.isWeekend).length) * 100)
      : 0
    return {
      totalHours: Math.round((totalMin / 60) * 100) / 100,
      lateMinutes: lateMin,
      undertimeMinutes: undertimeMin,
      presentDays: present,
      absentDays: absent,
      lateDays,
      attendanceRate: rate,
      totalDays: calendarDays.filter(d => !d.isWeekend && d.rec).length,
    }
  }, [calendarDays])

  // ── Today's Hours ──
  const todayObj = todayRec ? { ...todayRec, date: todayRec.date instanceof Date ? todayRec.date.toISOString().slice(0, 10) : String(todayRec.date) } as AttendanceRecord : undefined
  const todayMinutes = getDayMinutes(todayObj)
  const todayLateMin = getLateMinutes(todayObj?.amArrival ?? null)
  const todayStatus = todayRec?.status || undefined

  function closeDialog() {
    setDialogOpen(false); setEditId(null)
    setFormData({ date: "", amArrival: "", amDeparture: "", pmArrival: "", pmDeparture: "", status: "present", notes: "" })
  }

  function openEdit(rec: AttendanceRecord) {
    setEditId(rec.id)
    setFormData({
      date: rec.date, amArrival: rec.amArrival || "", amDeparture: rec.amDeparture || "",
      pmArrival: rec.pmArrival || "", pmDeparture: rec.pmDeparture || "",
      status: rec.status, notes: rec.notes || "",
    })
    setDialogOpen(true)
  }

  function handleDelete(id: number) {
    if (window.confirm("Delete this attendance record?")) deleteMut.mutate({ id })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.date) return
    const p = {
      date: formData.date,
      amArrival: formData.amArrival || undefined,
      amDeparture: formData.amDeparture || undefined,
      pmArrival: formData.pmArrival || undefined,
      pmDeparture: formData.pmDeparture || undefined,
      status: formData.status as any,
      notes: formData.notes || undefined,
    }
    if (editId) updateMut.mutate({ id: editId, ...p })
    else createMut.mutate({ assignmentId: 1, ...p })
  }

  // ── Generate CS Form No. 48 HTML for print ──
  function generateFormHTML(): string {
    const name = user?.name || "_______________________"
    const studentId = user?.email || user?.unionId || "N/A"
    const monthLabel = `${MONTHS[month - 1]} ${year}`

    let rows = ""
    let tAM = 0, tPM = 0
    const days = getMonthDays(year, month)

    for (let d = 1; d <= days; d++) {
      const ds = `${selMonth}-${String(d).padStart(2, "0")}`
      const rec = recordMap.get(ds)
      const dt = new Date(year, month - 1, d)
      const dn = dt.toLocaleString("en-US", { weekday: "short" })

      if (dn === "Sun" || dn === "Sat") {
        const label = dn === "Sun" ? "Sunday" : "Saturday"
        rows += `<tr><td>${d}</td><td colspan="4" class="wek">${label}</td><td></td><td></td><td></td></tr>`
        continue
      }

      const ai = rec?.amArrival || "", ao = rec?.amDeparture || ""
      const pi = rec?.pmArrival || "", po = rec?.pmDeparture || ""
      if (ai && ao) tAM += timeToMin(ao) - timeToMin(ai)
      if (pi && po) tPM += timeToMin(po) - timeToMin(pi)
      const totalStr = ai && ao ? minToStr(timeToMin(ao) - timeToMin(ai)) : ""
      const utStr = rec?.undertimeHours ? `${rec.undertimeHours}h ${rec.undertimeMinutes}m` : ""
      const lm = getLateMinutes(ai)

      rows += `<tr><td>${d}</td><td>${ai}</td><td>${ao}</td><td>${pi}</td><td>${po}</td><td>${totalStr}</td><td>${lm > 0 ? lm+"m" : ""}</td><td>${utStr}</td></tr>`
    }

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4 portrait; margin: 8mm 14mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Times New Roman',Times,serif; font-size:8.5pt; color:#000; line-height:1.25; }
  .fc { max-width:180mm; margin:0 auto; }
  .hdr { text-align:center; margin-bottom:4pt; }
  .hdr .fno { font-size:8pt; font-weight:bold; }
  .hdr .tit { font-size:13pt; font-weight:bold; margin:2pt 0; }
  .hdr .div { font-size:8pt; }
  .ir { display:flex; justify-content:space-between; margin-bottom:2pt; font-size:9pt; }
  .ir .lb { font-weight:bold; }
  .hi { margin:4pt 0; font-size:8pt; }
  .hi .b { font-weight:bold; }
  table { width:100%; border-collapse:collapse; font-size:7.5pt; margin:4pt 0; page-break-inside:avoid; break-inside:avoid; }
  th, td { border:1px solid #000; padding:1.5pt 2pt; text-align:center; }
  th { background:#ddd; font-weight:bold; font-size:7pt; }
  .wek { color:#888; font-style:italic; font-size:7pt; }
  .tr td { font-weight:bold; background:#eee; }
  .cert { margin-top:6pt; font-size:8pt; text-align:justify; page-break-inside:avoid; break-inside:avoid; }
  .ss { display:flex; justify-content:space-between; margin-top:10pt; page-break-inside:avoid; break-inside:avoid; }
  .sb { text-align:center; width:45%; }
  .sl { border-top:1px solid #000; width:100%; margin-bottom:2pt; padding-top:2pt; }
  .sn { font-weight:bold; font-size:8pt; }
  .slb { font-size:7pt; }
  .vs { margin-top:8pt; page-break-inside:avoid; break-inside:avoid; }
  .vs .vt { font-weight:bold; font-size:8pt; }
  .fn { text-align:center; margin-top:6pt; font-size:6pt; color:#666; }
</style>
</head>
<body>
<div class="fc">
  <div class="hdr">
    <div class="fno">Civil Service Form No. 48</div>
    <div class="tit">DAILY TIME RECORD</div>
    <div class="div">-----o0o-----</div>
  </div>

  <div class="ir">
    <span><span class="lb">NAME:</span> ${name.toUpperCase()}</span>
    <span><span class="lb">Student ID:</span> ${studentId}</span>
  </div>
  <div class="ir">
    <span><span class="lb">For the month of</span> ${monthLabel}</span>
    <span></span>
  </div>

  <div class="hi">
    <span class="b">Official hours for arrival and departure:</span><br>
    &nbsp;&nbsp;Regular days: 8:00 AM - 12:00 NN &nbsp;&nbsp; 1:00 PM - 5:00 PM<br>
    &nbsp;&nbsp;Saturdays: 8:00 AM - 12:00 NN
  </div>

  <table>
    <thead>
      <tr><th rowspan="2" style="width:5%">Day</th><th colspan="2" style="width:26%">A.M.</th><th colspan="2" style="width:26%">P.M.</th><th style="width:11%">Total</th><th style="width:9%">Late</th><th style="width:14%">Undertime</th></tr>
      <tr><th>Arrival</th><th>Departure</th><th>Arrival</th><th>Departure</th><th></th><th></th><th></th></tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="tr"><td colspan="2" style="text-align:right;padding-right:4pt;">TOTAL</td><td>${minToStr(tAM)}</td><td></td><td>${minToStr(tPM)}</td><td></td><td></td><td></td></tr>
    </tbody>
  </table>

  <div class="cert">
    I certify on my honor that the above is a true and correct report of the hours of work performed, record of which was made daily at the time of arrival and departure from office.
  </div>

  <div class="ss">
    <div class="sb"><div class="sl"></div><div class="sn">${name}</div><div class="slb">(Signature over Printed Name)</div></div>
    <div class="sb"><div class="sl"></div><div class="sn">SUPERVISOR</div><div class="slb">(Supervisor over Printed Name)</div></div>
  </div>

  <div class="vs">
    <div class="vt">VERIFIED as to the prescribed office hours:</div>
    <div class="sb" style="margin-top:6pt;width:100%;">
      <div class="sl" style="width:50%;margin:0 auto 2pt;"></div>
      <div class="sn">JOYMARIE A. BALABAT, MS</div>
      <div class="slb">In Charge</div>
    </div>
  </div>

  <div class="fn">BISU Integrated Internship Management System — Candijay Campus</div>
</div>
</body>
</html>`
  }

  // ── PDF Export (Official CS Form No. 48) ──
  async function exportPDF() {
    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF("p", "mm", "a4")
    const pw = doc.internal.pageSize.getWidth()
    const l = 16

    const name = user?.name || "_______________________"
    const studentId = user?.email || user?.unionId || "N/A"
    const monthLabel = `${MONTHS[month - 1]} ${year}`

    // Header
    doc.setFont("times", "bold")
    doc.setFontSize(10); doc.text("Civil Service Form No. 48", l, 18)
    doc.setFontSize(16); doc.text("DAILY TIME RECORD", pw / 2, 26, { align: "center" })
    doc.setFontSize(10); doc.text("-----o0o-----", pw / 2, 32, { align: "center" })

    // Name & Month
    doc.setFont("times", "normal")
    doc.setFontSize(11)
    doc.text(`NAME: ${name.toUpperCase()}`, l, 42)
    doc.text(`Student ID: ${studentId}`, pw - l, 42, { align: "right" })
    doc.text(`For the month of ${monthLabel}`, l, 49)

    // Official hours
    doc.setFont("times", "bold")
    doc.text("Official hours for arrival and departure:", l, 58)
    doc.setFont("times", "normal")
    doc.setFontSize(10)
    doc.text("Regular days:    8:00 AM - 12:00 NN    1:00 PM - 5:00 PM", l + 6, 65)
    doc.text("Saturdays:       8:00 AM - 12:00 NN", l + 6, 71)

    // Table
    const { default: autoTable } = await import("jspdf-autotable")
    const body: string[][] = []
    let tAM = 0, tPM = 0

    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${selMonth}-${String(d).padStart(2, "0")}`
      const rec = recordMap.get(ds)
      const dn = new Date(year, month - 1, d).toLocaleString("en-US", { weekday: "short" })
      if (dn === "Sun") { body.push([String(d), "Sunday", "Sunday", "Sunday", "Sunday", "", "", ""]); continue }
      if (dn === "Sat") { body.push([String(d), "Saturday", "Saturday", "Saturday", "Saturday", "", "", ""]); continue }
      const ai = rec?.amArrival || "", ao = rec?.amDeparture || ""
      const pi = rec?.pmArrival || "", po = rec?.pmDeparture || ""
      if (ai && ao) tAM += timeToMin(ao) - timeToMin(ai)
      if (pi && po) tPM += timeToMin(po) - timeToMin(pi)
      const totalStr = ai && ao ? minToStr(timeToMin(ao) - timeToMin(ai)) : (pi && po ? minToStr(timeToMin(po) - timeToMin(pi)) : "")
      const lateMin = getLateMinutes(ai)
      body.push([String(d), ai, ao, pi, po, totalStr, lateMin > 0 ? lateMin + "m" : "", rec?.undertimeHours ? `${rec.undertimeHours}h ${rec.undertimeMinutes}m` : ""])
    }

    body.push(["", "", "", "", "", "", "", ""])
    body.push(["TOTAL", "", minToStr(tAM), "", minToStr(tPM), "", "", ""])

    autoTable(doc, {
      startY: 77,
      head: [
        [{ content: "Day", rowSpan: 2 }, { content: "A.M.", colSpan: 2 }, { content: "P.M.", colSpan: 2 }, { content: "Total", rowSpan: 2 }, { content: "Late", rowSpan: 2 }, { content: "Undertime", rowSpan: 2 }],
        [{ content: "Arrival" }, { content: "Departure" }, { content: "Arrival" }, { content: "Departure" }],
      ],
      headStyles: { halign: "center", fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold", fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.2 },
      body,
      bodyStyles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.2 },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 30, halign: "center" },
        4: { cellWidth: 30, halign: "center" },
        5: { cellWidth: 20, halign: "center" },
        6: { cellWidth: 18, halign: "center" },
        7: { cellWidth: 22, halign: "center" },
      },
      margin: { left: l, right: l },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.2,
      didParseCell: (data) => {
        if (data.section === "body" && data.row.index === body.length - 1) {
          data.cell.styles.fontStyle = "bold"
        }
      },
    })

    // Certification
    const finalY = (doc as any).lastAutoTable.finalY || 200
    doc.setFont("times", "normal")
    doc.setFontSize(9)
    const certText = "I certify on my honor that the above is a true and correct report of the hours of work performed, record of which was made daily at the time of arrival and departure from office."
    const certLines = doc.splitTextToSize(certText, pw - l * 2)
    doc.text(certLines, l, finalY + 12)

    // Signature section
    const sigY = finalY + 30
    const leftSigX = l
    const rightSigX = pw / 2 + 10

    // Student signature
    doc.setDrawColor(0); doc.line(leftSigX, sigY, leftSigX + 65, sigY)
    doc.setFont("times", "bold"); doc.setFontSize(10)
    doc.text(name, leftSigX + 32, sigY + 6, { align: "center" })
    doc.setFont("times", "normal"); doc.setFontSize(9)
    doc.text("(Signature over Printed Name)", leftSigX + 32, sigY + 12, { align: "center" })

    // Supervisor signature
    doc.setDrawColor(0); doc.line(rightSigX, sigY, rightSigX + 65, sigY)
    doc.setFont("times", "bold"); doc.setFontSize(10)
    doc.text("SUPERVISOR", rightSigX + 32, sigY + 6, { align: "center" })
    doc.setFont("times", "normal"); doc.setFontSize(9)
    doc.text("(Supervisor over Printed Name)", rightSigX + 32, sigY + 12, { align: "center" })

    // Verified by
    const verY = sigY + 28
    doc.setFont("times", "bold"); doc.setFontSize(10)
    doc.text("VERIFIED as to the prescribed office hours:", l, verY)
    doc.setDrawColor(0); doc.line(pw / 2 - 40, verY + 10, pw / 2 + 40, verY + 10)
    doc.setFont("times", "bold"); doc.setFontSize(10)
    doc.text("JOYMARIE A. BALABAT, MS", pw / 2, verY + 16, { align: "center" })
    doc.setFont("times", "normal"); doc.setFontSize(9)
    doc.text("In Charge", pw / 2, verY + 22, { align: "center" })

    doc.save(`DTR_CSForm48_${monthLabel.replace(/\s/g, "_")}.pdf`)
  }

  // ── Excel Export ──
  async function exportExcel() {
    const XLSX = await import("xlsx")
    const data: Record<string, string>[] = calendarDays.map(d => ({
      Day: d.dayName,
      Date: String(d.dayNum).padStart(2, "0"),
      "AM Arrival": d.rec?.amArrival || (d.isWeekend ? "Weekend" : ""),
      "AM Departure": d.rec?.amDeparture || "",
      "PM Arrival": d.rec?.pmArrival || "",
      "PM Departure": d.rec?.pmDeparture || "",
      "Total Hours": d.rec ? minToStr(getDayMinutes(d.rec)) : "",
      "Late (min)": String(getLateMinutes(d.rec?.amArrival ?? null)),
      Undertime: d.rec?.undertimeHours ? `${d.rec.undertimeHours}h ${d.rec.undertimeMinutes}m` : "",
      Status: d.rec?.status || (d.isWeekend ? "Weekend" : ""),
      Notes: d.rec?.notes || "",
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, "DTR")
    ws["!cols"] = [
      { wch: 6 }, { wch: 6 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 30 }
    ]
    XLSX.writeFile(wb, `DTR_${selMonth}.xlsx`)
  }

  // ── Print (opens new window with official form) ──
  function handlePrint() {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow pop-ups for printing.")
      return
    }
    printWindow.document.write(generateFormHTML())
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print() }, 500)
  }

  // ── Calendar color ──
  function dayColor(d: DayRender): string {
    if (!d.rec) return d.isWeekend ? "bg-gray-100 text-gray-300" : "bg-white text-gray-400"
    if (d.rec.status === "present") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (d.rec.status === "late") return "bg-amber-50 text-amber-700 border-amber-200"
    if (d.rec.status === "absent") return "bg-red-50 text-red-700 border-red-200"
    return "bg-blue-50 text-blue-700 border-blue-200"
  }

  function dayDot(d: DayRender): string {
    if (!d.rec) return ""
    if (d.rec.status === "present") return "bg-emerald-500"
    if (d.rec.status === "late") return "bg-amber-500"
    if (d.rec.status === "absent") return "bg-red-500"
    return "bg-blue-500"
  }

  function renderTodayContent() {
    if (!isStudent) {
      return (
        <div className="flex items-center gap-3 py-6 text-gray-400">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Viewing mode</p>
            <p className="text-xs text-gray-400 mt-0.5">Attendance records for {MONTHS[month - 1]} {year}</p>
          </div>
        </div>
      )
    }

    if (isTodayLoading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-[72px] rounded-lg" />)}
        </div>
      )
    }

    if (!todayRec) {
      return (
        <div className="flex items-center gap-3 py-6 text-gray-400">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Sunrise className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">No attendance logged for today.</p>
            <p className="text-xs text-gray-400 mt-0.5">Click "Log DTR" to record your time.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">AM In</p>
          <p className="text-lg font-bold text-[#1A1A2E]">{todayRec.amArrival || "--"}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">AM Out</p>
          <p className="text-lg font-bold text-[#1A1A2E]">{todayRec.amDeparture || "--"}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">PM In</p>
          <p className="text-lg font-bold text-[#1A1A2E]">{todayRec.pmArrival || "--"}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">PM Out</p>
          <p className="text-lg font-bold text-[#1A1A2E]">{todayRec.pmDeparture || "--"}</p>
        </div>
        <div className="col-span-2 p-3 rounded-lg bg-emerald-50 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-xs text-gray-500">Total Hours Today</p>
            <p className="text-lg font-bold text-emerald-600">{minToStr(todayMinutes)}</p>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-amber-50 flex items-center gap-3">
          <Clock4 className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-xs text-gray-500">Late</p>
            <p className="text-lg font-bold text-amber-600">{todayLateMin > 0 ? `${todayLateMin}m` : "On time"}</p>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 flex items-center gap-3">
          <Badge className={`${todayStatus ? (statusBadge[todayStatus]?.bg || "") : ""}`}>
            {todayStatus ? (statusBadge[todayStatus]?.label || todayStatus) : "Unknown"}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Daily Time Record</h1>
          <p className="text-gray-500 mt-1">Civil Service Form No. 48 · {MONTHS[month - 1]} {year}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TooltipProvider>
            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" onClick={exportPDF}><FileText className="w-4 h-4 mr-1.5" /> PDF</Button></TooltipTrigger><TooltipContent>Export Civil Service Form No. 48</TooltipContent></Tooltip>
          </TooltipProvider>
          <Button variant="outline" size="sm" onClick={exportExcel}><FileSpreadsheet className="w-4 h-4 mr-1.5" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1.5" /> Print</Button>
          {isStudent && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90"><Plus className="w-4 h-4 mr-1.5" /> Log DTR</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>{editId ? "Edit DTR Entry" : "Log Daily Time Record"}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required /></div>
                    <div><Label>Status</Label>
                      <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="excused">Excused</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>AM Arrival</Label><Input type="time" value={formData.amArrival} onChange={e => setFormData({...formData, amArrival: e.target.value})} /></div>
                    <div><Label>AM Departure</Label><Input type="time" value={formData.amDeparture} onChange={e => setFormData({...formData, amDeparture: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>PM Arrival</Label><Input type="time" value={formData.pmArrival} onChange={e => setFormData({...formData, pmArrival: e.target.value})} /></div>
                    <div><Label>PM Departure</Label><Input type="time" value={formData.pmDeparture} onChange={e => setFormData({...formData, pmDeparture: e.target.value})} /></div>
                  </div>
                  <div><Label>Notes</Label><Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g. Official Leave, Holiday, Official Business..." /></div>
                  <Button type="submit" className="w-full bg-[#7B1F3A] hover:bg-[#7B1F3A]/90" disabled={createMut.isPending || updateMut.isPending}>
                    {(createMut.isPending || updateMut.isPending) ? "Saving..." : editId ? "Update Record" : "Save Record"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* ── Row 1: Today's Attendance + Internship Progress ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Attendance */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#7B1F3A]/10 flex items-center justify-center">
                <Sunrise className="w-5 h-5 text-[#7B1F3A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A2E] text-sm">Today's Attendance</h3>
                <p className="text-xs text-gray-400">
                  {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
            {renderTodayContent()}
          </CardContent>
        </Card>

        {/* Internship Progress */}
        {isStudent && (
          isProgressLoading ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-3 w-48 mb-4" />
                <Skeleton className="h-2.5 w-full mb-4 rounded-full" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-[52px] rounded-lg" />
                  <Skeleton className="h-[52px] rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A2E] text-sm">Internship Progress</h3>
                  <p className="text-xs text-gray-400">Required: {progress?.requiredHours || 486} hours</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-[#1A1A2E]">{progress?.completedHours?.toFixed(1) || 0}h</span>
                  <span className="text-gray-500">{progress?.progress || 0}%</span>
                </div>
                <Progress value={progress?.progress || 0} className="h-2.5 bg-gray-100 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-[#7B1F3A] [&>[data-slot=progress-indicator]]:to-[#D4AF37]" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="p-2.5 rounded-lg bg-emerald-50">
                  <p className="text-[10px] text-gray-500">Completed</p>
                  <p className="text-sm font-bold text-emerald-600">{progress?.completedHours?.toFixed(1) || 0}h</p>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50">
                  <p className="text-[10px] text-gray-500">Remaining</p>
                  <p className="text-sm font-bold text-amber-600">{progress?.remainingHours?.toFixed(1) || 486}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        }
      </div>

      {/* ── Row 2: Attendance Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Present Days", value: String(totals.presentDays), icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Late Count", value: String(totals.lateDays), icon: Clock4, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Absent Days", value: String(totals.absentDays), icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
          { label: "Undertime", value: minToStr(totals.undertimeMinutes), icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Total Hours", value: `${totals.totalHours}h`, icon: Sunrise, color: "text-violet-600", bg: "bg-violet-100" },
          { label: "Attendance Rate", value: `${totals.attendanceRate}%`, icon: GripHorizontal, color: "text-[#7B1F3A]", bg: "bg-[#7B1F3A]/10" },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                  <p className="text-lg font-bold text-[#1A1A2E] mt-0.5">{s.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Row 3: Calendar + Month ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <Input type="month" value={selMonth} onChange={e => setSelMonth(e.target.value)} className="w-48" />
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{totals.totalDays} logged day{totals.totalDays !== 1 ? "s" : ""}</span>
          <button
            onClick={() => setShowFullMonth(!showFullMonth)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              showFullMonth
                ? "bg-[#7B1F3A]/10 text-[#7B1F3A] border-[#7B1F3A]/30"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {showFullMonth ? "Show Recorded Only" : "View Full Month"}
          </button>
        </div>
      </div>

      {/* ── Row 4: Attendance Calendar ── */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1A1A2E]">Attendance Calendar</h3>
            <span className="text-[10px] text-gray-400">{MONTHS[month - 1]} {year}</span>
          </div>
        </div>
        <CardContent className="p-3 sm:p-5">
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1 uppercase tracking-wider">{d}</div>
            ))}
            {/* Empty cells before first day */}
            {Array.from({ length: new Date(year, month - 1, 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {calendarDays.map(d => (
              <TooltipProvider key={d.dayNum}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`
                      relative p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm font-medium border text-center cursor-default transition-all hover:shadow-sm
                      ${d.isToday ? "ring-2 ring-[#7B1F3A]/40" : ""}
                      ${dayColor(d)}
                    `}>
                      <span className="hidden sm:inline">{d.dayNum}</span>
                      <span className="sm:hidden">{d.dayNum}</span>
                      {d.rec && <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${dayDot(d)}`} />}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {d.rec ? (
                      <div className="space-y-0.5">
                        <p className="font-medium">{d.dayName}, {MONTHS[month - 1]} {d.dayNum}</p>
                        <p>AM: {d.rec.amArrival || "--"} → {d.rec.amDeparture || "--"}</p>
                        <p>PM: {d.rec.pmArrival || "--"} → {d.rec.pmDeparture || "--"}</p>
                        <p>Hours: {minToStr(getDayMinutes(d.rec))}</p>
                        <p>Status: {statusBadge[d.rec.status]?.label}</p>
                      </div>
                    ) : (
                      <p>{d.isWeekend ? "Weekend" : "No record"}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Late</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Absent</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Weekend</span>
          </div>
        </CardContent>
      </Card>

      {/* ── Row 5: Monthly DTR Table ── */}
      <Card className="border-0 shadow-sm overflow-hidden print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-3 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Day</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Date</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">AM In</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">AM Out</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">PM In</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">PM Out</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Total</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Late (min)</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Undertime</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Notes / Remarks</th>
                {isSupervisorOrAdmin && <th className="px-3 py-3 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {(showFullMonth ? calendarDays : calendarDays.filter(d => d.rec)).map(d => {
                const mins = getDayMinutes(d.rec)
                const lateMins = getLateMinutes(d.rec?.amArrival ?? null)
                return (
                  <tr key={d.dayNum} className={`border-b hover:bg-gray-50/50 transition-colors ${d.isWeekend ? "bg-gray-50/30" : d.isToday ? "bg-[#7B1F3A]/[0.02]" : ""}`}>
                    <td className="px-3 py-3 text-gray-500 text-xs font-medium">{d.dayName}</td>
                    <td className={`px-3 py-3 font-medium ${d.isWeekend ? "text-gray-400" : d.isToday ? "text-[#7B1F3A]" : "text-[#1A1A2E]"}`}>
                      {String(d.dayNum).padStart(2, "0")}
                      {d.isToday && <span className="ml-1.5 text-[10px] text-[#7B1F3A] font-semibold">Today</span>}
                    </td>
                    <td className="px-3 py-3">{d.rec?.amArrival || (d.isWeekend ? <span className="text-gray-300 text-xs">--</span> : "")}</td>
                    <td className="px-3 py-3">{d.rec?.amDeparture || (d.isWeekend ? <span className="text-gray-300 text-xs">--</span> : "")}</td>
                    <td className="px-3 py-3">{d.rec?.pmArrival || (d.isWeekend ? <span className="text-gray-300 text-xs">--</span> : "")}</td>
                    <td className="px-3 py-3">{d.rec?.pmDeparture || (d.isWeekend ? <span className="text-gray-300 text-xs">--</span> : "")}</td>
                    <td className="px-3 py-3 font-medium text-gray-700">{mins > 0 ? minToStr(mins) : ""}</td>
                    <td className="px-3 py-3">
                      {lateMins > 0 ? (
                        <span className="text-amber-600 font-medium">{lateMins}m</span>
                      ) : d.rec?.amArrival ? (
                        <span className="text-emerald-500 text-xs">0</span>
                      ) : ""}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">
                      {d.rec?.undertimeHours ? `${d.rec.undertimeHours}h ${d.rec.undertimeMinutes}m` : ""}
                    </td>
                    <td className="px-3 py-3">
                      {d.rec ? (
                        <Badge className={`text-[10px] px-2 py-0.5 font-medium ${statusBadge[d.rec.status]?.bg || ""}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge[d.rec.status]?.dot || ""} inline-block mr-1`} />
                          {statusBadge[d.rec.status]?.label}
                        </Badge>
                      ) : d.isWeekend ? <span className="text-xs text-gray-300">Weekend</span> : ""}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500 max-w-[150px]">
                      <div className="flex items-center gap-1">
                        <span className="truncate">{d.rec?.notes || ""}</span>
                      {d.rec && (d.rec.notes || (isSupervisorOrAdmin && d.rec.status === "excused")) && (
                        <button 
                          onClick={() => setRemarksOpenId(d.rec!.id)} 
                          className="text-[#7B1F3A] hover:text-[#9B2D4A] shrink-0 ml-1 transition-colors"
                          title="View remarks"
                        >
                          <Info className="w-3 h-3" />
                        </button>
                      )}
                      </div>
                    </td>
                    {isSupervisorOrAdmin && d.rec && (
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(d.rec!)} className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(d.rec!.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
              {/* Totals row */}
              <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
                <td colSpan={6} className="px-3 py-3 text-xs text-gray-600 text-right">Monthly Totals</td>
                <td className="px-3 py-3 text-[#1A1A2E]">{minToStr(Math.round(totals.totalHours * 60))}</td>
                <td className="px-3 py-3 text-amber-600">{totals.lateMinutes > 0 ? `${totals.lateMinutes}m` : "0"}</td>
                <td className="px-3 py-3 text-blue-600">{totals.undertimeMinutes > 0 ? minToStr(totals.undertimeMinutes) : "0"}</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Supervisor Remarks Dialog ── */}
      <Dialog open={remarksOpenId !== null} onOpenChange={(open) => { if (!open) setRemarksOpenId(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#7B1F3A]" />
              Supervisor Remarks
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-[80px]">
            {remarksQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ) : remarks ? (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                <p>{remarks}</p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-gray-50 text-sm text-gray-500 text-center">
                <p>No remarks from supervisor yet.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          @page { margin: 12mm; size: legal; }
          .shadow-sm { box-shadow: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  )
}