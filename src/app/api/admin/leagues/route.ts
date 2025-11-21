import { NextRequest, NextResponse } from 'next/server'
import { ensureAdminAuth } from '@/lib/adminAuth'
import { getDataSource } from '@/lib/db'
import { League } from '@/lib/entities'
import { toPlain } from '@/lib/serialization'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const unauthorized = ensureAdminAuth(request)
  if (unauthorized) return unauthorized

  try {
    const dataSource = await getDataSource()
    const repo = dataSource.getRepository<League>('ligues')
    const leagues = await repo.find({
      relations: ['federation'],
      order: { nom: 'ASC' },
    })
    return NextResponse.json(toPlain(leagues))
  } catch (error) {
    console.error('Error fetching leagues:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = ensureAdminAuth(request)
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const { federation_id, nom, nom_en, nom_ar, logo_url } = body

    if (!federation_id || !nom) {
      return NextResponse.json(
        { error: 'Fédération et nom sont requis' },
        { status: 400 }
      )
    }

    const dataSource = await getDataSource()
    const federationRepo = dataSource.getRepository('federations')
    const leagueRepo = dataSource.getRepository<League>('ligues')
    
    // Vérifier que la fédération existe
    const federation = await federationRepo.findOne({ where: { id: federation_id } })
    if (!federation) {
      return NextResponse.json(
        { error: 'Fédération non trouvée' },
        { status: 400 }
      )
    }

    const league = leagueRepo.create({
      federation_id,
      nom,
      nom_en: nom_en || null,
      nom_ar: nom_ar || null,
      logo_url: logo_url || null,
    })
    const saved = await leagueRepo.save(league)
    return NextResponse.json(toPlain(saved), { status: 201 })
  } catch (error) {
    console.error('Error creating league:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    )
  }
}

