/**
 * Types TypeScript pour l'application ArbiNote
 */

export interface Arbitre {
  id: string
  nom: string
  nom_fr?: string | null
  nom_ar?: string | null
  nationalite?: string
  nationalite_ar?: string | null
  categorie?: string | null
  categorie_ar?: string | null
  photo_url?: string | null
  date_naissance?: string | null
  created_at?: string
  moyenne_note?: number
  nombre_votes?: number
}

export interface Team {
  id: string
  nom: string
  nom_fr?: string | null
  nom_ar?: string | null
  abbr?: string | null
  city?: string | null
  stadium?: string | null
  logo_url?: string | null
}

export interface Saison {
  id: string
  nom: string
  nom_fr?: string | null
  nom_ar?: string | null
  date_debut?: string | null
  date_fin?: string | null
}

export interface Journee {
  id: string
  numero: number
  saison_id: string
  date_journee?: string | null
}

export interface Match {
  id: string
  date: string | null
  journee_id: string
  equipe_home: Team
  equipe_away: Team
  score_home?: number | null
  score_away?: number | null
  arbitre_id?: string | null
  journee?: {
    numero: number
    saison_id: string
    date_journee?: string | null
  }
  created_at?: string
  arbitre?: Arbitre
}

export type Criteres = Record<string, number>

export interface Vote {
  id: string
  match_id: string
  arbitre_id: string
  criteres: Criteres
  note_globale: number
  created_at?: string
  arbitre?: Arbitre
}

export interface ArbitreStats {
  arbitre: Arbitre
  stats: {
    nombre_votes: number
    moyenne_note: number
    moyenne_criteres: Criteres
  }
  votes: Vote[]
}

export type CritereCategory = 'arbitre' | 'var' | 'assistant'

export interface CritereDefinition {
  id: string
  categorie: CritereCategory
  label_fr: string
  label_ar: string
  description_fr?: string | null
  description_ar?: string | null
  created_at?: string
}

