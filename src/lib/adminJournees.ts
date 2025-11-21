import { getDataSource } from './db'
import { Journee } from './entities'
import { toPlain, toPlainArray } from './serialization'

export interface JourneeUpdateInput {
  date_journee?: string | null
}

function parseDate(value?: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

export async function listJourneesForAdmin(leagueId?: string | null) {
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

export async function updateJourneeAdmin(id: string, payload: JourneeUpdateInput, leagueId?: string | null) {
  const dataSource = await getDataSource()
  const repo = dataSource.getRepository<Journee>('journees')
  const journee = await repo.findOne({
    where: { id },
    relations: {
      saison: true,
    },
  })

  if (!journee) {
    throw new Error('Journée introuvable')
  }

  if (leagueId && journee.saison?.league_id && journee.saison.league_id !== leagueId) {
    throw new Error("Cette journée n'appartient pas à la ligue sélectionnée")
  }

  // Construire l'objet de mise à jour
  const updateData: Partial<Journee> = {}
  
  if (payload.date_journee !== undefined) {
    updateData.date_journee = parseDate(payload.date_journee)
  }

  // Mettre à jour directement dans la base de données
  if (Object.keys(updateData).length > 0) {
    await repo.update(id, updateData)
  }

  // Recharger avec les relations pour retourner les données complètes
  const updated = await repo.findOne({
    where: { id },
    relations: {
      saison: true,
    },
  })
  
  if (!updated) {
    throw new Error('Journée introuvable après mise à jour')
  }
  
  return toPlain(updated)
}

