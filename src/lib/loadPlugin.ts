/* eslint-disable @typescript-eslint/no-explicit-any */
import Koa from 'koa'
import isFunction from 'lodash.isfunction'

export type PluginImplement<T> = (app: Koa) => T | Promise<T>

export const loadPlugin = (app: Koa) => {
  const plugins: { [key: string]: any } = {}
  return <PluginType>(
    name: string,
    pluginImplement: PluginType | PluginImplement<PluginType>
  ) => {
    const key = Symbol(`plugin:${name}`) as any

    Object.defineProperty(app.context, name, {
      get() {
        if (!plugins[key]) {
          plugins[key] = isFunction(pluginImplement)
            ? pluginImplement(app)
            : pluginImplement
        }
        return plugins[key]
      }
    })
  }
}
