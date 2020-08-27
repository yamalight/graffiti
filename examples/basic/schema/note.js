// notes
exports.schema = {
  name: String,
  body: String,
  group: { type: 'ObjectId', ref: 'Collection' },
};
