# Next.js plugin for Graffiti.js

Create Next.js pages with [Graffiti.js](https://github.com/yamalight/graffiti/) GraphQL backend.

## Installation

```sh
npm install graffiti-plugin-next next react react-dom
```

Note: Next.js, React and React-DOM are peer dependencies and should be installed along with the plugin.

## Usage

Create a `graffiti.config.js` in your project

```js
const nextPlugin = require('graffiti-plugin-next');

module.exports = {
  mongoUrl: 'mongodb://localhost/graffiti',
  plugins: [nextPlugin()],
};
```

## Development mode

By default Graffiti will use [nodemon](https://github.com/remy/nodemon) in development mode to auto-restart server on file changes.  
This makes Next.js development experience suboptimal. If you wish to use hot reload provided by Next.js, you'll need to create custom `nodemon.json` config that ignores changes to `pages/` folder, e.g.:

```json
{
  "ignore": [".git", "node_modules", "pages/**/*"]
}
```

## Building for production

Please remember that to create Next.js build for production you need to execute `next build` manually as usual, e.g.:

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
    "graffiti-plugin-next": "*",
    "next": "*",
    "react": "*",
    "react-dom": "*"
  }
}
```
