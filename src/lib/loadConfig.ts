import { ACMClient } from 'acm-client'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'
import { RedisOptions } from 'ioredis'

export interface LoadACMConfig {
  endpoint: string
  namespace: string
  accessKey: string
  secretKey: string
  requestTimeout?: number
}

export interface NodeBaseConfig {
  db: MysqlConnectionOptions
  redis: RedisOptions
  zipkin: string
  eureka: string
}

export const loadConfigFromACM = async (
  config: LoadACMConfig
): Promise<NodeBaseConfig> => {
  const acmClient = new ACMClient(config)
  const configJSONString = await acmClient.getConfig(
    'node',
    process.env.APP_ENV || 'daily'
  )
  return JSON.parse(configJSONString)
}
