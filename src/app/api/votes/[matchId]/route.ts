import { NextResponse } from 'next/server'
import { getDataSource } from '@/lib/db'
import { Vote } from '@/lib/entities'

export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    const matchId = params.matchId

    const dataSource = await getDataSource()
    const votes = await dataSource.getRepository(Vote).find({
      where: { match_id: matchId },
      order: { created_at: 'DESC' },
    })

    return NextResponse.json(votes)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

