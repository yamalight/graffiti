const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/graphqlexample', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

exports.isConnected = new Promise((resolve) => db.once('open', resolve));
exports.db = db;

exports.buildModel = ({ schemaDefinition, modelName }) => {
  const schema = new mongoose.Schema(schemaDefinition);
  const Model = mongoose.model(modelName, schema);
  return Model;
};
