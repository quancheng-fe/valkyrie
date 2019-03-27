import 'reflect-metadata'
import { resolve } from 'path'
import request, { SuperTest, Test } from 'supertest'
import { createServer } from '../src'

let agent: SuperTest<Test>

beforeAll(async () => {
  const server = await createServer({
    name: 'test-app',
    root: resolve(__dirname, './fixture/app/resolvers'),
    graphqlServer: {
      introspection: true,
      playground: true
    }
  })
  agent = request.agent(server)
})

it('will work', async () => {
  const response = await agent.post('/graphql')
  expect(response.text).toBe('Hello World')
  expect(response.body).toBe('Hello World')
  expect(response.status).toBe(200)
})
