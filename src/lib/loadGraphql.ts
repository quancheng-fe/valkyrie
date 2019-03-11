import { resolve } from 'path'
import { buildSchema } from 'type-graphql'
import { Container, ContainerInstance } from 'typedi'
import globby from 'globby'
import { ApolloServer, Config } from 'apollo-server-koa'
import { GraphQLSchema } from 'graphql'
import { loadFunction } from '../types'

export const ERR_MESSAGE = {
  RESOLVER_FILES_NOT_FOUND: 'resolver files not found!'
}

export const loadSchema = async (
  path: string,
  container?: ContainerInstance
): Promise<GraphQLSchema> => {
  const resolverFiles = await globby(resolve(path, './**/**.resolver.**'))

  if (!resolverFiles.length) {
    throw new Error(ERR_MESSAGE.RESOLVER_FILES_NOT_FOUND)
  }

  return buildSchema({
    resolvers: resolverFiles.map(file => {
      return require(file)
    }),
    container: container || Container
  })
}

export const loadGraphql: loadFunction<Config, ApolloServer> = async (
  path,
  app,
  config
) => {
  const schema = await loadSchema(path)
  const gqlServer = new ApolloServer({ schema, ...config })
  gqlServer.applyMiddleware({ app })
  return gqlServer
}
