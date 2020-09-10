<img alt="Exoframe" src="./logo/svg/splash.svg" width="300">

> Graffiti.js is a minimalistic GraphQL framework

## How to use

Install it:

```
$ npm install graffiti --save
```

After that, the file-system is the main API. Every `.js` file becomes a Mongoose schema that gets automatically processed and converted to GraphQL API.

Populate `./schema/note.js` inside your project:

```js
// export new Mongoose.js schema definition
exports.schema = {
  name: String,
  body: String,
  // NOTE: Mongoose model names will always be capitalized versions of your filenames
  group: { type: 'ObjectId', ref: 'Collection' },
};
```

and `/schema/collection.js`:

```js
exports.schema = {
  name: String,
};
```

and then just run `graffiti dev` and go to `http://localhost:3000/playground`

So far, we get:

- Automatic creation of GraphQL APIs
- Automatic relations between types (when using `ObjectId` as type)
- Access to GraphQL playground (in development mode)
- Way to add manual resolvers or GraphQL methods
- Way to setup manual complex relations
- Automatic app reload on schema changes (in development mode)
- Extensibility via third-party plugins

## How it works

Graffiti.js is built on top of [fastify](https://www.fastify.io/), [graphql-compose](https://graphql-compose.github.io/) and [Mongoose](https://mongoosejs.com/).  
Graffiti is heavily inspired by awesome [Next.js](https://nextjs.org/) and is mostly there to remove the need to write boilerplate code yourself.

You can find detailed documentation in [`./docs` folder](./docs/README.md).

You can also find more examples in [`./examples` folder](./examples).

## Special thanks

A huge thank you to:

- [Jay Phelps](https://github.com/jayphelps) for releasing the "graffiti" npm package name to me!
- [Ivan Semenov](https://www.behance.net/ivan_semenov) for making [an awesome logo](./logo/README.md)
