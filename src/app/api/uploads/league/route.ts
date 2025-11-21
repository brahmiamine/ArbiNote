import { NextRequest, NextResponse } from 'next/server'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import { writeFile } from 'node:fs/promises'
import { ensureAdminAuth } from '@/lib/adminAuth'
import { mkdir } from 'node:fs/promises'

export const runtime = 'nodejs'

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

function getExtension(file: File) {
  if (file.type && MIME_EXTENSIONS[file.type]) {
    return MIME_EXTENSIONS[file.type]
  }
  const originalExt = path.extname(file.name)
  if (originalExt) {
    return originalExt
  }
  return '.bin'
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}

async function ensureLeagueUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'leagues')
  await mkdir(uploadsDir, { recursive: true })
  return uploadsDir
}

export async function POST(request: NextRequest) {
  const unauthorized = ensureAdminAuth(request)
  if (unauthorized) {
    return unauthorized
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const extension = getExtension(file)
  const safeBaseName = sanitizeFilename(path.parse(file.name).name)
  const timestamp = Date.now()
  const filename = `${safeBaseName || 'league'}-${timestamp}${extension}`
  const uploadsDir = await ensureLeagueUploadsDir()
  const fullPath = path.join(uploadsDir, filename)

  await writeFile(fullPath, buffer)

  return NextResponse.json({
    filename,
    url: `/uploads/leagues/${filename}`,
  })
}

