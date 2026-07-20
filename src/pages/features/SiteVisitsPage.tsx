import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar, Plus, MapPin } from 'lucide-react'

export default function SiteVisitsPage() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ studentId: '', hteId: '', visitDate: '', notes: '' })

  const { data: visits, refetch } = trpc.siteVisit.list.useQuery({})
  const createMutation = trpc.siteVisit.create.useMutation({ onSuccess: () => { refetch(); setOpen(false) } })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ studentId: Number(formData.studentId), hteId: Number(formData.hteId), visitDate: formData.visitDate, notes: formData.notes })
  }

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Site Visits</h1>
          <p className="text-gray-500 mt-1">Schedule and track coordinator site visits.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90">
              <Plus className="w-4 h-4 mr-2" /> Schedule Visit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule Site Visit</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Student ID</Label><Input type="number" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} required /></div>
              <div><Label>HTE ID</Label><Input type="number" value={formData.hteId} onChange={e => setFormData({...formData, hteId: e.target.value})} required /></div>
              <div><Label>Visit Date</Label><Input type="date" value={formData.visitDate} onChange={e => setFormData({...formData, visitDate: e.target.value})} required /></div>
              <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} /></div>
              <Button type="submit" className="w-full bg-[#7B1F3A] hover:bg-[#7B1F3A]/90">Schedule</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(!visits || visits.length === 0) ? (
          <Card className="border-0 shadow-sm col-span-full"><CardContent className="py-12 text-center text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-3" />
            <p>No site visits scheduled</p>
          </CardContent></Card>
        ) : (
          visits.map((visit) => (
            <Card key={visit.id} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={statusColors[visit.status]}>{visit.status}</Badge>
                  <p className="text-sm text-gray-500">{visit.visitDate ? new Date(visit.visitDate).toLocaleDateString() : ''}</p>
                </div>
                <p className="font-semibold text-sm mb-1">{visit.student?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{visit.hte?.name || 'No HTE'}</p>
                {visit.notes && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{visit.notes}</p>}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
