# FAQ

## Is it ready for production?

Yes! If you find any issues - please [create a new ticket](https://github.com/yamalight/graffiti/issues).

## How does it work?

Graffiti uses [graphql-compose](https://graphql-compose.github.io/) along with [graphql-compose-mongoose](https://graphql-compose.github.io/docs/plugins/plugin-mongoose.html) and [Mongoose](https://mongoosejs.com/) to automatically generate GraphQL schema from files you create.  
It then uses [fastify](https://www.fastify.io/) together with [fastify-gql](https://github.com/mcollina/fastify-gql) to create GraphQL API from generated schema.  
All the GraphQL configuration of your projects happens automatically based on file structures, exposed schema definitions and helper functions.
