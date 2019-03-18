import { resolve } from 'path'
import { buildSchema, ContainerType } from 'type-graphql'
import globby from 'globby'
import { ApolloServer, Config } from 'apollo-server-koa'
import { GraphQLSchema } from 'graphql'
import Container from 'typedi'
import { loadFromPath } from '../types'

export const ERR_MESSAGE = {
  RESOLVER_FILES_NOT_FOUND: 'resolver files not found!'
}

export const loadSchema = async (
  path: string,
  container?: ContainerType
): Promise<GraphQLSchema> => {
  const resolverFiles = await globby(resolve(path, './**/**.resolver.(js|ts)'))

  if (!resolverFiles.length) {
    throw new Error(ERR_MESSAGE.RESOLVER_FILES_NOT_FOUND)
  }

  return buildSchema({
    resolvers: resolverFiles.map(file => {
      return require(file)
    }),
    container
  })
}

export const loadGraphql: loadFromPath<Config, ApolloServer> = async (
  path,
  app,
  config
) => {
  const schema = await loadSchema(path, Container)
  const gqlServer = new ApolloServer({
    schema,
    ...config.graphqlServer,
    context: ({ ctx }) => ctx
  })
  gqlServer.applyMiddleware({ app })
  return gqlServer
}
