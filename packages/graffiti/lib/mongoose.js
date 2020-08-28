const { createConnection, Schema } = require('mongoose');
const capitalize = require('lodash/capitalize');
const { getConfig } = require('./config');

// create db connection
exports.connect = async () => {
  // load config
  const config = getConfig();
  // connect to given URL
  const db = createConnection(config.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // handle DB errors
  db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
    // exit immediately on error
    process.exit(1);
  });

  // connection ready
  await new Promise((resolve) => db.once('open', resolve));

  return db;
};

exports.buildModel = ({ db, schema, name }) => {
  const mongooseSchema = new Schema(schema);
  const schemaName = capitalize(name);
  const Model = db.model(schemaName, mongooseSchema);
  return Model;
};
