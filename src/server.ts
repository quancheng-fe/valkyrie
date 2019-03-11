import Koa from 'koa'
import { Config } from 'apollo-server-koa'
import { loadGraphql } from './lib/loadGraphql'
import { loadMiddlewares } from './lib/loadMiddleware'

export interface ServerOptions {
  root: string
  graphqlServer: Config
}

export const createServer = async (
  conf: ServerOptions,
  app?: Koa
): Promise<Koa> => {
  app = app || new Koa()

  await loadGraphql(conf.root, app, conf.graphqlServer)
  await loadMiddlewares(conf.root, app)

  return app
}
