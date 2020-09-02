const Next = require('next');

const dev = process.env.NODE_ENV !== 'production';

const fastifyPlugin = async (fastify, opts, next) => {
  const app = Next({ dev });
  const handle = app.getRequestHandler();
  await app.prepare();

  if (dev) {
    fastify.get('/_next/*', (req, reply) => {
      return handle(req.req, reply.res).then(() => {
        reply.sent = true;
      });
    });
  }

  fastify.all('/*', (req, reply) => {
    return handle(req.req, reply.res).then(() => {
      reply.sent = true;
    });
  });

  fastify.setNotFoundHandler((request, reply) => {
    return app.render404(request.req, reply.res).then(() => {
      reply.sent = true;
    });
  });

  next();
};

exports.setup = async ({ server }) => {
  await server.register(fastifyPlugin);
};
