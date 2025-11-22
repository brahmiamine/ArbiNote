import { NextResponse } from 'next/server'
import { getDataSource } from '@/lib/db'
import { Contact } from '@/lib/entities'
import { hasAdminSession } from '@/lib/adminAuth'

export async function GET() {
  try {
    // Vérifier l'authentification admin
    const authenticated = await hasAdminSession()
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const dataSource = await getDataSource()
    
    // Vérifier que l'entité Contact est bien chargée
    const hasContactEntity = dataSource.entityMetadatas.some(
      (meta) => meta.name === 'Contact' || meta.tableName === 'contact_messages'
    )
    
    let messages: any[] = []
    
    // Essayer d'utiliser le repository si l'entité est trouvée
    if (hasContactEntity) {
      try {
        const contactRepo = dataSource.getRepository(Contact)
        // Vérifier que le repository a bien les métadonnées en testant une opération simple
        const repoMessages = await contactRepo.find({
          order: { created_at: 'DESC' },
        })

        // Sérialiser les messages manuellement
        messages = repoMessages.map((msg) => ({
          id: msg.id,
          email: msg.email,
          subject: msg.subject,
          message: msg.message,
          device_fingerprint: msg.device_fingerprint || null,
          created_at: msg.created_at ? (msg.created_at instanceof Date ? msg.created_at.toISOString() : msg.created_at) : null,
        }))
      } catch (repoError) {
        console.warn('Error using Contact repository, falling back to raw SQL:', repoError)
        // Fallback: utiliser une requête SQL brute
        const rawMessages = await dataSource.query(
          'SELECT id, email, subject, message, device_fingerprint, created_at FROM contact_messages ORDER BY created_at DESC'
        )
        messages = rawMessages.map((msg: any) => ({
          id: msg.id,
          email: msg.email,
          subject: msg.subject,
          message: msg.message,
          device_fingerprint: msg.device_fingerprint || null,
          created_at: msg.created_at ? (msg.created_at instanceof Date ? msg.created_at.toISOString() : msg.created_at) : null,
        }))
      }
    } else {
      // L'entité n'est pas trouvée, utiliser directement une requête SQL brute
      console.warn('Contact entity not found in TypeORM metadata, using raw SQL query')
      const rawMessages = await dataSource.query(
        'SELECT id, email, subject, message, device_fingerprint, created_at FROM contact_messages ORDER BY created_at DESC'
      )
      messages = rawMessages.map((msg: any) => ({
        id: msg.id,
        email: msg.email,
        subject: msg.subject,
        message: msg.message,
        device_fingerprint: msg.device_fingerprint || null,
        created_at: msg.created_at ? (msg.created_at instanceof Date ? msg.created_at.toISOString() : msg.created_at) : null,
      }))
    }

    const messagesData = messages

    return NextResponse.json(messagesData)
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Logger plus de détails en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', {
        message: errorMessage,
        stack: errorStack,
        error,
      })
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}

