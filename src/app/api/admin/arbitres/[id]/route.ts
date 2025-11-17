import { NextRequest, NextResponse } from 'next/server'
import { ensureAdminAuth } from '@/lib/adminAuth'
import { ArbitreInput, updateArbitre } from '@/lib/adminArbitres'

export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorized = ensureAdminAuth(request)
  if (unauthorized) return unauthorized

  try {
    const payload = (await request.json()) as ArbitreInput
    const arbitre = await updateArbitre(params.id, payload)
    return NextResponse.json(arbitre)
  } catch (error) {
    console.error('Error updating arbitre:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    )
  }
}


