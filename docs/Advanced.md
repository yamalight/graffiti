# Advanced

## Manual relations

When you need to manually specify relations between models, you can do so by specifying custom `relations` functions as exports from your schema definition file.  
For example, if we'd want to be able to list all notes in given collection for example above, you'd do:

```jsx
// define notes collection in schema/collection.js
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

Property `typedefs` your function will receive here is an object that contains [graphql-compose types](https://graphql-compose.github.io/docs/basics/understanding-types.html) mapped to corresponding (lowercased) file names.  
E.g. if you defined `schema/collection.js` schema as described above, it would be accessible via `typedefs.collection`.

## Disabling default queries and mutations

By default, Graffiti generates all possible mutations and queries for given schema.  
That might not always be desirable.  
You can selectively disable mutations and queries by exporting `config` object from your schema definition file.
E.g.:

```js
// notes Mongoose schema
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

Property `model` your `resolvers` function will receive here is a [Mongoose model](https://mongoosejs.com/docs/models.html) generated from schema definition in current file.

Property `schemaComposer` passed to `compose` function is instance of [SchemaCompose from graphql-compose](https://graphql-compose.github.io/docs/api/SchemaComposer.html), while `typedef` is a [graphql-compose type](https://graphql-compose.github.io/docs/basics/understanding-types.html) generated from Mongoose model created in current file.
