import Koa from 'koa'
export type loadFromPath<Config, ReturnType> = (
  path: string,
  app: Koa,
  config?: Config
) => Promise<ReturnType> | ReturnType
