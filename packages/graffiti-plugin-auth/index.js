const fp = require('fastify-plugin');
const jwt = require('fastify-jwt');
const auth = require('fastify-auth');
const cookie = require('fastify-cookie');
const bcrypt = require('bcrypt');

// Export user schema that is used to create
// User model in DB and GraphQL User type
const schemas = [
  {
    name: 'user',
    schema: {
      email: { type: 'String', unique: true },
      username: 'String',
      password: 'String',
    },
    config: {
      // define defaults
      defaults: {
        // allow only querying for user by ID
        queries: {
          byId: true,
          byIds: false,
          one: false,
          many: false,
          total: false,
          connection: false,
          pagination: false,
        },
        // allow only updating user by ID
        mutations: {
          updateById: true,
          create: false,
          createMany: false,
          updateOne: false,
          updateMany: false,
          removeById: false,
          removeOne: false,
          removeMany: false,
        },
      },
    },
  },
];

module.exports = ({
  secret,
  saltRounds = 10,
  domain = 'localhost',
  httpOnly = true,
  secure = false,
  sameSite = false,
}) => {
  const hashPass = async (password) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  };

  // create /register & /login REST endpoints as a fastify plugin
  const fastifyPlugin = fp(async (fastify, opts, next) => {
    await fastify
      .register(jwt, { secret: `jwt-${secret}-graffiti-auth` })
      .register(auth)
      .register(cookie, {
        secret: `cookies-${secret}-graffiti-auth`,
      });

    const permitList = ['/api/register', '/api/login'];

    fastify.decorate('verifyJWT', async (request, reply) => {
      if (permitList.includes(request.url)) {
        return true;
      }

      const token =
        request.cookies['graffiti-token'] ?? request.raw.headers.auth;
      if (!token) {
        throw new Error('Missing token header');
      }

      try {
        const decoded = await fastify.jwt.verify(token);

        const { user: User } = fastify.graffiti.mongoModels;
        const user = await User.findById(decoded._id).lean();

        if (!user) {
          throw new Error('Token not valid');
        }

        if (user.password !== decoded.password) {
          throw new Error('Token not valid');
        }

        return true;
      } catch (e) {
        throw new Error('Token not valid');
      }
    });

    fastify.addHook('preHandler', fastify.auth([fastify.verifyJWT]));

    // login endpoint
    fastify.post('/api/login', async (req, reply) => {
      try {
        const { email, password } = req.body;
        const { user: User } = fastify.graffiti.mongoModels;
        const user = await User.findOne({ email }).lean();
        if (!user) {
          throw new Error('Wrong email or password!');
        }
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
          throw new Error('Wrong email or password!');
        }
        const token = await reply.jwtSign(user);
        reply
          .setCookie('graffiti-token', token, {
            domain,
            path: '/',
            secure,
            httpOnly,
            sameSite,
          })
          .send({ token, user });
      } catch (error) {
        reply.send({ error: error.toString() });
      }
    });

    // register endpoint
    fastify.post('/api/register', async (req, reply) => {
      try {
        const { email, username, password } = req.body;
        const { user: User } = fastify.graffiti.mongoModels;
        const hashedPassword = await hashPass(password);
        const user = new User({ email, username, password: hashedPassword });
        await user.save();
        const result = user.toObject();
        const token = await reply.jwtSign(result);
        reply
          .setCookie('graffiti-token', token, {
            domain,
            path: '/',
            secure: true, // send cookie over HTTPS only
            httpOnly: true,
            sameSite: true, // alternative CSRF protection
          })
          .send({ token, user: result });
      } catch (error) {
        reply.send({ error: error.toString() });
      }
    });

    next();
  });

  return {
    schemas,
    setup: async ({ server }) => {
      await server.register(fastifyPlugin);
    },
  };
};
