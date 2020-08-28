# Graffiti.js

> Graffiti.js is a minimalistic GraphQL framework

⚠ This project is still under development ⚠

## How to use

Install it:

```
$ npm install graffiti --save
```

After that, the file-system is the main API. Every `.js` file becomes a Mongoose schema that gets automatically processed and converted to GraphQL API.

Populate `./schema/note.js` inside your project:

```js
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

and then just run `graffiti` and go to `http://localhost:3000/graphql`

So far, we get:

- Automatic creation of GraphQL APIs
- Automatic relations between types (when using `ObjectId` as type)

You can find more examples in `./examples` folder.

### Manual relations

When you need to manually specify relations between models, you can do so by specifying custom `relations` functions as exports from your schema definition file.  
For example, if we'd want to be able to list all notes in given collection for example above, you'd do:

```jsx
// define notes collection
exports.schema = {
  name: String,
};

// define custom relation that resolves notes
exports.relations = ({ typedefs }) => {
  // define relation between collection and notes
  // NOTE: typedefs will always be lowercased versions of your filenames
  typedefs.collection.addRelation('notes', {
    resolver: () => typedefs.note.getResolver('findMany'),
    prepareArgs: {
      group: (source) => source._id,
    },
    projection: { _id: 1 },
  });
};
```

## Configuring Graffiti.js

You can provide additional options to Graffiti using `graffiti.config.js` file in your project.  
Currently, it allows you to set custom MongoDB URL, e.g.:

```js
module.exports = {
  mongoUrl: 'mongodb://localhost/graffiti-test',
};
```

## Future directions

The following issues are currently being explored and input from the community is appreciated:

- Support for plugins (e.g. auth, next.js as front-end, etc.) [[#1](https://github.com/yamalight/graffiti/issues/1)]
- Way to change / remove default GraphQL methods [[#2](https://github.com/yamalight/graffiti/issues/2)]
- Support for custom resolvers and GraphQL methods [[#3](https://github.com/yamalight/graffiti/issues/3)]
- Production-ready deployment [[#4](https://github.com/yamalight/graffiti/issues/4)]
