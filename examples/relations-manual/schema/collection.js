// define notes collection
exports.schema = {
  name: String,
};

exports.relations = ({ typedefs }) => {
  // define relation between collection and notes
  typedefs.collection.addRelation('notes', {
    resolver: () => typedefs.note.getResolver('findMany'),
    prepareArgs: {
      group: (source) => source._id,
    },
    projection: { _id: 1 },
  });
};
