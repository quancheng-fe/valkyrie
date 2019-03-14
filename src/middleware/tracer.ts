import { Middleware } from 'koa'
import {
  Tracer,
  ConsoleRecorder,
  BatchRecorder,
  sampler,
  Instrumentation,
  option,
  jsonEncoder
} from 'zipkin'
import CLSContext from 'zipkin-context-cls'
import { HttpLogger } from 'zipkin-transport-http'
import { IContext } from '../types'

const readHeader = (ctx: IContext) => (header: string) => {
  const val = ctx.header[header]
  if (val != null) {
    return new option.Some(val)
  } else {
    return option.None
  }
}

export const zipkinTracer = (
  zipkinEndPoint: string,
  debug?: boolean
): Middleware<null, IContext> => async (ctx, next) => {
  if (process.env.NODE_ENV === 'production') {
    const ctxImpl = new CLSContext('zipkin')
    const recorder = !debug
      ? new BatchRecorder({
          logger: new HttpLogger({
            endpoint: `${zipkinEndPoint}/api/v2/spans`,
            jsonEncoder: jsonEncoder.JSON_V2,
            httpInterval: 1000
          })
        })
      : new ConsoleRecorder(message => ctx.logger.info(message))

    const tracer = new Tracer({
      ctxImpl,
      recorder,
      sampler: new sampler.CountingSampler(0.1),
      traceId128Bit: true,
      localServiceName: 'app'
    })

    const instrumentation = new Instrumentation.HttpServer({
      tracer,
      serviceName: 'app',
      port: 80
    })

    const id = instrumentation.recordRequest(
      ctx.method,
      ctx.url,
      readHeader(ctx)
    )

    ctx.zipkin = {
      pid: id,
      tracer,
      instrumentation
    }

    await next()

    tracer.scoped(() => {
      tracer.setId(id)
      instrumentation.recordResponse(tracer.id, `${ctx.status}`)
    })
  } else {
    await next()
  }
}
