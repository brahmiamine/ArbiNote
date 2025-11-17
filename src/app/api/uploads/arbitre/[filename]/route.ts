import { NextRequest, NextResponse } from 'next/server'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { buildArbitrePhotoPath } from '@/lib/uploads'

export const runtime = 'nodejs'

function getMimeType(filename: string) {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params
  if (!filename) {
    return NextResponse.json({ error: 'Filename required' }, { status: 400 })
  }

  try {
    const file = await readFile(buildArbitrePhotoPath(filename))
    return new NextResponse(file, {
      headers: {
        'Content-Type': getMimeType(filename),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving arbitre upload:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}


