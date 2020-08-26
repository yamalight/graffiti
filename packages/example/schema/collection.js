// define notes collection
exports.schema = {
  name: String,
};

exports.relations = ({ tcs }) => {
  // define relation between collection and notes
  tcs.collection.addRelation('notes', {
    resolver: () => tcs.note.getResolver('findMany'),
    prepareArgs: {
      group: (source) => source._id,
    },
    projection: { _id: 1 },
  });
};
