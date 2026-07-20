import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MapPin, Loader2 } from "lucide-react"

type AddressValue = {
  region: string
  province: string
  municipality: string
  barangay: string
}

type AddressSelectorProps = {
  value: AddressValue
  onChange: (value: AddressValue) => void
  disabled?: boolean
}

async function fetchApi(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`)
  return res.json()
}

export default function AddressSelector({ value, onChange, disabled }: AddressSelectorProps) {
  const [regions, setRegions] = useState<Array<{ code: string; name: string }>>([])
  const [provinces, setProvinces] = useState<Array<{ code: string; name: string }>>([])
  const [municipalities, setMunicipalities] = useState<Array<{ code: string; name: string }>>([])
  const [barangays, setBarangays] = useState<Array<{ code: string; name: string }>>([])
  const [loading, setLoading] = useState({ regions: false, provinces: false, muns: false, brgys: false })

  // Load regions on mount
  useEffect(() => {
    setLoading(prev => ({ ...prev, regions: true }))
    fetchApi("https://psgc.gitlab.io/api/regions/")
      .then(data => {
        const sorted = (data as Array<{ code: string; name: string }>)
          .map(r => ({ code: r.code, name: r.name }))
          .sort((a, b) => a.name.localeCompare(b.name))
        setRegions(sorted)
      })
      .catch(console.error)
      .finally(() => setLoading(prev => ({ ...prev, regions: false })))
  }, [])

  // Load provinces when region changes
  useEffect(() => {
    if (!value.region) { setProvinces([]); return }
    setLoading(prev => ({ ...prev, provinces: true }))
    fetchApi(`https://psgc.gitlab.io/api/regions/${value.region}/provinces/`)
      .then(data => {
        const sorted = (data as Array<{ code: string; name: string }>)
          .map(p => ({ code: p.code, name: p.name }))
          .sort((a, b) => a.name.localeCompare(b.name))
        setProvinces(sorted)
      })
      .catch(console.error)
      .finally(() => setLoading(prev => ({ ...prev, provinces: false })))
  }, [value.region])

  // Load municipalities when province changes
  useEffect(() => {
    if (!value.province) { setMunicipalities([]); return }
    setLoading(prev => ({ ...prev, muns: true }))
    fetchApi(`https://psgc.gitlab.io/api/provinces/${value.province}/cities-municipalities/`)
      .then(data => {
        const sorted = (data as Array<{ code: string; name: string }>)
          .map(m => ({ code: m.code, name: m.name }))
          .sort((a, b) => a.name.localeCompare(b.name))
        setMunicipalities(sorted)
      })
      .catch(console.error)
      .finally(() => setLoading(prev => ({ ...prev, muns: false })))
  }, [value.province])

  // Load barangays when municipality changes
  useEffect(() => {
    if (!value.municipality) { setBarangays([]); return }
    setLoading(prev => ({ ...prev, brgys: true }))
    fetchApi(`https://psgc.gitlab.io/api/cities-municipalities/${value.municipality}/barangays/`)
      .then(data => {
        const sorted = (data as Array<{ code: string; name: string }>)
          .map(b => ({ code: b.code, name: b.name }))
          .sort((a, b) => a.name.localeCompare(b.name))
        setBarangays(sorted)
      })
      .catch(console.error)
      .finally(() => setLoading(prev => ({ ...prev, brgys: false })))
  }, [value.municipality])

  function update(field: keyof AddressValue, val: string) {
    const next = { ...value, [field]: val }
    // Reset cascading fields
    if (field === "region") { next.province = ""; next.municipality = ""; next.barangay = "" }
    if (field === "province") { next.municipality = ""; next.barangay = "" }
    if (field === "municipality") { next.barangay = "" }
    onChange(next)
  }

  // Determine selected names for display
  const regionName = regions.find(r => r.code === value.region)?.name || ""
  const provName = provinces.find(p => p.code === value.province)?.name || ""
  const munName = municipalities.find(m => m.code === value.municipality)?.name || ""
  const brgyName = barangays.find(b => b.code === value.barangay)?.name || ""

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="w-4 h-4 text-[#7B1F3A]" />
        <Label className="text-sm font-semibold text-[#1A1A2E]">Philippine Address</Label>
      </div>

      {/* Full address display */}
      {(value.region || value.province || value.municipality || value.barangay) && (
        <div className="p-3 rounded-lg bg-[#7B1F3A]/5 border border-[#7B1F3A]/10 text-sm text-gray-700">
          <span className="font-medium">Selected:</span>{" "}
          {[brgyName, munName, provName, regionName].filter(Boolean).join(", ")}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Region */}
        <div>
          <Label className="text-xs text-gray-500">Region</Label>
          <Select value={value.region} onValueChange={v => update("region", v)} disabled={disabled || loading.regions}>
            <SelectTrigger className="h-9 text-sm">
              {loading.regions ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
              <SelectValue placeholder="Select region..." />
            </SelectTrigger>
            <SelectContent>
              {regions.map(r => (
                <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Province */}
        <div>
          <Label className="text-xs text-gray-500">Province</Label>
          <Select value={value.province} onValueChange={v => update("province", v)} disabled={disabled || !value.region || loading.provinces}>
            <SelectTrigger className="h-9 text-sm">
              {loading.provinces ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
              <SelectValue placeholder={value.region ? "Select province..." : "Select region first"} />
            </SelectTrigger>
            <SelectContent>
              {provinces.map(p => (
                <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Municipality */}
        <div>
          <Label className="text-xs text-gray-500">Municipality / City</Label>
          <Select value={value.municipality} onValueChange={v => update("municipality", v)} disabled={disabled || !value.province || loading.muns}>
            <SelectTrigger className="h-9 text-sm">
              {loading.muns ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
              <SelectValue placeholder={value.province ? "Select municipality..." : "Select province first"} />
            </SelectTrigger>
            <SelectContent>
              {municipalities.map(m => (
                <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Barangay */}
        <div>
          <Label className="text-xs text-gray-500">Barangay</Label>
          <Select value={value.barangay} onValueChange={v => update("barangay", v)} disabled={disabled || !value.municipality || loading.brgys}>
            <SelectTrigger className="h-9 text-sm">
              {loading.brgys ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
              <SelectValue placeholder={value.municipality ? "Select barangay..." : "Select municipality first"} />
            </SelectTrigger>
            <SelectContent>
              {barangays.map(b => (
                <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hidden input for full address string */}
      <input type="hidden" name="region" value={value.region} />
      <input type="hidden" name="province" value={value.province} />
      <input type="hidden" name="municipality" value={value.municipality} />
      <input type="hidden" name="barangay" value={value.barangay} />
    </div>
  )
}