export interface Specimen {
  idx: string
  type: string
  season: string
  catLabel: string
  colorway: string
  materials: string
  origin: string
  name: string
  sku: string
  priceFmt: string
  wishLabel: string
}

export interface ExperienceEntry {
  id: string | number
  name: string
  accentWord?: string
  designation: string
  time: string
}

export interface SkillEntry {
  label: string
  color: string
  fullTitle: string
  description: string
}
