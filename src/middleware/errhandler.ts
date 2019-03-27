import { Middleware } from 'koa'
import { IContext } from '../types'
import { captureException } from '@sentry/core'

export const errorHandler: Middleware<null, IContext> = async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    captureException(e)
    ctx.logger.error(e)
    ctx.status = 500

    if (ctx.zipkin) {
      const { instrumentation, tracer, pid } = ctx.zipkin
      tracer.scoped(() => {
        ctx.tracer.setId(pid)
        instrumentation.recordResponse(tracer.id, `${ctx.status}`, e)
      })
    }
  }
}
