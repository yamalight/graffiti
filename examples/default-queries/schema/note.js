// notes
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
      byIds: false,
      one: false,
      many: false,
      total: false,
      connection: false,
      pagination: false,
    },
    // you can also use `mutations: false` to disable all mutations (or queries)
    mutations: {
      create: true,
      createMany: false,
      updateById: false,
      updateOne: false,
      updateMany: false,
      removeById: false,
      removeOne: false,
      removeMany: false,
    },
  },
};
