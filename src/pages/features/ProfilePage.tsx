import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Calendar, Clock } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()

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
              <Badge className="mt-1 bg-blue-100 text-blue-700">
                {user?.role?.replace("_", " ").toUpperCase() || "N/A"}
              </Badge>
            </div>
          </div>
        </div>
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
                  <p className="text-sm font-medium text-[#1A1A2E]">N/A</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Sign In</p>
                  <p className="text-sm font-medium text-[#1A1A2E]">N/A</p>
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
              <Badge className="bg-purple-100 text-purple-700">
                {user?.role?.replace("_", " ").toUpperCase() || "N/A"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}