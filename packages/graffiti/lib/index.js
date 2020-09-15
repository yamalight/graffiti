const fastify = require('fastify');
const GQL = require('fastify-gql');
const { buildSchema } = require('./graphql');
const { loadPlugins } = require('./plugins');
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
// playground config
const playgroundConf = {
  graphiql: 'playground',
  playgroundSettings: {
    'request.credentials': 'omit' | 'include' | 'same-origin',
  },
};

// Build the server
const build = async () => {
  // get config for settings
  const projectConfig = getConfig();
  // connect to db
  const db = await connect({ projectConfig });
  // create fastify instance
  const server = fastify(fastifyConfig);
  // load plugins
  const plugins = await loadPlugins({ projectConfig });
  // create graphql schema
  const {
    graphqlSchema,
    schemaComposer,
    typedefs,
    mongoModels,
  } = await buildSchema({
    db,
    plugins,
    projectConfig,
  });
  // expose newly constructed typedefs, models and composer using fastify
  server.decorate('graffiti', {
    schemaComposer,
    typedefs,
    mongoModels,
  });
  // construct fastify server
  // database cleanup on close
  await server.register(async (instance, opts, done) => {
    instance.addHook('onClose', async (_instance, done) => {
      db.close();
      done();
    });
    done();
  });
  // apply plugins to fastify
  await Promise.all(plugins.map((plugin) => plugin.setup?.({ server })));
  // register graphql with new schema server in fastify
  await server.register(GQL, {
    schema: graphqlSchema,
    // only enable playground in dev mode
    ...(isProduction ? undefined : playgroundConf),
    context: (request, reply) => {
      // apply plugins context functions if available
      const context = plugins
        // get new context from plugins
        .map((plugin) => plugin.context?.(request, reply))
        // remove empty values
        .filter((context) => context !== undefined)
        // reduce to object
        .reduce((acc, val) => ({ ...acc, ...val }), {});
      return context;
    },
  });
  return server;
};
exports.build = build;

// Run the server
exports.start = async () => {
  try {
    // create graphql server
    const instance = await build();
    // get config for host-port settings
    const config = getConfig();
    await instance.listen(config.port, config.host);
    // log port
    console.log(`Graffiti started on ${instance.server.address().port}`);
  } catch (err) {
    console.error('Error starting Graffiti server:', err);
    process.exit(1);
  }
};
