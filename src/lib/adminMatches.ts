import { getDataSource } from './db'
import { Match } from './entities'
import { toPlain, toPlainArray } from './serialization'

export interface MatchUpdateInput {
  score_home?: number | null
  score_away?: number | null
  date?: string | null
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

export async function listMatchesForAdmin(limit = 50, leagueId?: string | null) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Match>('matches')
  const qb = repo
    .createQueryBuilder('match')
    .leftJoinAndSelect('match.journee', 'journee')
    .leftJoinAndSelect('journee.saison', 'saison')
    .leftJoinAndSelect('match.equipe_home', 'equipe_home')
    .leftJoinAndSelect('match.equipe_away', 'equipe_away')
    .orderBy('match.date', 'DESC')
    .take(limit)

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
    },
  })

  if (!match) {
    throw new Error('Match introuvable')
  }

  if (leagueId && match.journee?.saison?.league_id && match.journee.saison.league_id !== leagueId) {
    throw new Error('Ce match n’appartient pas à la ligue sélectionnée')
  }

  if (payload.score_home !== undefined) {
    match.score_home = normalizeScore(payload.score_home)
  }
  if (payload.score_away !== undefined) {
    match.score_away = normalizeScore(payload.score_away)
  }
  if (payload.date !== undefined) {
    match.date = parseDate(payload.date)
  }

  const saved = await repo.save(match)
  return toPlain(saved)
}


