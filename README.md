# Project Setup

## Install Deno

Check the [Deno installation guide](https://deno.land/manual/getting_started/installation) for the latest instructions.

## Setup API

The API is a separate project. Check the [API README](https://github.com/icedata-top/hantang-api/blob/main/README.md) for instructions on setting up the API.

## Local Development

For local development, create a `.env` file in the project root:

``` env
APIBASE=your_api_base_here
```

Then run the following command to start the server:

``` bash
deno task start
```

## Deployment

For production, include the env flag when deploying:

``` bash
deployctl deploy  --prod  main.ts --env
```
