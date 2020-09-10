# Basic auth plugin for Graffiti.js

Add basic email & password based authentication to [Graffiti.js](https://github.com/yamalight/graffiti/) GraphQL backend.

## Installation

```sh
npm install graffiti-plugin-auth
```

## Usage

Create a `graffiti.config.js` in your project:

```js
const authPlugin = require('graffiti-plugin-auth');

module.exports = {
  mongoUrl: 'mongodb://localhost/graffiti-example',
  plugins: [authPlugin({ secret: 'my_super_secret_jwt_secret' })],
};
```

## Plugin settings

Auth plugin accepts the following options during init:

```js
authPlugin({
  // secret used as base for JWT generation and cookies
  secret,
  // number of salt rounds used in bcrypt (optional)
  saltRounds = 10,
  // cookie settings (optional)
  cookie: {
    domain = 'localhost',
    httpOnly = true,
    secure = false,
    sameSite = false,
  } = {},
  // additional permit paths that are allowed without auth (optional)
  permitPaths = [],
  // redirect path, executed when user requests text/html and is not authed (optional)
  redirectPath,
});
```

## Dev-mode auth forms

For convenience, when running in development mode, auth plugin creates two pages `/dev/register` and `/dev/login` that allow you to register and login without setting up any front-end.

## Accessing current user

You might need to access current user in some cases.
This can be either done from fastify (through `request.user`), or through GraphQL context, e.g.:

```js
// define new resolvers function that will create our custom resolver
exports.resolvers = ({ typedef, model: Model }) => {
  // Define new resolver 'myResolver' resolver
  // This example is just a simple resolver that shows how to access current user
  typedef.addResolver({
    name: 'myResolver',
    type: typedef,
    resolve: async ({ source, args, context, info }) => {
      // This is your current authed user
      const currentUser = context.user;
      // ...
      return result;
    },
  });
};
```
