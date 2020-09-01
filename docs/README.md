# Graffiti.js Documentation

Extended docs will be here.
See basics in [main README.md](../README.md).

## Development / production mode

Setting `NODE_ENV=production` before running your Graffiti app will ensure all required changes for production are applied.

Running `graffiti dev` will start a server while watching your files for changes and reloading server upon said changes.

So, usually you want your `package.json` scripts to looks something like:

```json
{
  "name": "example-basic",
  "scripts": {
    "start": "NODE_ENV=production graffiti",
    "develop": "graffiti dev"
  },
  "dependencies": {
    "graffiti": "*"
  }
}
```

## GraphQL Playground

GraphQL playground only works in dev mode and is accessible at `http://localhost:3000/playground` URL (if you are running with default config).

## Manual relations

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

## Disabling default queries and mutations

By default, Graffiti generates all possible mutations and queries for given schema.  
That might not always be desirable.  
You can selectively disable mutations and queries by exporting `config` object from your schema definition file.
E.g.:

```js
// notes schema
exports.schema = {
  name: String,
  body: String,
};

// config for default queries
exports.config = {
  // define defaults
  defaults: {
    // change what queries are allowed
    queries: {
      byId: true, // normally, this can be omitted since `true` is default
      byIds: false, // will disable this query
      one: false,
      many: false,
      total: false,
      connection: false,
      pagination: false,
    },
    // you can also use `mutations: false` to disable all mutations (or queries)
    mutations: {
      create: true,
      createMany: false, // will disable this mutation
      updateById: false,
      updateOne: false,
      updateMany: false,
      removeById: false,
      removeOne: false,
      removeMany: false,
    },
  },
};
```

## Custom resolvers

There are cases when you might want to extend your schema with custom resolvers.  
Graffiti provides a way to create custom resolvers and then add them to your GraphQL schema.
Resolvers can be created using `exports.resolvers` function in your schema definition file.
While registering them in GraphQL schema is achieved by using `exports.compose` function.  
E.g.:

```js
// notes schema
exports.schema = {
  name: String,
  body: String,
};

// define new resolvers function that will create
// our custom resolver
exports.resolvers = ({ typedef, model }) => {
  // Define new resolver 'customGetNoteById' resolver
  // This example is just a simple resolver that gets note by given ID
  typedef.addResolver({
    name: 'customGetNoteById',
    type: typedef,
    args: { id: 'MongoID!' },
    resolve: async ({ source, args: { id }, context, info }) => {
      const note = await model.findById(id).lean();
      return note;
    },
  });
};

// define new compose function that will register our custom resolver
// in graphql schema so we can actually use it
exports.compose = ({ schemaComposer, typedef }) => {
  schemaComposer.Query.addFields({
    noteCustomById: typedef.getResolver('customGetNoteById'),
  });
};
```

## Configuring Graffiti.js

You can provide additional options to Graffiti using `graffiti.config.js` file in your project.  
Supported fields are described below:

```js
module.exports = {
  // MongoDB URL used by Mongoose for connection to DB
  // optional, defaults to "mongodb://localhost/graffiti"
  mongoUrl: 'mongodb://localhost/graffiti-test',
  // Port for Fastify server to listen on
  // optional, defaults to 3000
  port: 3000,
  // Host for Fastify server to listen on
  // optional, defaults to 0.0.0.0
  host: '0.0.0.0',
};
```
