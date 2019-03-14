import * as Sentry from '@sentry/node'

export const loadSentry = (dsn?: string) => {
  if (dsn) Sentry.init({ dsn })
  return Sentry
}
