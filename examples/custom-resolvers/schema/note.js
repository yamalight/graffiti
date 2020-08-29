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
