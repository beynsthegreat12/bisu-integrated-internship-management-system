import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Building2, Plus, MapPin, User } from 'lucide-react'

export default function HTEsPage() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', address: '', collegeId: '' })

  const { data: htes, refetch } = trpc.hte.list.useQuery({})
  const createMutation = trpc.hte.create.useMutation({ onSuccess: () => { refetch(); setOpen(false) } })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ name: formData.name, address: formData.address, collegeId: Number(formData.collegeId) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">HTE Partners</h1>
          <p className="text-gray-500 mt-1">Manage Host Training Establishments.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90">
              <Plus className="w-4 h-4 mr-2" /> Add HTE
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add HTE Partner</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
              <div><Label>Address</Label><Textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={2} /></div>
              <div><Label>College ID</Label><Input type="number" value={formData.collegeId} onChange={e => setFormData({...formData, collegeId: e.target.value})} required /></div>
              <Button type="submit" className="w-full bg-[#7B1F3A] hover:bg-[#7B1F3A]/90">Add HTE</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(!htes || htes.length === 0) ? (
          <Card className="border-0 shadow-sm col-span-full"><CardContent className="py-12 text-center text-gray-400">
            <Building2 className="w-10 h-10 mx-auto mb-3" />
            <p>No HTEs registered</p>
          </CardContent></Card>
        ) : (
          htes.map((hte) => (
            <Card key={hte.id} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{hte.name}</p>
                    {hte.address && <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{hte.address}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {hte.college && <span className="text-xs text-gray-400">{hte.college.name}</span>}
                      {hte.supervisor && <span className="text-xs text-gray-400 flex items-center gap-1"><User className="w-3 h-3" />{hte.supervisor.name}</span>}
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
