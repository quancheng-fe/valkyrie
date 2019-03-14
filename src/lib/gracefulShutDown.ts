import http from 'http'
import { Logger } from 'pino'

let isShuttingDown = false

export interface GracefulShutDownOptions {
  onShutDown?: Function
  forceTimeout?: number
}

export const gracefulShutDown = (
  server: http.Server,
  logger: Logger,
  options: GracefulShutDownOptions
) => async () => {
  if (!isShuttingDown) {
    isShuttingDown = true
  } else {
    return
  }

  logger.warn('the server is shutting down')

  setTimeout(() => {
    logger.error(
      'Could not close connections in time, forcefully shutting down'
    )
    process.exit(1)
  }, options.forceTimeout || 3000)

  if (options.onShutDown) {
    await options.onShutDown()
  }

  server.close(() => {
    logger.info('Closed out remaining connections')
    process.exit(0)
  })
}
