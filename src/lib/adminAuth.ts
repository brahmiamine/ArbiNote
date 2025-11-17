import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Buffer } from 'node:buffer'

const ADMIN_COOKIE = 'admin-token'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 4 // 4h

function getEnvCredentials() {
  const username = process.env.ADMIN_USER
  const password = process.env.ADMIN_PASS

  if (!username || !password) {
    throw new Error('ADMIN_USER and ADMIN_PASS must be set in .env.local')
  }

  return { username, password }
}

function encodeToken(username: string, password: string) {
  return Buffer.from(`${username}:${password}`, 'utf-8').toString('base64')
}

function decodeToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [username, password] = decoded.split(':')
    return { username, password }
  } catch {
    return null
  }
}

function getTokenFromRequest(request: NextRequest) {
  const header = request.headers.get('authorization')
  if (header?.startsWith('Basic ')) {
    return header.slice(6)
  }
  return request.cookies.get(ADMIN_COOKIE)?.value ?? null
}

export function isValidToken(token: string | null) {
  if (!token) return false
  const parsed = decodeToken(token)
  if (!parsed) return false
  const { username, password } = getEnvCredentials()
  return parsed.username === username && parsed.password === password
}

export function ensureAdminAuth(request: NextRequest) {
  if (isValidToken(getTokenFromRequest(request))) {
    return null
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function issueAdminSession(response: NextResponse, username: string, password: string) {
  const token = encodeToken(username, password)
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })
  return response
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function hasAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value ?? null
  return isValidToken(token)
}

export function validateCredentials(username: string, password: string) {
  const expected = getEnvCredentials()
  return username === expected.username && password === expected.password
}


