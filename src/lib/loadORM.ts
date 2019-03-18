import { resolve } from 'path'
import globby from 'globby'
import { useContainer, createConnection, Connection } from 'typeorm'
import Container from 'typedi'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'
import { loadFromPath } from '../types'

export const loadORM: loadFromPath<
  MysqlConnectionOptions,
  Connection | null
> = async (path, app, config) => {
  useContainer(Container)
  const entitiesFiles = await globby(resolve(path, './**/**.entity.(js|ts)'))
  const connection = await createConnection({
    ...config.db,
    entities: entitiesFiles
  })
  return connection
}
