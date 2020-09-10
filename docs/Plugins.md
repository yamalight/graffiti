# Plugins

Graffiti provides a way to extend its functionality with plugins.  
You can find two example plugins in this repo:

- [graffiti-plugin-auth](../packages/graffiti-plugin-auth) - simple email & password-based auth
- [graffiti-plugin-next](../packages/graffiti-plugin-next) - Next.js integration to allow for easy creation of frontend

## Using plugins

Plugins can be added to your Graffiti project by simply create `graffiti.config.js` file and adding corresponding plugin(s) to it.

In example shown below we add auth plugin and pass `secret` as option to it:

```js
const authPlugin = require('graffiti-plugin-auth');

module.exports = {
  mongoUrl: 'mongodb://localhost/graffiti-example',
  plugins: [authPlugin({ secret: 'my_super_secret_jwt_secret' })],
};
```

## Creating plugins

Plugins are separate modules, that might optionally take in user options, and contain set of properties that are automatically used withing Graffiti when plugin is registered.

```js
module.exports = (options) => {
  return {
    // additional schemas that should be registered
    schemas: [
      {
        // new schema name, in this case - user
        name: 'user',
        // other properties follow the structure of schema/*.js files
        schema: {
          username: 'String',
          password: 'String',
        },
      },
    ],
    // setup function that has access to fastify server instance
    // usually, you want to add fastify plugins here
    setup: async ({ server }) => {
      await server.register(fastifyPlugin);
    },
    // context function that allows adding data to graphql via context
    // in this case add `context.hello === 'world'`
    // to consume context - you will need to use custom resolvers
    context: (request, reply) => {
      return {
        hello: 'world',
      };
    },
  };
};
```
