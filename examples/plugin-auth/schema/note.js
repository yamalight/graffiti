// notes
exports.schema = {
  name: String,
  body: String,
  // link to user
  user: { type: 'ObjectId', ref: 'User' },
};
