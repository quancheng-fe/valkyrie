import 'reflect-metadata'
import { resolve } from 'path'
import request, { SuperTest, Test } from 'supertest'
import { createServer } from '../src'

let agent: SuperTest<Test>

beforeAll(async () => {
  const server = await createServer({
    root: resolve(__dirname, './fixture/app/resolvers'),
    graphqlServer: {
      introspection: true
    }
  })
  agent = request.agent(server.callback())
})

it('will work', async () => {
  const response = await agent.get('/graphql')

  expect(response.status).toBe(200)
  expect(response.text).toBe('Hello World')
})
