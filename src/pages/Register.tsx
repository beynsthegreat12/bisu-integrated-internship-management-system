import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft, GraduationCap } from "lucide-react"

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("student")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const registerMut = trpc.auth.register.useMutation({
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => navigate("/login"), 2000)
    },
    onError: (err) => {
      setError(err.message || "Registration failed")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !password) {
      setError("All fields are required")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    registerMut.mutate({
      name: name.trim(),
      email: email.trim(),
      password,
      role: role as any,
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3">
        <Card className="w-full max-w-md">
          <CardContent className="p-7 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Account Created!</h2>
            <p className="text-sm text-slate-500 mt-2">
              You can now sign in with your email and password.
            </p>
            <Link to="/login">
              <Button className="mt-6 w-full bg-[#7B1F3A] hover:bg-[#7B1F3A]/90">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#7B1E3A] opacity-[0.08] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#D4AF37] opacity-[0.06] blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        <Card className="border border-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white/95 backdrop-blur-sm">
          <CardContent className="p-7">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#7B1E3A]/10 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-6 h-6 text-[#7B1E3A]" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Create Account</h2>
              <p className="text-sm text-slate-500 mt-1">
                Sign up for the Internship Management System
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="h-10 text-sm"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@bisu.edu.ph"
                  required
                  className="h-10 text-sm"
                />
              </div>

              <div>
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="h-10 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="h-10 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={registerMut.isPending}
                className="w-full h-10 bg-gradient-to-r from-[#7B1E3A] to-[#9B2D4A] hover:from-[#6B1930] hover:to-[#8B253E] text-white font-semibold shadow-lg shadow-[#7B1E3A]/20"
              >
                {registerMut.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Account...</>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center mt-4">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-[#7B1E3A] hover:text-[#9B2D4A] font-medium">
                  Sign In
                </Link>
              </p>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-5 tracking-wide">
              BISU Integrated Internship Management System — Candijay Campus
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}