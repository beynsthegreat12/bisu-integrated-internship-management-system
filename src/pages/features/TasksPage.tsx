import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
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

import { Plus, ArrowRight } from 'lucide-react'

export default function TasksPage() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', dueDate: '', studentId: '' })

  const { data: tasks, refetch } = trpc.task.list.useQuery({})
  const createMutation = trpc.task.create.useMutation({ onSuccess: () => { refetch(); setOpen(false); setFormData({ title: '', description: '', dueDate: '', studentId: '' }) } })
  const updateMutation = trpc.task.update.useMutation({ onSuccess: () => refetch() })

  const isSupervisor = user?.role === 'supervisor' || user?.role === 'admin'
  const isStudent = user?.role === 'student'

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ assignmentId: 1, title: formData.title, description: formData.description, dueDate: formData.dueDate, studentId: Number(formData.studentId) })
  }

  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateMutation.mutate({ id: taskId, status: newStatus as any })
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
    overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700' },
  }

  const columns = ['pending', 'in_progress', 'completed']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Task Management</h1>
          <p className="text-gray-500 mt-1">{isSupervisor ? 'Assign and manage intern tasks.' : 'View and complete your assigned tasks.'}</p>
        </div>
        {isSupervisor && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90">
                <Plus className="w-4 h-4 mr-2" /> Assign Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Assign New Task</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div><Label>Title</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} /></div>
                <div><Label>Due Date</Label><Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} /></div>
                <div><Label>Assign to Student</Label><Input type="number" placeholder="Student ID" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} required /></div>
                <Button type="submit" className="w-full bg-[#7B1F3A] hover:bg-[#7B1F3A]/90" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Assign Task'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Kanban-style board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((status) => (
          <div key={status} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm capitalize">{statusConfig[status].label}</h3>
              <Badge variant="secondary">{tasks?.filter(t => t.status === status).length || 0}</Badge>
            </div>
            <div className="space-y-3">
              {tasks?.filter(t => t.status === status).map((task) => (
                <Card key={task.id} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <p className="font-medium text-sm mb-2">{task.title}</p>
                    {task.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                      {isStudent && status !== 'completed' && (
                        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => handleStatusChange(task.id, status === 'pending' ? 'in_progress' : 'completed')}>
                          {status === 'pending' ? 'Start' : 'Complete'} <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
