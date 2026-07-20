import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Users, Plus, GraduationCap, Building2 } from 'lucide-react'

export default function AssignmentsPage() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ studentId: '', hteId: '', coordinatorId: '', collegeId: '', location: '', startDate: '', endDate: '' })

  const { data: assignments, refetch } = trpc.assignment.list.useQuery({})
  const createMutation = trpc.assignment.create.useMutation({ onSuccess: () => { refetch(); setOpen(false) } })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      studentId: Number(formData.studentId),
      hteId: Number(formData.hteId),
      coordinatorId: Number(formData.coordinatorId),
      collegeId: Number(formData.collegeId),
      location: formData.location,
      startDate: formData.startDate,
      endDate: formData.endDate,
    })
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Internship Assignments</h1>
          <p className="text-gray-500 mt-1">Manage student internship assignments.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90">
              <Plus className="w-4 h-4 mr-2" /> New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>New Assignment</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Student ID</Label><Input type="number" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} required /></div>
                <div><Label>HTE ID</Label><Input type="number" value={formData.hteId} onChange={e => setFormData({...formData, hteId: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Coordinator ID</Label><Input type="number" value={formData.coordinatorId} onChange={e => setFormData({...formData, coordinatorId: e.target.value})} required /></div>
                <div><Label>College ID</Label><Input type="number" value={formData.collegeId} onChange={e => setFormData({...formData, collegeId: e.target.value})} required /></div>
              </div>
              <div><Label>Location</Label><Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Start Date</Label><Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
                <div><Label>End Date</Label><Input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full bg-[#7B1F3A] hover:bg-[#7B1F3A]/90">Create Assignment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {(!assignments || assignments.length === 0) ? (
          <Card className="border-0 shadow-sm"><CardContent className="py-12 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3" />
            <p>No assignments found</p>
          </CardContent></Card>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">{assignment.student?.name || `Student #${assignment.studentId}`}</p>
                      <Badge className={statusColors[assignment.status]}>{assignment.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">HTE</p>
                        <p className="flex items-center gap-1"><Building2 className="w-3 h-3" />{assignment.hte?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Coordinator</p>
                        <p>{assignment.coordinator?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">College</p>
                        <p className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{assignment.college?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Duration</p>
                        <p>{assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'N/A'} - {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
