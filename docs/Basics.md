# Basics

## Development / production mode

Setting `NODE_ENV=production` before running your Graffiti app will ensure all required changes for production are applied.

Running `graffiti dev` will start a server while watching your files for changes and reloading server upon said changes.

So, usually you want your `package.json` scripts to looks something like:

```json
{
  "name": "example-basic",
  "scripts": {
    "start": "NODE_ENV=production graffiti",
    "develop": "graffiti dev"
  },
  "dependencies": {
    "graffiti": "*"
  }
}
```

## GraphQL Playground

GraphQL playground only works in dev mode and is accessible at `http://localhost:3000/playground` URL (if you are running with default config).

## Configuring Graffiti.js

You can provide additional options to Graffiti using `graffiti.config.js` file in your project.  
Supported fields are described below:

```js
module.exports = {
  // MongoDB URL used by Mongoose for connection to DB
  // optional, defaults to "mongodb://localhost/graffiti"
  mongoUrl: 'mongodb://localhost/graffiti-test',
  // Port for Fastify server to listen on
  // optional, defaults to 3000
  port: 3000,
  // Host for Fastify server to listen on
  // optional, defaults to 0.0.0.0
  host: '0.0.0.0',
  // Array of plugins you want to use with graffiti
  plugins: [],
};
```
