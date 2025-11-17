import { In } from 'typeorm'
import { getDataSource } from './db'
import {
  Arbitre,
  CritereDefinitionEntity,
  Journee,
  Match,
  Saison,
  Team,
  Vote,
} from './entities'
import { toPlain, toPlainArray } from './serialization'

export async function fetchFeaturedSaisons(limit = 2) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Saison>('saisons')
  const rows = await repo.find({
    order: { date_debut: 'DESC' },
    take: limit,
  })
  return toPlainArray(rows)
}

export async function fetchAllSaisons() {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Saison>('saisons')
  const rows = await repo.find({
    order: { date_debut: 'ASC' },
  })
  return toPlainArray(rows)
}

export async function fetchSaisonById(id: string) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Saison>('saisons')
  const row = await repo.findOne({
    where: { id },
  })
  return toPlain(row)
}

export async function fetchJourneesBySaison(saisonId: string) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Journee>('journees')
  const rows = await repo.find({
    select: ['id', 'numero', 'saison_id', 'date_journee'],
    where: { saison_id: saisonId },
    order: { numero: 'ASC' },
  })
  return toPlainArray(rows)
}

export async function fetchJourneeWithSeason(id: string) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Journee>('journees')
  const row = await repo.findOne({
    where: { id },
    relations: {
      saison: true,
    },
  })
  return toPlain(row)
}

export async function fetchMatchesByJournee(journeeId: string) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Match>('matches')
  const rows = await repo.find({
    where: { journee_id: journeeId },
    relations: {
      journee: { saison: true },
      equipe_home: true,
      equipe_away: true,
      arbitre: true,
    },
    order: { date: 'ASC' },
  })
  return toPlainArray(rows)
}

export async function fetchMatches(limit = 20) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Match>('matches')
  const rows = await repo.find({
    relations: {
      journee: { saison: true },
      equipe_home: true,
      equipe_away: true,
      arbitre: true,
    },
    order: { date: 'DESC' },
    take: limit,
  })
  return toPlainArray(rows)
}

export async function fetchMatchById(id: string) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Match>('matches')
  const row = await repo.findOne({
    where: { id },
    relations: {
      journee: { saison: true },
      equipe_home: true,
      equipe_away: true,
      arbitre: true,
    },
  })
  return toPlain(row)
}

export async function fetchMatchesByJourneeIds(journeeIds: string[]) {
  if (journeeIds.length === 0) {
    return []
  }
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Match>('matches')
  const rows = await repo.find({
    select: ['id', 'journee_id'],
    where: { journee_id: In(journeeIds) },
  })
  return toPlainArray(rows)
}

export async function fetchVotesByMatchIds(matchIds: string[]) {
  if (matchIds.length === 0) {
    return []
  }
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Vote>('votes')
  const rows = await repo.find({
    where: { match_id: In(matchIds) },
    relations: {
      arbitre: true,
    },
    order: { created_at: 'DESC' },
  })
  return toPlainArray(rows)
}

export async function fetchVotesByArbitre(arbitreId: string) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Vote>('votes')
  const rows = await repo.find({
    select: ['id', 'note_globale', 'criteres', 'created_at'],
    where: { arbitre_id: arbitreId },
    order: { created_at: 'DESC' },
  })
  return toPlainArray(rows)
}

export async function fetchArbitreById(id: string) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Arbitre>('arbitres')
  const row = await repo.findOne({ where: { id } })
  return toPlain(row)
}

export async function fetchArbitres() {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Arbitre>('arbitres')
  const rows = await repo.find({
    order: { nom: 'ASC' },
  })
  return toPlainArray(rows)
}

export async function fetchCritereDefinitions() {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<CritereDefinitionEntity>('critere_definitions')
  const rows = await repo.find({
    order: {
      categorie: 'ASC',
      id: 'ASC',
    },
  })
  return toPlainArray(rows)
}

export async function fetchLatestSaison() {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Saison>('saisons')
  const rows = await repo.find({
    order: { date_debut: 'DESC', created_at: 'DESC' },
    take: 1,
  })
  const row = rows[0] ?? null
  return toPlain(row)
}

export async function fetchTeams() {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Team>('teams')
  const rows = await repo.find({
    order: { nom: 'ASC' },
  })
  return toPlainArray(rows)
}

export async function fetchNextJourneeMatches(referenceDate: Date = new Date()) {
  const dataSource = await getDataSource()
  const journeeRepo = dataSource.getRepository<Journee>('journees')
  const matchRepo = dataSource.getRepository<Match>('matches')
  const today = referenceDate.toISOString().slice(0, 10)

  const nextJournee =
    (await journeeRepo
      .createQueryBuilder('j')
      .where('j.date_journee IS NOT NULL')
      .andWhere('j.date_journee >= :today', { today })
      .orderBy('j.date_journee', 'ASC')
      .getOne()) ||
    (await journeeRepo.createQueryBuilder('j').orderBy('j.date_journee', 'DESC').getOne())

  if (!nextJournee) {
    return null
  }

  const matches = await matchRepo.find({
    where: { journee_id: nextJournee.id },
    relations: {
      journee: true,
      equipe_home: true,
      equipe_away: true,
      arbitre: true,
    },
    order: { date: 'ASC' },
  })

  return {
    journee: toPlain(nextJournee),
    matches: toPlainArray(matches),
  }
}


