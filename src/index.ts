import { Hono } from 'hono'

type Bindings = {
  APIBASE: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  const apibase = c.env.APIBASE

  let data = await fetch(`${apibase}`)

  let json = await data.json()

  return new Response(JSON.stringify(json), {
    headers: { 'content-type': 'application/json' },
  })
})

export default app
