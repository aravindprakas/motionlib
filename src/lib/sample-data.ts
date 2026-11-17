import type { Specimen, ExperienceEntry, SkillEntry } from '@/lib/types'

export const sampleSpecimens: Specimen[] = [
  {
    idx: '0042',
    type: 'OUTERWEAR',
    season: 'AW26',
    catLabel: 'OUTERWEAR',
    colorway: 'BONE / VERMILION',
    materials: '62% NYLON · 38% WOOL',
    origin: 'PORTUGAL',
    name: 'Foundry Shell Parka',
    sku: 'AR-OUT-0042',
    priceFmt: '₹18,900',
    wishLabel: '♡',
  },
  {
    idx: '0114',
    type: 'FOOTWEAR',
    season: 'AW26',
    catLabel: 'FOOTWEAR',
    colorway: 'BONE / VERMILION',
    materials: 'SUEDE · MESH · RUBBER',
    origin: 'ITALY',
    name: 'Index Runner',
    sku: 'AR-FTW-0114',
    priceFmt: '₹12,900',
    wishLabel: '♥',
  },
  {
    idx: '0208',
    type: 'BAGS',
    season: 'AW26',
    catLabel: 'BAGS',
    colorway: 'BONE / INK',
    materials: '18oz CANVAS · LEATHER',
    origin: 'INDIA',
    name: 'Manifest Tote 24L',
    sku: 'AR-BAG-0208',
    priceFmt: '₹7,400',
    wishLabel: '♡',
  },
  {
    idx: '0305',
    type: 'KNITWEAR',
    season: 'AW26',
    catLabel: 'KNITWEAR',
    colorway: 'OATMEAL',
    materials: '100% MERINO WOOL',
    origin: 'SCOTLAND',
    name: 'Registry Knit Crew',
    sku: 'AR-KNT-0305',
    priceFmt: '₹8,600',
    wishLabel: '♡',
  },
]

export const sampleCategories = [
  { no: '01', label: 'OUTERWEAR', countText: '18 SPECIMENS' },
  { no: '02', label: 'FOOTWEAR', countText: '12 SPECIMENS' },
  { no: '03', label: 'BAGS', countText: '9 SPECIMENS' },
  { no: '04', label: 'KNITWEAR', countText: '14 SPECIMENS' },
  { no: '05', label: 'TEES & TOPS', countText: '21 SPECIMENS' },
]

export const sampleManifestoPoints = [
  { label: 'FILED', text: 'Every piece numbered, measured and recorded before it ships.' },
  { label: 'MADE', text: 'Small runs in Portugal, Italy, Scotland & India. No deadstock theatre.' },
  { label: 'KEPT', text: '30-day returns. Repairs on record. Built for the long file.' },
]

export const sampleNavLinks = ['01 SHOP', '02 CATALOG', '03 SEARCH', '04 ACCOUNT']

export const sampleFooterIndexLinks = ['All Items', 'Category A', 'Category B', 'Search']
export const sampleFooterAccountLinks = ['My Orders', 'Wishlist', 'Track Order', 'Returns']
export const sampleSupportItems = ['Shipping & Delivery', 'Returns Policy', 'Size Guide', 'Contact']

export const sampleCartLines = [
  { idx: '01', name: 'Index Runner', sku: 'AR-FTW-0114', size: 'UK10', qty: 1, lineFmt: '₹12,900' },
  { idx: '02', name: 'Registry Knit Crew', sku: 'AR-KNT-0305', size: 'M', qty: 2, lineFmt: '₹17,200' },
]

export const sampleExperience: ExperienceEntry[] = [
  { id: 1, name: 'Foundry Studio', accentWord: 'Studio', designation: 'Product Engineer', time: '2024 — Present' },
  { id: 2, name: 'Northline Labs', accentWord: 'Labs', designation: 'Frontend Developer', time: '2022 — 2024' },
  { id: 3, name: 'Kettle & Co', accentWord: 'Co', designation: 'Junior Developer', time: '2021 — 2022' },
]

export const sampleSkills: SkillEntry[] = [
  { label: 'RC', color: '#61dafb', fullTitle: 'React', description: 'Component-driven UI development with hooks, context, and modern rendering patterns.' },
  { label: 'TS', color: '#3178c6', fullTitle: 'TypeScript', description: 'Typed JavaScript for safer refactors, better autocomplete, and self-documenting interfaces.' },
  { label: 'FL', color: '#02569b', fullTitle: 'Flutter', description: 'Cross-platform mobile and desktop apps from a single Dart codebase.' },
  { label: 'NX', color: '#f2f2f2', fullTitle: 'Next.js', description: 'Server-rendered and statically generated React applications with file-based routing.' },
  { label: 'CS', color: '#264de4', fullTitle: 'CSS & Animation', description: 'Layout systems, transitions, and scroll-driven motion built without heavy frameworks.' },
  { label: 'ND', color: '#3c873a', fullTitle: 'Node.js', description: 'Server-side JavaScript for APIs, tooling, and build pipelines.' },
]
