const Next = require('next');
const { exec } = require('./util');

const dev =
  process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

const fastifyPlugin = async (fastify, opts, next) => {
  // get workdir to use as next project folder
  const workDir = process.cwd();

  // init next app
  const app = Next({ dev, quiet: !dev, dir: workDir });
  const handle = app.getRequestHandler();
  await app.prepare();

  // if running in dev mode - expose HMR related things
  if (dev) {
    fastify.get('/_next/*', (req, reply) => {
      return handle(req.raw, reply.raw).then(() => {
        reply.sent = true;
      });
    });
  }

  fastify.all('/*', (req, reply) => {
    return handle(req.raw, reply.raw).then(() => {
      reply.sent = true;
    });
  });

  fastify.setNotFoundHandler((request, reply) => {
    return app.render404(request.raw, reply.raw).then(() => {
      reply.sent = true;
    });
  });

  next();
};

exports.setup = async ({ server }) => {
  // if running in prod (or in tests) - build next files
  if (!dev) {
    // get workdir to use as next project folder
    const workDir = process.cwd();
    // run "next build"
    await exec('npx', ['next', 'build', workDir]);
  }

  await server.register(fastifyPlugin);
  return server;
};
