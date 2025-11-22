import { NextResponse } from 'next/server'
import { getDataSource } from '@/lib/db'
import { Match, Vote as VoteEntity } from '@/lib/entities'
import { canVoteMatch } from '@/lib/utils'

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
      select: ['id', 'arbitre_id', 'date'],
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

    // Vérifier que le match peut être voté (arbitre attribué, match commencé et au moins 30 min écoulées)
    if (!canVoteMatch({ arbitre_id: match.arbitre_id, date: match.date?.toISOString() })) {
      return NextResponse.json(
        { error: 'Cannot vote: match has no referee assigned, match has not started yet, or less than 30 minutes have elapsed since the match started' },
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

