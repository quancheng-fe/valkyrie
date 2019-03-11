import Koa from 'koa'
export type loadFunction<Config, ReturnType> = (
  path: string,
  app: Koa,
  config?: Config
) => Promise<ReturnType> | ReturnType
