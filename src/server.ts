import Koa from 'koa'
import pino from 'pino'
import { config as envConfig } from 'dotenv'
import { Config } from 'apollo-server-koa'
import Redis, { RedisOptions } from 'ioredis'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'

import { loadGraphql } from './lib/loadGraphql'
import { loadMiddlewares } from './lib/loadMiddleware'
import { loadPlugin } from './lib/loadPlugin'
import { loadConfigFromACM } from './lib/loadConfig'
import { loadORM } from './lib/loadORM'
import { loadSentry } from './lib/loadSentry'
import { errorHandler } from './middleware/errhandler'
import { zipkinTracer } from './middleware/tracer'
import { setupEureka } from './lib/loadGrpc';

export interface ServerOptions {
  name: string
  root: string
  graphqlServer: Config
  redis?: RedisOptions
  db?: MysqlConnectionOptions
  zipkin?: string
}

export const createServer = async (
  conf: ServerOptions,
  app?: Koa
): Promise<Koa> => {
  envConfig()
  app = app || new Koa()

  const {
    SENTRY_DSN,
    ACM_KEY,
    ACM_ENDPOINT,
    ACM_NAMESPACE,
    ACM_SECRET,
    LOG_LEVEL
  } = process.env

  // init Logger
  const logger = pino({
    level: LOG_LEVEL || 'info',
    prettyPrint: {
      levelFirst: true
    }
  })

  // init loadPlugin factory function
  const load = loadPlugin(app)
  load('logger', logger)
  load('sentry', loadSentry(SENTRY_DSN))

  app.use(errorHandler)

  // load config from aliyun acm
  const config = await loadConfigFromACM({
    accessKey: ACM_KEY,
    secretKey: ACM_SECRET,
    endpoint: ACM_ENDPOINT,
    namespace: ACM_NAMESPACE
  })

  // merge local and remote config
  const appConfig = { ...config, ...conf }
  logger.info('config: ', appConfig)

  const { root, redis, zipkin } = appConfig

  app.use(zipkinTracer(zipkin))

  // load internal plugin
  load('redis', new Redis(redis))

  // load orm entities from files named '**.entity.**'
  load('connection', await loadORM(root, app, appConfig))

  // load middlewares from files named '**.middleware.**'
  await loadMiddlewares(root, app)

  // load middlewares from files named '**.resolver.**'
  await loadGraphql(root, app, appConfig)

  await setupEureka(appConfig)

  // print error message
  app.on('error', err => {
    logger.error('server error', err)
  })

  // graceful shutdown
  process.on('SIGTERM', sig => {
    console.log(sig)
  })

  return app
}
