import { resolve } from 'path'
import globby from 'globby'
import { loadFromPath } from '../types'
import { Middleware } from 'koa'

export const loadMiddlewares: loadFromPath<null, void> = async (
  path,
  app
): Promise<void> => {
  const middlewareFiles = await globby(resolve(path, './**/**.middleware.(js|ts)'))
  middlewareFiles.forEach(file => {
    const mod = require(file) as any
    Object.keys(mod).forEach((funName: string) => {
      app.use(mod[funName] as Middleware)
    })
  })
}
