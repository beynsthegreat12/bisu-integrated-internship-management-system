import { useState, useEffect } from "react"
import { trpc } from "@/providers/trpc"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Settings, Save, Clock, GraduationCap, Building2, Calendar,
  FileText, RefreshCw, Loader2, CheckCircle2, AlertCircle
} from "lucide-react"

const DEFAULT_SETTINGS = [
  { key: "required_hours", label: "Required Internship Hours", value: "486", description: "Total hours required for internship completion", icon: Clock },
  { key: "am_start_time", label: "AM Start Time", value: "08:00", description: "Official start of morning shift", icon: Clock },
  { key: "am_end_time", label: "AM End Time", value: "12:00", description: "End of morning shift", icon: Clock },
  { key: "pm_start_time", label: "PM Start Time", value: "13:00", description: "Official start of afternoon shift", icon: Clock },
  { key: "pm_end_time", label: "PM End Time", value: "17:00", description: "End of afternoon shift", icon: Clock },
  { key: "max_undertime_minutes", label: "Max Undertime (minutes)", value: "120", description: "Maximum allowed undertime before penalty", icon: AlertCircle },
  { key: "college_name", label: "College Name", value: "College of Sciences", description: "Name of the college/department", icon: GraduationCap },
  { key: "campus_name", label: "Campus Name", value: "Candijay Campus", description: "Campus location", icon: Building2 },
  { key: "academic_year", label: "Academic Year", value: "2025-2026", description: "Current academic year", icon: Calendar },
  { label: "Report Title", key: "report_title", value: "BISU Monthly OJT Trainee Report", description: "Title for accomplishment reports", icon: FileText },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)

  const { data: dbSettings, refetch } = trpc.settings.getAll.useQuery()
  const updateMut = trpc.settings.batchUpdate.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully!")
      refetch()
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save settings")
    },
  })

  // Load settings from DB or use defaults
  useEffect(() => {
    if (dbSettings) {
      const merged: Record<string, string> = {}
      for (const def of DEFAULT_SETTINGS) {
        const db = dbSettings.find((s: any) => s.key === def.key)
        merged[def.key] = db?.value || def.value
      }
      setSettings(merged)
      setLoaded(true)
    } else if (!loaded) {
      const defaults: Record<string, string> = {}
      for (const def of DEFAULT_SETTINGS) {
        defaults[def.key] = def.value
      }
      setSettings(defaults)
      setLoaded(true)
    }
  }, [dbSettings])

  const handleSave = () => {
    const updates = Object.entries(settings).map(([key, value]) => ({ key, value }))
    updateMut.mutate({ settings: updates })
  }

  const handleReset = () => {
    const defaults: Record<string, string> = {}
    for (const def of DEFAULT_SETTINGS) {
      defaults[def.key] = def.value
    }
    setSettings(defaults)
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#7B1F3A]" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] dark:text-gray-100">System Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure system-wide parameters and defaults.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} className="text-gray-600">
            <RefreshCw className="w-4 h-4 mr-2" /> Reset Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMut.isPending}
            className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90"
          >
            {updateMut.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save All</>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Groups */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#7B1F3A]" />
            Internship Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DEFAULT_SETTINGS.filter(s => s.key.includes("hours") || s.key.includes("time") || s.key.includes("undertime")).map((setting) => (
            <div key={setting.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <Label className="text-sm font-medium text-[#1A1A2E] dark:text-gray-200">{setting.label}</Label>
                <p className="text-xs text-gray-400 dark:text-gray-500">{setting.description}</p>
              </div>
              <Input
                value={settings[setting.key] || ""}
                onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                className="w-full sm:w-40 h-9 text-sm"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#7B1F3A]" />
            Institution Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DEFAULT_SETTINGS.filter(s => s.key.includes("college") || s.key.includes("campus") || s.key.includes("academic") || s.key.includes("report")).map((setting) => (
            <div key={setting.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <Label className="text-sm font-medium text-[#1A1A2E] dark:text-gray-200">{setting.label}</Label>
                <p className="text-xs text-gray-400 dark:text-gray-500">{setting.description}</p>
              </div>
              <Input
                value={settings[setting.key] || ""}
                onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                className="w-full sm:w-60 h-9 text-sm"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMut.isPending}
          size="lg"
          className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90"
        >
          {updateMut.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Save All Changes</>
          )}
        </Button>
      </div>
    </div>
  )
}