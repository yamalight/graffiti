const fastify = require('fastify');
const { ApolloServer, gql } = require('apollo-server-fastify');
const { isConnected } = require('./mongoose');
const { buildSchema } = require('./graphql');

// build the server
exports.build = async () => {
  const server = fastify({ logger: true });
  // wait for DB connection
  await isConnected;
  // create graphql schema
  const schema = await buildSchema();
  // create graphql server
  const gqlServer = new ApolloServer({ schema });
  // register graphql server in fastify
  await server.register(gqlServer.createHandler());
  return server;
};

// Run the server
exports.start = async () => {
  try {
    // create graphql server
    const instance = await exports.build();
    await instance.listen(3000);
    instance.log.info(`server listening on ${instance.server.address().port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
