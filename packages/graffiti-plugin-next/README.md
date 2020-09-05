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
  plugins: [nextPlugin],
};
```
