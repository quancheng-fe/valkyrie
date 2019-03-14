# valkyriejs

A typed tiny-graphql-server with common middlewares

## What's in it

- type-graphql
- typeorm
- redis
- typedi

## Dependency

- node >= 8
- aliyun-acm
- reflect-metadata
- typescript

## How To Use

### folder structure

```text
- src
  -  entities
     - model.entity.ts

  -  middlewares
     - handle.middleware.ts

  -  resolvers
     - schema.resolver.ts

- tsconfig.json
```

### createServer

```ts
// index.ts

import 'reflect-metadata'
import { createServer } from '@quancheng/valkyriejs'
;(async () => {
  const server = await createServer({
    root: __dirname,
    graphqlServer: {}
  })

  server.listen('3411', () => {
    console.log(`started`)
  })
})()
```

## Todo

- [ ] serverless support
