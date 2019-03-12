import { resolve } from 'path'
import globby from 'globby'
import { loadFromPath } from '../types'

export const loadMiddlewares: loadFromPath<null, void> = async (
  path,
  app
): Promise<void> => {
  const middlewareFiles = await globby(resolve(path, './**/**.middleware.**'))
  middlewareFiles.forEach(file => {
    app.use(require(file))
  })
}
