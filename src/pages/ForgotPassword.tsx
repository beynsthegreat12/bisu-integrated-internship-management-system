import { useState } from "react"
import { Link } from "react-router"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, CheckCircle2, Loader2, AlertCircle } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [devToken, setDevToken] = useState("")

  const resetMut = trpc.password.forgotPassword.useMutation({
    onSuccess: (data) => {
      setSubmitted(true)
      if (data.devToken) setDevToken(data.devToken)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    resetMut.mutate({ email: email.trim() })
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3">
        <Card className="w-full max-w-md border border-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <CardContent className="p-7 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Check Your Email</h2>
            <p className="text-sm text-slate-500 mt-2">
              If that email is registered, we've sent a password reset link.
            </p>

            {/* Dev mode: show the token */}
            {devToken && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
                <p className="font-medium text-amber-800 mb-1">🔧 DEV MODE</p>
                <p className="text-amber-700 text-xs mb-2">Your reset token (copy this):</p>
                <code className="block p-2 bg-white rounded text-xs break-all font-mono border">
                  {devToken}
                </code>
                <p className="text-amber-600 text-xs mt-2">
                  Go to: <Link to={`/reset-password?token=${devToken}`} className="underline font-medium">
                    Reset Password Page
                  </Link>
                </p>
              </div>
            )}

            <Link to="/login">
              <Button variant="outline" className="mt-6 w-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3">
      {/* Decorative background */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#7B1E3A] opacity-[0.08] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#D4AF37] opacity-[0.06] blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        <Card className="border border-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white/95 backdrop-blur-sm">
          <CardContent className="p-7">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#7B1E3A]/10 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-[#7B1E3A]" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Forgot Password?</h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            {resetMut.error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{resetMut.error.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={resetMut.isPending}
                  className="h-10 text-sm"
                  autoFocus
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={resetMut.isPending || !email.trim()}
                className="w-full h-10 bg-gradient-to-r from-[#7B1E3A] to-[#9B2D4A] hover:from-[#6B1930] hover:to-[#8B253E] text-white font-semibold shadow-lg shadow-[#7B1E3A]/20"
              >
                {resetMut.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-[#7B1E3A] hover:text-[#9B2D4A] font-medium inline-flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </Link>
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