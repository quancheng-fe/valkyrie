import 'reflect-metadata'
import { resolve } from 'path'
import request, { SuperTest, Test } from 'supertest'
import { createServer } from '../src'

let agent: SuperTest<Test>

beforeAll(async () => {
  const server = await createServer({
    name: 'test-app',
    root: resolve(__dirname, './fixture/app'),
    graphqlServer: {
      introspection: true,
      playground: true
    }
  })
  agent = request.agent(server)
})

const TestQueryDocument = `
  query {
    recipe {
      id
      title
      description
    }
  }
`

it('query will work', async () => {
  const response = await agent.post('/graphql').send({
    operationName: null,
    query: TestQueryDocument
  })

  expect(response.status).toBe(200)
  expect(response.body).toMatchSnapshot('graphql-test-query-recipe')
})
