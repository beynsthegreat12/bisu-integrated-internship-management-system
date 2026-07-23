import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router"
import { useAuth } from "@/hooks/useAuth"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { GraduationCap, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

export default function Login() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const utils = trpc.useUtils()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      setError(null)
      await utils.auth.me.invalidate()
      navigate("/")
    },
    onError: (err) => {
      setError(err.message || "Login failed. Please try again.")
    },
  })

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/")
    }
  }, [isAuthenticated, authLoading, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Please enter your email or student ID")
      return
    }
    if (!password) {
      setError("Please enter your password")
      return
    }

    loginMutation.mutate({ email: email.trim(), password })
  }

  const isSubmitting = loginMutation.isPending

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3">
      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Soft blurred gradient circles - corners/edges only */}
      {/* Top-left maroon glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#7B1E3A] opacity-[0.08] blur-[120px] pointer-events-none" />
      {/* Bottom-right gold glow */}
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#D4AF37] opacity-[0.06] blur-[120px] pointer-events-none" />
      {/* Top-right light gray accent */}
      <div className="absolute -top-20 right-20 w-[300px] h-[300px] rounded-full bg-gray-300 opacity-[0.05] blur-[100px] pointer-events-none" />
      {/* Bottom-left maroon accent */}
      <div className="absolute bottom-40 -left-20 w-[250px] h-[250px] rounded-full bg-[#7B1E3A] opacity-[0.04] blur-[100px] pointer-events-none" />
      {/* Right edge gold accent */}
      <div className="absolute top-1/2 -translate-y-1/2 -right-20 w-[200px] h-[400px] rounded-full bg-[#D4AF37] opacity-[0.04] blur-[80px] pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Login Card */}
        <Card className="border border-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-7">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Welcome back</h2>
              <p className="text-sm text-slate-500 mt-1 font-normal">
                Sign in to your account to continue
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Student ID */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email or Student ID
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email or student ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="username"
                  className="h-10 text-sm border-slate-200/80 focus:border-[#7B1E3A]/40 focus:ring-[#7B1E3A]/20 transition-all duration-200"
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#7B1E3A] hover:text-[#9B2D4A] font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    className="h-10 text-sm pr-10 border-slate-200/80 focus:border-[#7B1E3A]/40 focus:ring-[#7B1E3A]/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={isSubmitting}
                  className="data-[state=checked]:bg-[#7B1E3A] data-[state=checked]:border-[#7B1E3A]"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-slate-600 cursor-pointer select-none"
                >
                  Remember me
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-gradient-to-r from-[#7B1E3A] to-[#9B2D4A] hover:from-[#6B1930] hover:to-[#8B253E] text-white font-semibold text-sm shadow-lg shadow-[#7B1E3A]/20 transition-all duration-200 hover:shadow-xl hover:shadow-[#7B1E3A]/25 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-5">
          <p className="text-[11px] text-slate-400 tracking-wide">
            BISU Integrated Internship Management System — Candijay Campus
          </p>
          <p className="text-[10px] text-slate-300 mt-0.5">Version 1.0</p>
        </div>
      </div>
    </div>
  )
}