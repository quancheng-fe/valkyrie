import Koa from 'koa'
import pino, { Logger } from 'pino'
import { Config } from 'apollo-server-koa'
import { loadGraphql } from './lib/loadGraphql'
import { loadMiddlewares } from './lib/loadMiddleware'
import { loadPlugin } from './lib/loadPlugin'

export interface ServerOptions {
  root: string
  graphqlServer: Config
}

export const createServer = async (
  conf: ServerOptions,
  app?: Koa
): Promise<Koa> => {
  app = app || new Koa()
  const load = loadPlugin(app)

  await loadMiddlewares(conf.root, app)
  await loadGraphql(conf.root, app, conf.graphqlServer)

  load('logger', <Logger>() => pino({}))

  return app
}
