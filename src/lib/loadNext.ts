import { resolve } from 'path'
import { existsSync } from 'fs'
import next from 'next'
import Route from 'next-routes'
import Router from 'koa-router'
import _ from 'lodash'
import { loadFromPath } from '../types'

export const loadNext: loadFromPath<null, void> = async (root, app) => {
  const koaRouter = new Router()
  const clientRoot = resolve(root, 'client')
  if (existsSync(clientRoot)) {
    app.logger.info('client folder found, ssr mode on')
    const n = next({
      dev: process.env.NODE_ENV !== 'production',
      dir: clientRoot,
      quiet: true
    })

    await n.prepare()

    let handle: any

    try {
      const router = new Route()
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: routeMap } = await import(resolve(root, 'routes'))

      app.logger.info('customize route config found', routeMap)

      Object.keys(routeMap).forEach(path => {
        if (_.isObject(routeMap[path])) {
          router.add(routeMap[path])
        } else {
          router.add(path, routeMap[path])
        }
      })
      handle = router.getRequestHandler(n)
    } catch (e) {
      handle = n.getRequestHandler()
    }

    koaRouter.get('*', async ctx => {
      await handle(ctx.req, ctx.res)
      ctx.respond = false
    })

    app.use(async (ctx, next) => {
      ctx.res.statusCode = 200
      await next()
    })

    app.use(koaRouter.routes())
  }
}
