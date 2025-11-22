import { NextResponse } from 'next/server'
import { ensureAdminAuth } from '@/lib/adminAuth'
import { fetchTeams } from '@/lib/dataAccess'

export async function GET(request: Request) {
  const unauthorized = ensureAdminAuth(request)
  if (unauthorized) return unauthorized

  try {
    const teams = await fetchTeams()
    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

