import Koa, { Context } from 'koa'
import { Logger } from 'pino'
import { Connection } from 'typeorm'
import { Redis } from 'ioredis'
import zipkin from 'zipkin'
import * as Sentry from '@sentry/node'
import * as jspb from 'google-protobuf'
import { ServerOptions } from './server'

export interface IContext extends Context {
  logger: Logger
  connection: Connection
  redis: Redis
  sentry?: Sentry.NodeClient
  zipkin?: {
    tracer: zipkin.Tracer
    pid: zipkin.TraceId
    instrumentation: zipkin.Instrumentation.HttpServer
  }
}

export type loadFromPath<Config, ReturnType> = (
  path: string,
  app: Koa & Record<string, any> & { logger?: Logger },
  config?: ServerOptions
) => Promise<ReturnType> | ReturnType

export type GrpcService<Client> = Client &
  Record<
    string,
    <Request extends jspb.Message, Response extends jspb.Message>(
      req: Request
    ) => Promise<Response>
  >
