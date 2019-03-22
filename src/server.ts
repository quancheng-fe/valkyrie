import http from 'http'
import Koa from 'koa'
import pino, { Logger } from 'pino'
import { config as envConfig } from 'dotenv'
import { Config } from 'apollo-server-koa'
import Redis from 'ioredis'

import { loadGraphql } from './lib/loadGraphql'
import { loadMiddlewares } from './lib/loadMiddleware'
import { loadPlugin } from './lib/loadPlugin'
import { loadConfigFromACM, NodeBaseConfig } from './lib/loadConfig'
import { loadORM } from './lib/loadORM'
import { loadNext } from './lib/loadNext'
import { loadSentry } from './lib/loadSentry'
import { setupEureka } from './lib/loadGrpc'
import { gracefulShutDown } from './lib/gracefulShutDown'
import { errorHandler } from './middleware/errhandler'
import { zipkinTracer } from './middleware/tracer'

export interface ServerOptions extends Partial<NodeBaseConfig> {
  name: string
  root: string
  graphqlServer: Config
  onShuttingDown?: Function
}

export const createServer = async (
  conf: ServerOptions,
  app?: Koa & Record<string, any> & { logger?: Logger }
): Promise<http.Server> => {
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

  app.logger = logger

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

  const eurekaClient = await setupEureka(appConfig)

  await loadNext(root, app)

  // print error message
  app.on('error', err => {
    logger.error('server error', err)
  })

  const server = http.createServer(app.callback())

  // graceful shutdown
  process.on(
    'SIGTERM',
    gracefulShutDown(server, logger, {
      onShutDown() {
        eurekaClient.stop()
      }
    })
  )

  return server
}
