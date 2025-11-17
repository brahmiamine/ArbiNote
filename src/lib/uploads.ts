import { mkdir } from 'node:fs/promises'
import path from 'node:path'

export const arbitreUploadsDir = path.join(process.cwd(), 'uploads', 'arbitres')

export async function ensureArbitreUploadsDir() {
  await mkdir(arbitreUploadsDir, { recursive: true })
}

export function buildArbitrePhotoPath(filename: string) {
  return path.join(arbitreUploadsDir, filename)
}

export function buildArbitrePhotoUrl(filename: string) {
  return `/api/uploads/arbitre/${filename}`
}

export function sanitizeFilename(originalName: string, fallbackExt = '.dat') {
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
  if (safeName.includes('.')) {
    return safeName
  }
  return `${safeName}${fallbackExt}`
}


