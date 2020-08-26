// notes
exports.schema = {
  name: String,
  body: String,
  group: { type: 'ObjectId', ref: 'Collection' },
};

exports.relations = ({ tcs }) => {
  // define relation between notes and collections
  tcs.note.addRelation('collection', {
    resolver: () => tcs.collection.getResolver('findById'),
    prepareArgs: {
      _id: (source) => source.group,
    },
    projection: { group: 1 },
  });
};
