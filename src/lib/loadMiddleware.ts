import { resolve } from 'path'
import globby from 'globby'
import { loadFunction } from '../types'

export const loadMiddlewares: loadFunction<null, void> = async (
  path,
  app
): Promise<void> => {
  const middlewareFiles = await globby(resolve(path, './**/**.middleware.**'))
  middlewareFiles.forEach(file => {
    app.use(require(file))
  })
}
