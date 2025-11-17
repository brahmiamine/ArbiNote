import { NextRequest, NextResponse } from 'next/server'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import { writeFile } from 'node:fs/promises'
import { ensureAdminAuth } from '@/lib/adminAuth'
import {
  buildArbitrePhotoPath,
  buildArbitrePhotoUrl,
  ensureArbitreUploadsDir,
  sanitizeFilename,
} from '@/lib/uploads'

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
  const safeBaseName = sanitizeFilename(path.parse(file.name).name, '')
  const timestamp = Date.now()
  const filename = `${safeBaseName || 'arbitre'}-${timestamp}${extension}`
  const fullPath = buildArbitrePhotoPath(filename)

  await ensureArbitreUploadsDir()
  await writeFile(fullPath, buffer)

  return NextResponse.json({
    filename,
    url: buildArbitrePhotoUrl(filename),
  })
}


