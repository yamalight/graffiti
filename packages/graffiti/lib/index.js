const fastify = require('fastify');
const GQL = require('fastify-gql');
const { buildSchema } = require('./graphql');
const { connect } = require('./mongoose');
const { getConfig } = require('./config');

// detect if we're running in production
const isProduction = process.env.NODE_ENV === 'production';
const isTesting = process.env.NODE_ENV === 'test';
// change default logging level based on production state
const loggingLevel = isProduction || isTesting ? 'error' : 'info';
// pass logging settings to fastify config
const fastifyConfig = {
  logger: {
    prettyPrint: !isProduction,
    level: loggingLevel,
  },
};

// Build the server
const build = async () => {
  // connect to db
  const db = await connect();
  // create fastify instance
  const server = fastify(fastifyConfig);
  // create graphql schema
  const schema = await buildSchema({ db });
  // construct fastify server
  await server
    // init database, job queue & cleanup on close
    .register(async (instance, opts, done) => {
      instance.addHook('onClose', async (_instance, done) => {
        db.close();
        done();
      });
      done();
    })
    // register graphql with new schema server in fastify
    .register(GQL, {
      schema,
      // only enable playground in dev mode
      graphiql: isProduction ? false : 'playground',
    });
  return server;
};
exports.build = build;

// Run the server
exports.start = async () => {
  try {
    // get config for host-port settings
    const config = getConfig();
    // create graphql server
    const instance = await build();
    await instance.listen(config.port ?? 3000, config.host ?? '0.0.0.0');
    // log port
    instance.log.info(`Graffiti started on ${instance.server.address().port}`);
  } catch (err) {
    console.error('Error starting Graffiti server:', err);
    process.exit(1);
  }
};
