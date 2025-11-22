import { getDataSource } from './db'
import { Match, Journee } from './entities'
import { toPlain, toPlainArray } from './serialization'

export interface MatchUpdateInput {
  score_home?: number | null
  score_away?: number | null
  date?: string | null
  arbitre_id?: string | null
  equipe_home?: string | null
  equipe_away?: string | null
}

function parseDate(value?: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

function normalizeScore(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

export async function listMatchesForAdmin(limit = 50, leagueId?: string | null, journeeId?: string | null) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Match>('matches')
  const qb = repo
    .createQueryBuilder('match')
    .leftJoinAndSelect('match.journee', 'journee')
    .leftJoinAndSelect('journee.saison', 'saison')
    .leftJoinAndSelect('match.equipe_home', 'equipe_home')
    .leftJoinAndSelect('match.equipe_away', 'equipe_away')
    .leftJoinAndSelect('match.arbitre', 'arbitre')
    .orderBy('match.date', 'DESC')
    .take(limit)

  if (journeeId) {
    qb.where('match.journee_id = :journeeId', { journeeId })
  } else if (leagueId) {
    qb.where('saison.league_id = :leagueId', { leagueId })
  }

  const rows = await qb.getMany()
  return toPlainArray(rows)
}

export async function fetchJourneesForAdmin(leagueId?: string | null) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Journee>('journees')
  const qb = repo
    .createQueryBuilder('journee')
    .leftJoinAndSelect('journee.saison', 'saison')
    .orderBy('journee.numero', 'DESC')

  if (leagueId) {
    qb.where('saison.league_id = :leagueId', { leagueId })
  }

  const rows = await qb.getMany()
  return toPlainArray(rows)
}

export async function updateMatchAdmin(id: string, payload: MatchUpdateInput, leagueId?: string | null) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Match>('matches')
  const match = await repo.findOne({
    where: { id },
    relations: {
      equipe_home: true,
      equipe_away: true,
      journee: { saison: true },
      arbitre: true,
    },
  })

  if (!match) {
    throw new Error('Match introuvable')
  }

  if (leagueId && match.journee?.saison?.league_id && match.journee.saison.league_id !== leagueId) {
    throw new Error("Ce match n'appartient pas à la ligue sélectionnée")
  }

  // Construire l'objet de mise à jour
  const updateData: Partial<Match> = {}
  
  if (payload.score_home !== undefined) {
    updateData.score_home = normalizeScore(payload.score_home)
  }
  if (payload.score_away !== undefined) {
    updateData.score_away = normalizeScore(payload.score_away)
  }
  if (payload.date !== undefined) {
    updateData.date = parseDate(payload.date)
  }
  // Toujours mettre à jour arbitre_id si présent dans le payload
  if (payload.arbitre_id !== undefined) {
    // Permettre de définir arbitre_id à null pour supprimer l'arbitre
    updateData.arbitre_id = payload.arbitre_id === null || payload.arbitre_id === '' ? null : payload.arbitre_id
  }
  // Mettre à jour les équipes
  if (payload.equipe_home !== undefined) {
    updateData.equipe_home_id = payload.equipe_home === null || payload.equipe_home === '' ? undefined : payload.equipe_home
  }
  if (payload.equipe_away !== undefined) {
    updateData.equipe_away_id = payload.equipe_away === null || payload.equipe_away === '' ? undefined : payload.equipe_away
  }

  // Mettre à jour directement dans la base de données
  if (Object.keys(updateData).length > 0) {
    await repo.update(id, updateData)
  }

  // Recharger avec les relations pour retourner les données complètes
  const updated = await repo.findOne({
    where: { id },
    relations: {
      equipe_home: true,
      equipe_away: true,
      journee: { saison: true },
      arbitre: true,
    },
  })
  
  if (!updated) {
    throw new Error('Match introuvable après mise à jour')
  }
  
  return toPlain(updated)
}


