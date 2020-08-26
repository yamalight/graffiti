const { ApolloServer } = require('apollo-server-fastify');
const fastify = require('fastify');
const { buildSchema } = require('./graphql');
const { isConnected } = require('./mongoose');

// Build the server
const build = async () => {
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
exports.build = build;

// Run the server
exports.start = async () => {
  try {
    // create graphql server
    const instance = await build();
    await instance.listen(3000);
    // log port
    instance.log.info(`Graffiti started on ${instance.server.address().port}`);
  } catch (err) {
    console.error('Error starting Graffiti server:', err);
    process.exit(1);
  }
};
