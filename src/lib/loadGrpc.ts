import { join } from 'path'
import grpc, { credentials } from 'grpc'
import { readFileSync } from 'fs-extra'
import Container from 'typedi'
import BPromise from 'bluebird'
import { Eureka } from 'eureka-js-client'
import ip from 'ip'
import { sample } from 'lodash'
import { NodeBaseConfig } from './loadConfig'
import { ServerOptions } from '../server'

const pem = readFileSync(join(__dirname, '../../resource/server.pem'))

interface GrpcClientClassOptions {
  name: string
}

let eurekaClient: Eureka

export const setupEureka = (
  config: ServerOptions & NodeBaseConfig
): Promise<Eureka> => {
  return new Promise((resolve, reject) => {
    eurekaClient = new Eureka({
      instance: {
        app: config.name,
        hostName: 'localhost',
        ipAddr: ip.address(),
        port: {
          $: 8080,
          '@enabled': 'true'
        },
        vipAddress: `${config.name}.nodejs`,
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          name: 'MyOwn'
        }
      },
      eureka: {
        serviceUrls: {
          default: config.eureka.split(',')
        },
        heartbeatInterval: 5000,
        registryFetchInterval: 1000,
        shouldUseDelta: true
      }
    } as any)

    eurekaClient.start(err => {
      if (err) reject(err)
      resolve(eurekaClient)
    })
  })
}

const createGrpcClient = (
  Client: typeof grpc.Client,
  option?: GrpcClientClassOptions
) => {
  const sslCreds = credentials.createSsl(pem)
  const instances = eurekaClient.getInstancesByAppId(option.name)
  const randomInstance = sample(instances)
  const host = `${randomInstance.ipAddr}:${(randomInstance.port as any).$ + 1}`
  const client = new Client(host, sslCreds, {
    'grpc.ssl_target_name_override': 'grpc',
    'grpc.default_authority': 'grpc',
    'grpc.max_send_message_length': 8 * 1024 * 1024,
    'grpc.max_receive_message_length': 8 * 1024 * 1024
  })
  return BPromise.promisifyAll(client)
}

export const InjectGrpcService = (
  Client: typeof grpc.Client,
  option?: GrpcClientClassOptions
): Function => (
  target: Record<string, any>,
  propertyName: string,
  index?: number
): any => {
  Container.registerHandler({
    object: target,
    propertyName: propertyName,
    index: index,
    value: () => {
      return createGrpcClient(Client, option)
    }
  })
}
