import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { trpc } from "@/providers/trpc"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User, Save, Shield, Calendar, Clock
} from "lucide-react"

export default function ProfilePage() {
  const { user, refresh } = useAuth()
  const utils = trpc.useUtils()

  const [name, setName] = useState(user?.name || "")
  const [phoneNum, setPhoneNum] = useState(user?.phoneNum || "")
  const [collegeId, setCollegeId] = useState<string>(String(user?.collegeId || ""))

  const updateMut = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      refresh()
      utils.user.getById.invalidate({ id: user?.id || 0 })
    },
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateMut.mutate({
      name: name || undefined,
      phoneNum: phoneNum || undefined,
      collegeId: collegeId ? Number(collegeId) : undefined,
    })
  }

  const roleColors: Record<string, string> = {
    student: "bg-blue-100 text-blue-700",
    coordinator: "bg-purple-100 text-purple-700",
    supervisor: "bg-green-100 text-green-700",
    sipp_coordinator: "bg-orange-100 text-orange-700",
    admin: "bg-red-100 text-red-700",
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#7B1F3A] to-[#9B2D4A] px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name || "User"}</h2>
              <p className="text-white/80 text-sm">{user?.email || ""}</p>
              <Badge className={`mt-1 ${roleColors[user?.role || ""] || ""}`}>
                {user?.role?.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="bg-gray-50" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  placeholder="e.g. 09123456789"
                />
              </div>
              <div>
                <Label>College / Department</Label>
                <Select value={collegeId} onValueChange={setCollegeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select college..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="1">College of Sciences</SelectItem>
                    <SelectItem value="2">College of Business and Management</SelectItem>
                    <SelectItem value="3">College of Teacher Education</SelectItem>
                    <SelectItem value="4">College of Fisheries and Marine Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <Button
              type="submit"
              className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90"
              disabled={updateMut.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMut.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="text-sm font-medium text-[#1A1A2E]">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Sign In</p>
                  <p className="text-sm font-medium text-[#1A1A2E]">
                    {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-sm font-medium text-[#1A1A2E] capitalize">
                    {user?.role?.replace("_", " ") || "N/A"}
                  </p>
                </div>
              </div>
              <Badge className={roleColors[user?.role || ""] || ""}>
                {user?.role?.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}