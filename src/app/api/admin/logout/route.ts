import { NextResponse } from 'next/server'
import { clearAdminSession } from '@/lib/adminAuth'

export const runtime = 'nodejs'

export async function POST() {
  const response = NextResponse.json({ success: true })
  clearAdminSession(response)
  return response
}


