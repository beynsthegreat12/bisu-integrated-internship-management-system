// Philippine Standard Geographic Code (PSGC) API helper
// Uses the official PSGC API: https://psgc.gitlab.io/api/

const PSGC_BASE = "https://psgc.gitlab.io/api"

type PsgcItem = { code: string; name: string; regionName?: string }

export async function fetchRegions(): Promise<PsgcItem[]> {
  const res = await fetch(`${PSGC_BASE}/regions/`)
  if (!res.ok) throw new Error("Failed to fetch regions")
  const data = await res.json() as PsgcItem[]
  return data.map((r) => ({
    code: r.code,
    name: r.name,
    regionName: r.regionName || r.name,
  })).sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchProvinces(regionCode: string): Promise<PsgcItem[]> {
  const res = await fetch(`${PSGC_BASE}/regions/${regionCode}/provinces/`)
  if (!res.ok) throw new Error("Failed to fetch provinces")
  const data = await res.json() as PsgcItem[]
  return data.map((p) => ({
    code: p.code,
    name: p.name,
  })).sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchMunicipalities(provinceCode: string): Promise<PsgcItem[]> {
  const res = await fetch(`${PSGC_BASE}/provinces/${provinceCode}/cities-municipalities/`)
  if (!res.ok) throw new Error("Failed to fetch municipalities")
  const data = await res.json() as PsgcItem[]
  return data.map((m) => ({
    code: m.code,
    name: m.name,
  })).sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchBarangays(municipalityCode: string): Promise<PsgcItem[]> {
  const res = await fetch(`${PSGC_BASE}/cities-municipalities/${municipalityCode}/barangays/`)
  if (!res.ok) throw new Error("Failed to fetch barangays")
  const data = await res.json() as PsgcItem[]
  return data.map((b) => ({
    code: b.code,
    name: b.name,
  })).sort((a, b) => a.name.localeCompare(b.name))
}
