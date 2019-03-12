import Koa from 'koa'

export type PluginImplement<T> = (app: Koa) => T

export const loadPlugin = (app: Koa) => {
  const plugins: { [key: string]: any } = {}
  return <PluginType>(
    name: string,
    pluginImplement: PluginImplement<PluginType>
  ) => {
    const key = Symbol(`plugin:${name}`) as any

    Object.defineProperty(app.context, name, {
      get() {
        if (!plugins[key]) {
          plugins[key] = pluginImplement(app)
        }
        app.context[name] = plugins[key]
      }
    })
  }
}
