// notes
exports.schema = {
  name: String,
  body: String,
  // link to user
  user: { type: 'ObjectId', ref: 'User' },
};

// config for default queries
exports.config = {
  // define defaults
  defaults: {
    // disable default queries and mutations
    queries: false,
    mutations: false,
  },
};

// define new resolvers function that will create
// our custom resolver
exports.resolvers = ({ typedef, model: Model }) => {
  // Define new resolver 'userNoteCreate' resolver
  // This example is just a simple resolver that creates note with current user
  typedef.addResolver({
    name: 'userNoteCreate',
    type: typedef,
    args: { name: 'String!', body: 'String!' },
    resolve: async ({ source, args: { name, body }, context, info }) => {
      const note = new Model({ name, body, user: context.user._id });
      await note.save();
      return note;
    },
  });

  // Define new resolver 'userNotes' resolver
  // This example is just a simple resolver that gets note for current user
  typedef.addResolver({
    name: 'userNotes',
    type: [typedef],
    resolve: async ({ source, args: { name, body }, context, info }) => {
      const notes = await Model.find({ user: context.user._id }).lean();
      return notes;
    },
  });
};

// define new compose function that will register our custom resolver
// in graphql schema so we can actually use it
exports.compose = ({ schemaComposer, typedef }) => {
  schemaComposer.Query.addFields({
    userNotes: typedef.getResolver('userNotes'),
  });
  schemaComposer.Mutation.addFields({
    userNoteCreate: typedef.getResolver('userNoteCreate'),
  });
};
