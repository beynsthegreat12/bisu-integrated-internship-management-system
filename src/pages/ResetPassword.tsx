import { useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Lock, CheckCircle2, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token") || ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: tokenStatus } = trpc.password.verifyToken.useQuery({ token }, { enabled: !!token })
  const resetMut = trpc.password.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => navigate("/login"), 3000)
    },
    onError: (err) => setError(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    resetMut.mutate({ token, newPassword })
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3">
        <Card className="w-full max-w-md">
          <CardContent className="p-7 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-800">Invalid Reset Link</h2>
            <p className="text-sm text-slate-500 mt-2">No reset token found. Please request a new password reset.</p>
            <Link to="/forgot-password">
              <Button variant="outline" className="mt-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Request Reset
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tokenStatus && !tokenStatus.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3">
        <Card className="w-full max-w-md">
          <CardContent className="p-7 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-800">
              {tokenStatus.expired ? "Token Expired" : "Invalid Token"}
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              {tokenStatus.expired
                ? "This reset link has expired. Please request a new one."
                : "This reset link is invalid. Please request a new one."}
            </p>
            <Link to="/forgot-password">
              <Button variant="outline" className="mt-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Request New Reset
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3">
        <Card className="w-full max-w-md">
          <CardContent className="p-7 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Password Reset!</h2>
            <p className="text-sm text-slate-500 mt-2">
              Your password has been changed successfully. Redirecting to login...
            </p>
            <Link to="/login">
              <Button variant="outline" className="mt-6 w-full">
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
                <Lock className="w-6 h-6 text-[#7B1E3A]" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Reset Password</h2>
              <p className="text-sm text-slate-500 mt-1">Enter your new password.</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={resetMut.isPending}
                    className="h-10 text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-sm font-medium text-slate-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={resetMut.isPending}
                  className="h-10 text-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={resetMut.isPending || !newPassword || !confirmPassword}
                className="w-full h-10 bg-gradient-to-r from-[#7B1E3A] to-[#9B2D4A] hover:from-[#6B1930] hover:to-[#8B253E] text-white font-semibold shadow-lg shadow-[#7B1E3A]/20"
              >
                {resetMut.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resetting...</>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-[#7B1E3A] hover:text-[#9B2D4A] font-medium inline-flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}