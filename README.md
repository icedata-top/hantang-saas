# Project Setup

```
pnpm install
```

## Development

```
pnpm run dev
```

## Deployment 

```
pnpm run deploy
```

## Setting up Secrets

For local development, create a `.dev.vars` file in the project root:
```
APIBASE=your_api_base_here
```

For production, set the secret using Wrangler CLI:
```
wrangler secret put APIBASE
```