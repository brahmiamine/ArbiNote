import { NextRequest, NextResponse } from 'next/server'
import { ensureAdminAuth } from '@/lib/adminAuth'
import { getDataSource } from '@/lib/db'
import { Federation } from '@/lib/entities'
import { toPlain } from '@/lib/serialization'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const unauthorized = ensureAdminAuth(request)
  if (unauthorized) return unauthorized

  try {
    const dataSource = await getDataSource()
    const repo = dataSource.getRepository<Federation>('federations')
    const federations = await repo.find({
      order: { nom: 'ASC' },
    })
    return NextResponse.json(toPlain(federations))
  } catch (error) {
    console.error('Error fetching federations:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = ensureAdminAuth(request)
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const { code, nom, nom_en, nom_ar, logo_url } = body

    if (!code || !nom) {
      return NextResponse.json(
        { error: 'Code et nom sont requis' },
        { status: 400 }
      )
    }

    const dataSource = await getDataSource()
    const repo = dataSource.getRepository<Federation>('federations')
    
    // Vérifier si le code existe déjà
    const existing = await repo.findOne({ where: { code } })
    if (existing) {
      return NextResponse.json(
        { error: 'Une fédération avec ce code existe déjà' },
        { status: 400 }
      )
    }

    const federation = repo.create({
      code,
      nom,
      nom_en: nom_en || null,
      nom_ar: nom_ar || null,
      logo_url: logo_url || null,
    })
    const saved = await repo.save(federation)
    return NextResponse.json(toPlain(saved), { status: 201 })
  } catch (error) {
    console.error('Error creating federation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    )
  }
}

