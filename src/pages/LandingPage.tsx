import { useState, useEffect } from "react"
import { Link } from "react-router"
import { GraduationCap, Menu, X, ChevronRight, Clock, FileText, ClipboardList, TrendingUp, Bell, BarChart3, CheckCircle2, ArrowRight, Star, ChevronDown, Users, Shield, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = ["Features", "For Roles", "Process", "About"]
const FEATURES = [
  { icon: Clock, title: "Daily Time Record", desc: "Civil Service Form No. 48 compliant attendance tracking with automated computation of hours, late, and undertime." },
  { icon: FileText, title: "Accomplishment Reports", desc: "Submit and review daily accomplishment reports with official BISU Monthly OJT Trainee Report format." },
  { icon: ClipboardList, title: "Evaluations", desc: "Comprehensive internship evaluation form with automated scoring, rating conversion, and supervisor feedback." },
  { icon: TrendingUp, title: "Progress Tracking", desc: "Real-time internship progress monitoring with visual indicators for completed vs required hours." },
  { icon: Bell, title: "Notifications", desc: "Stay updated with submission status, evaluation results, and important announcements." },
  { icon: BarChart3, title: "Analytics", desc: "Dashboard statistics showing attendance rates, approval rates, and overall internship performance." },
]

const ROLES = [
  { icon: GraduationCap, title: "Student", desc: "Log DTR, submit accomplishment reports, view evaluations, track internship progress, and manage tasks.", color: "from-emerald-500 to-emerald-600" },
  { icon: Users, title: "Coordinator", desc: "Monitor students, review reports, evaluate performance, manage HTE partners, and generate official forms.", color: "from-blue-500 to-blue-600" },
  { icon: Shield, title: "Supervisor", desc: "Fill out evaluation forms, rate intern performance, provide comments and recommendations.", color: "from-amber-500 to-amber-600" },
  { icon: Star, title: "Administrator", desc: "Full system oversight, user management, configuration, and access to all modules and analytics.", color: "from-violet-500 to-violet-600" },
]

const PROCESS_STEPS = [
  { step: "01", title: "Student Registration", desc: "Students register and get assigned to their HTE partner company with coordinator supervision." },
  { step: "02", title: "Daily Time Record", desc: "Log daily attendance with AM/PM time stamps. System auto-computes total hours, late, and undertime." },
  { step: "03", title: "Submit Reports", desc: "Submit daily accomplishment reports. Attach images and add remarks for coordinator review." },
  { step: "04", title: "Evaluation", desc: "Supervisors evaluate interns using the official BISU General Internship Evaluation Form." },
  { step: "05", title: "Coordinator Review", desc: "Coordinators review reports, approve/reject with remarks, and monitor overall progress." },
  { step: "06", title: "Completion", desc: "Upon completing required hours and requirements, interns receive their final evaluation and rating." },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1F3A] to-[#9B2D4A] flex items-center justify-center shadow-lg shadow-[#7B1F3A]/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-[#1A1A2E] text-sm">BISU Internship</span>
                <span className="block text-[10px] text-gray-500 -mt-0.5">Management System</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_ITEMS.map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`} className="text-sm font-medium text-gray-600 hover:text-[#7B1F3A] transition-colors">
                  {item}
                </a>
              ))}
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-[#7B1F3A]/30 text-[#7B1F3A] hover:bg-[#7B1F3A]/5">Sign In</Button>
              </Link>
              <Link to="/login">
                <Button size="sm" className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90 text-white shadow-md shadow-[#7B1F3A]/20">Get Started</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-3">
              {NAV_ITEMS.map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`} className="block text-sm font-medium text-gray-600 hover:text-[#7B1F3A] py-2" onClick={() => setMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1"><Button variant="outline" className="w-full border-[#7B1F3A]/30 text-[#7B1F3A]">Sign In</Button></Link>
                <Link to="/login" className="flex-1"><Button className="w-full bg-[#7B1F3A] hover:bg-[#7B1F3A]/90 text-white">Get Started</Button></Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#7B1F3A] opacity-[0.03] blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#D4AF37] opacity-[0.04] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7B1F3A]/5 border border-[#7B1F3A]/10 text-[#7B1F3A] text-xs font-medium mb-6">
              <GraduationCap className="w-3.5 h-3.5" />
              BISU Candijay Campus
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A2E] tracking-tight leading-tight">
              BISU Internship{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B1F3A] to-[#D4AF37]">Management</span>{" "}
              System
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
              A comprehensive platform for managing internship programs at Bohor Island State University — from daily time records and accomplishment reports to evaluations and progress tracking.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90 text-white px-8 h-12 text-base shadow-xl shadow-[#7B1F3A]/20 hover:shadow-2xl hover:shadow-[#7B1F3A]/30 transition-all duration-200 active:scale-[0.98]">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="px-8 h-12 text-base border-gray-300 hover:border-[#7B1F3A]/30 hover:text-[#7B1F3A]">
                  Learn More <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </a>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> CS Form 48</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time Tracking</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Official Reports</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold mb-4">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E]">Everything you need for internship management</h2>
            <p className="mt-4 text-gray-500">Powerful tools designed for students, coordinators, and supervisors to streamline the entire internship process.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={feature.title} className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-[#7B1F3A]/20 hover:shadow-xl hover:shadow-[#7B1F3A]/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B1F3A]/10 to-[#D4AF37]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-[#7B1F3A]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── User Roles Section ── */}
      <section id="for-roles" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-[#7B1F3A]/10 text-[#7B1F3A] text-xs font-semibold mb-4">User Roles</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E]">Designed for every role</h2>
            <p className="mt-4 text-gray-500">Tailored experiences for each participant in the internship program.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map((role) => (
              <div key={role.title} className="group relative p-6 rounded-2xl bg-white border border-gray-100 hover:border-transparent transition-all duration-300 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                    <role.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">{role.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{role.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process Section ── */}
      <section id="process" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold mb-4">Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E]">Internship Program Flow</h2>
            <p className="mt-4 text-gray-500">From registration to completion — a seamless journey for every intern.</p>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#7B1F3A] via-[#D4AF37] to-[#7B1F3A] opacity-20 hidden sm:block" />
            <div className="space-y-12">
              {PROCESS_STEPS.map((step, i) => (
                <div key={step.step} className="relative flex flex-col sm:flex-row gap-6 items-start group">
                  <div className="hidden sm:flex absolute left-0 w-16 h-16 rounded-full bg-white border-2 border-[#7B1F3A]/20 items-center justify-center z-10 group-hover:border-[#7B1F3A] transition-colors">
                    <span className="text-lg font-bold text-[#7B1F3A]">{step.step}</span>
                  </div>
                  <div className="sm:ml-24 flex-1 p-6 rounded-2xl bg-white border border-gray-100 hover:border-[#7B1F3A]/20 hover:shadow-lg transition-all duration-300">
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">Step {step.step}</span>
                    <h3 className="text-lg font-semibold text-[#1A1A2E] mt-1">{step.title}</h3>
                    <p className="text-sm text-gray-500 mt-2">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#7B1F3A]/10 text-[#7B1F3A] text-xs font-semibold mb-4">About</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E]">Bohol Island State University Internship Program</h2>
              <p className="mt-6 text-gray-500 leading-relaxed">
                The BISU Internship Program is designed to provide students with real-world experience in their chosen fields of study. Through partnerships with various Host Training Establishments (HTEs), students gain hands-on knowledge and skills that complement their academic learning.
              </p>
              <p className="mt-4 text-gray-500 leading-relaxed">
                The Integrated Internship Management System streamlines the entire process — from daily time tracking and accomplishment reporting to performance evaluation — ensuring a smooth and transparent internship experience for students, coordinators, supervisors, and administrators.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { value: "486+", label: "Required Hours" },
                  { value: "Real-time", label: "Progress Tracking" },
                  { value: "CS Form 48", label: "Official Format" },
                  { value: "Automated", label: "Computation" },
                ].map(stat => (
                  <div key={stat.label} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-sm font-bold text-[#7B1F3A]">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-[#7B1F3A]/5 to-[#D4AF37]/5 border border-[#7B1F3A]/10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7B1F3A] to-[#9B2D4A] flex items-center justify-center mb-6 shadow-xl shadow-[#7B1F3A]/20">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E]">BISU Candijay Campus</h3>
                <p className="text-sm text-gray-500 mt-2">College of Sciences · Integrated Internship Program</p>
                <div className="mt-6 space-y-3">
                  {[
                    "Automated DTR with CS Form No. 48 compliance",
                    "Monthly accomplishment report generation",
                    "General Internship Evaluation Form (F-AQA-INS-014)",
                    "Real-time internship progress monitoring",
                    "Digital submission and approval workflow",
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-[#D4AF37] opacity-[0.04] blur-[60px] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20 bg-gradient-to-r from-[#7B1F3A] to-[#9B2D4A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-4 text-[#D4AF37]/80 text-lg">Join BISU Internship Management System today and streamline your internship experience.</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="bg-white text-[#7B1F3A] hover:bg-gray-100 px-8 h-12 text-base shadow-xl">
                Sign In Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-12 text-base">
                Explore Features
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#1A1A2E] text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1F3A] to-[#9B2D4A] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm">BISU Internship</span>
                  <span className="block text-[10px] text-gray-500 -mt-0.5">Management System</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                A comprehensive internship management platform for Bohol Island State University — Candijay Campus.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {["Features", "For Roles", "Process", "About"].map(item => (
                  <li key={item}><a href={`#${item.toLowerCase().replace(/\s/g, "-")}`} className="text-sm hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Modules</h4>
              <ul className="space-y-2.5">
                {["Daily Time Record", "Accomplishment Reports", "Evaluations", "Progress Tracking"].map(item => (
                  <li key={item}><span className="text-sm hover:text-white transition-colors cursor-default">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">BISU</h4>
              <ul className="space-y-2.5 text-sm">
                <li>Candijay Campus</li>
                <li>College of Sciences</li>
                <li>Cogtong, Candijay, Bohol</li>
                <li>Philippines</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-600">
            <p>&copy; {new Date().getFullYear()} Bohol Island State University — Candijay Campus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}