import 'reflect-metadata'
import { createServer } from '../../../src'
import { resolve } from 'path'
;(async () => {
  const server = await createServer({
    root: resolve(__dirname, './resolvers'),
    graphqlServer: {
      introspection: true
    }
  })
  server.listen(3144)
})()
