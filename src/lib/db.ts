import 'reflect-metadata'
import { DataSource } from 'typeorm'
import {
  Arbitre,
  CritereDefinitionEntity,
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
    entities: [Arbitre, CritereDefinitionEntity, Federation, League, Journee, Match, Saison, Team, Vote],
    extra: {
      decimalNumbers: true,
    },
  })
}

export async function getDataSource(): Promise<DataSource> {
  if (globalForDataSource.dataSource && globalForDataSource.dataSource.isInitialized) {
    return globalForDataSource.dataSource
  }

  const dataSource = createDataSource()
  globalForDataSource.dataSource = dataSource
  if (!dataSource.isInitialized) {
    await dataSource.initialize()
  }

  return dataSource
}


