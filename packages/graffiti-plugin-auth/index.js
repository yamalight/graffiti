const fs = require('fs');
const path = require('path');
const fp = require('fastify-plugin');
const jwt = require('fastify-jwt');
const auth = require('fastify-auth');
const cookie = require('fastify-cookie');
const bcrypt = require('bcrypt');

// whether we're running in dev mode
const dev =
  process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

// html for login / register pages
let loginPage = '';
let registerPage = '';

// only load real html if we're running in dev mode
if (dev) {
  loginPage = fs.readFileSync(path.join(__dirname, 'login.html')).toString();
  registerPage = fs
    .readFileSync(path.join(__dirname, 'register.html'))
    .toString();
}

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
  cookie: {
    domain = 'localhost',
    httpOnly = true,
    secure = false,
    sameSite = false,
  } = {},
  permitPaths = [],
}) => {
  const hashPass = async (password) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  };

  // create /register & /login REST endpoints as a fastify plugin
  const fastifyPlugin = fp(async (fastify, opts, next) => {
    // register required fastify plugins
    await fastify
      .register(jwt, { secret: `jwt-${secret}-graffiti-auth` })
      .register(auth)
      .register(cookie, {
        secret: `cookies-${secret}-graffiti-auth`,
      });

    // permitted URLs list
    const permitList = ['/api/register', '/api/login'].concat(permitPaths);

    // if running in dev mode - add login / register pages
    if (dev) {
      permitList.push('/_next/');
      permitList.push('/dev/login');
      permitList.push('/dev/register');
    }

    // decorate server with verification method
    fastify.decorate('verifyJWT', async (request, reply) => {
      // if URL is permitted - return true
      if (permitList.some((pattern) => request.url.match(pattern))) {
        return true;
      }

      // get token either from cookies or from headers
      const token =
        request.cookies['graffiti-token'] ??
        request.raw.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        throw new Error('Missing token header');
      }

      try {
        // decode JWT token
        const decoded = await fastify.jwt.verify(token);

        // get user model from server and find given user
        const { user: User } = fastify.graffiti.mongoModels;
        const user = await User.findById(decoded._id).lean();

        if (!user) {
          throw new Error('Token not valid');
        }

        if (user.password !== decoded.password) {
          throw new Error('Token not valid');
        }

        // assign user to request
        request.user = user;

        return true;
      } catch (e) {
        throw new Error('Token not valid');
      }
    });

    // add pre-handler hook to all URLs to enforce auth everywhere
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
            secure,
            httpOnly,
            sameSite,
          })
          .send({ token, user: result });
      } catch (error) {
        reply.send({ error: error.toString() });
      }
    });

    // if running in dev mode
    // register additional utility pages
    if (dev) {
      // basic login page
      fastify.get('/dev/login', (req, reply) => {
        reply.type('text/html').send(loginPage);
      });
      // basic register page
      fastify.get('/dev/register', (req, reply) => {
        reply.type('text/html').send(registerPage);
      });
    }

    next();
  });

  return {
    // schemas that should be registered
    schemas,
    // setup function that adds fastify plugin
    setup: async ({ server }) => {
      await server.register(fastifyPlugin);
    },
    // context function that exposes current user to graphql via context
    context: (request, reply) => {
      return {
        user: request.user,
      };
    },
  };
};
