// types/index.ts — Contrats TypeScript du domaine métier Mairie de Bouaké

// ─── Élus & Gouvernance ──────────────────────────────────────────────────────

export interface TimelineItem {
  period: string
  title: string
  description: string
}

export interface Maire {
  id: string
  firstName: string
  lastName: string
  photo: string
  photoAlt: string
  party: string
  since: string
  bio: string
  timeline: TimelineItem[]
  representations: string[]
  documents: MaireDocument[]
}

export interface MaireDocument {
  id: string
  label: string
  icon: string
  linkLabel: string
  href: string
}

export interface Adjoint {
  id: string
  rank: number         // 1er, 2ème, etc.
  firstName: string
  lastName: string
  photo: string
  attributions: string[]
}

export interface ConseillerMunicipal {
  id: string
  firstName: string
  lastName: string
  quartier: string
  commission?: string
}

// ─── Projets ─────────────────────────────────────────────────────────────────

export type ProjectStatus = 'en_cours' | 'termine' | 'planifie' | 'suspendu'

export interface Project {
  id: string
  slug: string
  title: string
  description: string
  content?: string
  category?: string
  resume?: string
  budget?: string
  dateDebut?: string | null
  dateFin?: string | null
  maitreOuvrage?: string
  financement?: string
  bailleurs?: string
  entreprises?: string
  livraisonPrevue?: string
  progressPercent: number
  status: ProjectStatus
  featured?: boolean
  coverImage?: string | null
  images: ProjectImage[]
  tags?: string[]
  videoUrl?: string | null
  publishedAt?: string | null
}

export interface ProjectImage {
  src: string
  alt: string
  caption?: string
}

// ─── Actualités ──────────────────────────────────────────────────────────────

// Catégories gérées dans Strapi (collection "Categorie (Actualite)") : la liste
// n'est plus figée dans le code, donc plus de union de valeurs possibles.
export type ActualiteCategory = string

export interface Actualite {
  id: string
  slug: string
  title: string
  excerpt: string
  content: unknown       // Strapi Blocks ou HTML legacy
  category: ActualiteCategory
  categoryLabel: string
  categoryColor: string | null
  date_publication?: string | null
  publishedAt: string    // ISO 8601
  author: string
  coverImage: string
  coverImageAlt: string
  featured: boolean
  views: number
  likes: number
  tags: string[]
}

// ─── Services citoyens ────────────────────────────────────────────────────────

export interface ServiceTheme {
  id: string
  icon: string           // Nom de classe Bootstrap Icons
  title: string
  items: string[]
}

export interface Demarche {
  id: string
  title: string
  delay?: string
  description: string
  documents: string[]
  note?: string
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  label: string          // Clé i18n
  to: string             // Route Nuxt (NuxtLink)
  icon?: string
  children?: NavItem[]
}

// ─── PWA / App ────────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  autoDismiss?: number   // ms
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    page: number
    perPage: number
  }
  error?: string
}
