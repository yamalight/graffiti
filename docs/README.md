# Graffiti.js Documentation

Extended docs will be here.
See basics in [main README.md](../README.md).

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
