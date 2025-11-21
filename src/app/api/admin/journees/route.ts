import { NextRequest, NextResponse } from 'next/server'
import { ensureAdminAuth } from '@/lib/adminAuth'
import { fetchJourneesForAdmin } from '@/lib/adminMatches'
import { getActiveLeagueId } from '@/lib/leagueSelection'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const unauthorized = ensureAdminAuth(request)
  if (unauthorized) return unauthorized

  try {
    const leagueId = await getActiveLeagueId()
    if (!leagueId) {
      return NextResponse.json({ error: 'Aucune ligue active' }, { status: 400 })
    }
    const journees = await fetchJourneesForAdmin(leagueId)
    return NextResponse.json(journees)
  } catch (error) {
    console.error('Error fetching journees for admin:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

