const { ApolloServer } = require('apollo-server-fastify');
const fastify = require('fastify');
const { buildSchema } = require('./graphql');
const { isConnected, db } = require('./mongoose');

// Build the server
const build = async () => {
  const server = fastify({ logger: true });
  // create graphql schema
  const schema = await buildSchema();
  // create graphql server
  const gqlServer = new ApolloServer({ schema });
  await server
    // init database, job queue & cleanup on close
    .register(async (instance, opts, done) => {
      // wait for DB connection
      await isConnected;
      instance.addHook('onClose', async (_instance, done) => {
        db.close();
        done();
      });
      done();
    })
    // register graphql server in fastify
    .register(gqlServer.createHandler());
  return { server, gqlServer };
};
exports.build = build;

// Run the server
exports.start = async () => {
  try {
    // create graphql server
    const { server: instance } = await build();
    await instance.listen(3000);
    // log port
    instance.log.info(`Graffiti started on ${instance.server.address().port}`);
  } catch (err) {
    console.error('Error starting Graffiti server:', err);
    process.exit(1);
  }
};
