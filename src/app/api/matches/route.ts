import { NextResponse } from 'next/server'
import { fetchMatches } from '@/lib/dataAccess'

export async function GET() {
  try {
    const matches = await fetchMatches(100)
    return NextResponse.json(matches)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

