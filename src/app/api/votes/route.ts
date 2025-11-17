import { NextResponse } from 'next/server'
import { getDataSource } from '@/lib/db'
import { Match, Vote as VoteEntity } from '@/lib/entities'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { match_id, arbitre_id, criteres, note_globale, device_fingerprint } = body

    // Validation
    if (!match_id || !arbitre_id || !criteres || note_globale === undefined || !device_fingerprint) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const dataSource = await getDataSource()
    const matchRepo = dataSource.getRepository<Match>('matches')
    const voteRepo = dataSource.getRepository<VoteEntity>('votes')

    // Vérifier que le match existe
    const match = await matchRepo.findOne({
      select: ['id', 'arbitre_id'],
      where: { id: match_id },
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Vérifier que l'arbitre correspond
    if (match.arbitre_id !== arbitre_id) {
      return NextResponse.json(
        { error: 'Arbitre does not match the match' },
        { status: 400 }
      )
    }

    // Insérer le vote
    const vote = voteRepo.create({
      match_id,
      arbitre_id,
      criteres,
      note_globale: Number(note_globale),
      device_fingerprint,
    })
    const saved = await voteRepo.save(vote)

    return NextResponse.json(saved, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

