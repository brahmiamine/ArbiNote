import { NextRequest, NextResponse } from 'next/server'
import { ensureAdminAuth } from '@/lib/adminAuth'
import { ArbitreInput, createArbitre, listArbitres } from '@/lib/adminArbitres'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const unauthorized = ensureAdminAuth(request)
  if (unauthorized) return unauthorized

  try {
    const arbitres = await listArbitres()
    return NextResponse.json(arbitres)
  } catch (error) {
    console.error('Error fetching arbitres for admin:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = ensureAdminAuth(request)
  if (unauthorized) return unauthorized

  try {
    const payload = (await request.json()) as ArbitreInput
    const arbitre = await createArbitre(payload)
    return NextResponse.json(arbitre, { status: 201 })
  } catch (error) {
    console.error('Error creating arbitre:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    )
  }
}


