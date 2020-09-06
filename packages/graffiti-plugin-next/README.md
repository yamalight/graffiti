# Next.js plugin for Graffiti.js

Create Next.js pages with [Graffiti.js](https://github.com/yamalight/graffiti/) GraphQL backend.

## Installation

```sh
npm install graffiti-plugin-next
```

## Usage

Create a `graffiti.config.js` in your project

```js
// next.config.js
const nextPlugin = require('graffiti-plugin-next');

module.exports = {
  mongoUrl: 'mongodb://localhost/graffiti',
  plugins: [nextPlugin()],
};
```

## Building for production

To create Next.js build for production you can either:

- execute `next build` manually as usual, e.g.:

```json
{
  "name": "example-plugin-next",
  "scripts": {
    "start": "NODE_ENV=production graffiti",
    "build": "next build",
    "develop": "graffiti dev"
  },
  "dependencies": {
    "graffiti": "*",
    "graffiti-plugin-next": "*"
  }
}
```

- pass `autobuild: true` to plugin to enable autobuilding (this slows down server start-up time quite a bit), e.g.:

```js
const nextPlugin = require('graffiti-plugin-next');

module.exports = {
  mongoUrl: 'mongodb://localhost/graffiti',
  plugins: [nextPlugin({ autobuild: true })],
};
```
