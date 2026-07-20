import { useState } from "react"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Users, Plus, Search, Shield, Mail, User, Building2,
  ChevronRight, GraduationCap, Phone
} from "lucide-react"

const roleColors: Record<string, string> = {
  student: "bg-blue-100 text-blue-700",
  coordinator: "bg-purple-100 text-purple-700",
  supervisor: "bg-green-100 text-green-700",
  sipp_coordinator: "bg-orange-100 text-orange-700",
  admin: "bg-red-100 text-red-700",
}

export default function UsersPage() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "student" as string, collegeId: "",
  })

  const { data: users, refetch } = trpc.user.list.useQuery({
    role: roleFilter !== "all" ? roleFilter : undefined,
    search: search || undefined,
  })
  const { data: stats } = trpc.user.stats.useQuery()
  const updateRoleMut = trpc.user.updateRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated!")
      refetch()
    },
    onError: (err) => toast.error(err.message),
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    // For now, we'll use the dev-login approach - in production this would call an API
    toast.success("User creation will be available via the dev-login endpoint")
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">User Management</h1>
          <p className="text-gray-500 mt-1">Manage system users and roles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90">
              <Plus className="w-4 h-4 mr-2" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@bisu.edu.ph"
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Default password"
                  required
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="sipp_coordinator">SIPP Coordinator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>College ID</Label>
                <Input
                  type="number"
                  value={formData.collegeId}
                  onChange={(e) => setFormData({...formData, collegeId: e.target.value})}
                  placeholder="1-4"
                />
              </div>
              <Button type="submit" className="w-full bg-[#7B1F3A] hover:bg-[#7B1F3A]/90">
                Create User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: String(stats?.total || 0), color: "bg-gray-100 text-gray-600" },
          { label: "Students", value: String(stats?.students || 0), color: "bg-blue-100 text-blue-600" },
          { label: "Coordinators", value: String(stats?.coordinators || 0), color: "bg-purple-100 text-purple-600" },
          { label: "Supervisors", value: String(stats?.supervisors || 0), color: "bg-green-100 text-green-600" },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold text-[#1A1A2E] mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="coordinator">Coordinator</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="sipp_coordinator">SIPP Coordinator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <div className="grid gap-3">
        {users?.map((u: any) => (
          <Card key={u.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    u.role === "student" ? "bg-blue-100" :
                    u.role === "coordinator" ? "bg-purple-100" :
                    u.role === "supervisor" ? "bg-green-100" :
                    u.role === "admin" ? "bg-red-100" : "bg-gray-100"
                  }`}>
                    <User className={`w-5 h-5 ${
                      u.role === "student" ? "text-blue-600" :
                      u.role === "coordinator" ? "text-purple-600" :
                      u.role === "supervisor" ? "text-green-600" :
                      u.role === "admin" ? "text-red-600" : "text-gray-600"
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#1A1A2E] truncate">{u.name || "Unnamed"}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{u.email || "No email"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge className={roleColors[u.role] || ""}>
                    {u.role?.replace("_", " ").toUpperCase()}
                  </Badge>
                  {u.college && (
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      {u.college.name}
                    </span>
                  )}
                  <Select
                    value={u.role}
                    onValueChange={(newRole) => updateRoleMut.mutate({ userId: u.id, role: newRole as any })}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="coordinator">Coordinator</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="sipp_coordinator">SIPP Coordinator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {users?.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-10 text-center text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2" />
              <p>No users found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}