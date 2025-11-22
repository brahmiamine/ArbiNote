import 'reflect-metadata'
import { DataSource } from 'typeorm'
import {
  Arbitre,
  CritereDefinitionEntity,
  Contact,
  Federation,
  Journee,
  League,
  Match,
  Saison,
  Team,
  Vote,
} from './entities'

const globalForDataSource = globalThis as unknown as {
  dataSource?: DataSource
}

function createDataSource() {
  const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_LOGGING,
    DB_SYNCHRONIZE,
  } = process.env

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error('Missing MySQL configuration. Please set DB_HOST, DB_USER and DB_NAME in .env.local')
  }

  return new DataSource({
    type: 'mysql',
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    logging: DB_LOGGING === 'true',
    synchronize: DB_SYNCHRONIZE === 'true',
    entities: [Arbitre, CritereDefinitionEntity, Contact, Federation, League, Journee, Match, Saison, Team, Vote],
    extra: {
      decimalNumbers: true,
    },
  })
}

export async function getDataSource(): Promise<DataSource> {
  // En développement, toujours vérifier et réinitialiser si Contact n'est pas présent
  if (process.env.NODE_ENV === 'development' && globalForDataSource.dataSource && globalForDataSource.dataSource.isInitialized) {
    // Vérifier si Contact est dans les métadonnées
    const hasContact = globalForDataSource.dataSource.entityMetadatas.some(
      (meta) => meta.name === 'Contact' || meta.tableName === 'contact_messages'
    )
    if (!hasContact) {
      console.log('Contact entity not found in metadata, reinitializing DataSource...')
      // Réinitialiser pour charger la nouvelle entité
      try {
        if (globalForDataSource.dataSource.isInitialized) {
          await globalForDataSource.dataSource.destroy()
        }
      } catch (e) {
        console.error('Error destroying DataSource:', e)
      }
      delete globalForDataSource.dataSource
    }
  }

  // Si la DataSource existe et est initialisée, la retourner
  if (globalForDataSource.dataSource && globalForDataSource.dataSource.isInitialized) {
    // Vérifier à nouveau que Contact est bien présent
    const hasContact = globalForDataSource.dataSource.entityMetadatas.some(
      (meta) => meta.name === 'Contact' || meta.tableName === 'contact_messages'
    )
    if (!hasContact) {
      console.warn('Contact entity still not found after initialization check')
    }
    return globalForDataSource.dataSource
  }

  // Créer une nouvelle DataSource
  const dataSource = createDataSource()
  globalForDataSource.dataSource = dataSource
  if (!dataSource.isInitialized) {
    await dataSource.initialize()

    // Vérifier que Contact est bien chargé après l'initialisation
    const hasContact = dataSource.entityMetadatas.some(
      (meta) => meta.name === 'Contact' || meta.tableName === 'contact_messages'
    )
    if (!hasContact) {
      console.error('Contact entity not found after DataSource initialization')
      console.log('Available entities:', dataSource.entityMetadatas.map(m => ({ name: m.name, tableName: m.tableName })))
    } else {
      console.log('Contact entity successfully loaded')
    }
  }

  return dataSource
}


