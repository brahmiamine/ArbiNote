import { NextRequest, NextResponse } from 'next/server'
import { ensureAdminAuth } from '@/lib/adminAuth'
import { updateJourneeAdmin } from '@/lib/adminJournees'
import { getActiveLeagueId } from '@/lib/leagueSelection'

export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = ensureAdminAuth(request)
  if (unauthorized) return unauthorized

  try {
    const { id } = await params
    const body = await request.json()
    const leagueId = await getActiveLeagueId()
    if (!leagueId) {
      return NextResponse.json({ error: 'Aucune ligue active' }, { status: 400 })
    }
    const journee = await updateJourneeAdmin(id, body, leagueId)
    return NextResponse.json(journee)
  } catch (error) {
    console.error('Error updating journee:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    )
  }
}

