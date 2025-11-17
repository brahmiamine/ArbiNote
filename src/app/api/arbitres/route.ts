import { NextResponse } from 'next/server'
import { fetchArbitres } from '@/lib/dataAccess'

export async function GET() {
  try {
    const arbitres = await fetchArbitres()
    return NextResponse.json(arbitres)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

