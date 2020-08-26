const { createConnection, Schema } = require('mongoose');
const { getConfig } = require('./config');

// load config
const config = getConfig();
// connect to given URL
const db = createConnection(config.mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
exports.db = db;

// handle DB errors
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
  // exit immediately on error
  process.exit(1);
});

// connection
exports.isConnected = new Promise((resolve) => db.once('open', resolve));

exports.buildModel = ({ schema, name }) => {
  const mongooseSchema = new Schema(schema);
  const Model = db.model(name, mongooseSchema);
  return Model;
};
