import Koa, { Context } from 'koa'
import { Logger } from 'pino'
import { ServerOptions } from './server'
import { NodeBaseConfig } from './lib/loadConfig'
import { Connection } from 'typeorm'
import { Redis } from 'ioredis'
import zipkin = require('zipkin')

export interface IContext extends Context {
  logger: Logger
  connection: Connection
  redis: Redis
  zipkin?: {
    tracer: zipkin.Tracer
    pid: zipkin.TraceId
    instrumentation: zipkin.Instrumentation.HttpServer
  }
}

export type loadFromPath<Config, ReturnType> = (
  path: string,
  app: Koa,
  config?: ServerOptions & NodeBaseConfig
) => Promise<ReturnType> | ReturnType
