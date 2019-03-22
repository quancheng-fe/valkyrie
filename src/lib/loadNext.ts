import { resolve } from 'path'
import { existsSync } from 'fs'
import next from 'next'
import Route from 'next-routes'
import _ from 'lodash'
import { loadFromPath } from '../types'

export const loadNext: loadFromPath<null, void> = async (root, app) => {
  const clientRoot = resolve(root, 'client')
  if (existsSync(clientRoot)) {
    app.logger.info('page dir found, start next server')
    const n = next({
      dev: process.env.NODE_ENV !== 'production',
      dir: clientRoot,
      quiet: true
    })

    let handle: any

    try {
      const router = new Route()
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: routeMap } = await import(resolve(root, 'routes'))

      Object.keys(routeMap).forEach(path => {
        if (_.isObject(routeMap[path])) {
          router.add(routeMap[path])
        } else {
          router.add(path, routeMap[path])
        }
      })
      handle = router.getRequestHandler(n)
    } catch(e) {
      app.logger.info("no route config")
      handle = n.getRequestHandler()
    }

    app.use(async ctx => {
      ctx.status = 200
      await handle(ctx.req, ctx.res)
      ctx.respond = false
    })

    await n.prepare()
  }
}
