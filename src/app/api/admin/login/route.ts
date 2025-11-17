import { NextRequest, NextResponse } from 'next/server'
import { issueAdminSession, validateCredentials } from '@/lib/adminAuth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Identifiants requis' }, { status: 400 })
    }

    if (!validateCredentials(username, password)) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    issueAdminSession(response, username, password)
    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


