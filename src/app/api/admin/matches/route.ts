import { NextRequest, NextResponse } from 'next/server'
import { ensureAdminAuth } from '@/lib/adminAuth'
import { listMatchesForAdmin } from '@/lib/adminMatches'
import { getActiveLeagueId } from '@/lib/leagueSelection'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const unauthorized = ensureAdminAuth(request)
  if (unauthorized) return unauthorized

  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Math.min(200, Math.max(1, Number(limitParam))) : 50

  try {
    const leagueId = await getActiveLeagueId()
    if (!leagueId) {
      return NextResponse.json({ error: 'Aucune ligue active' }, { status: 400 })
    }
    const matches = await listMatchesForAdmin(limit, leagueId)
    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching admin matches:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


