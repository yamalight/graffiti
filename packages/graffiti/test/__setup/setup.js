/* eslint-env jest */
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  // create new in-mem mongodb server
  global.__MONGOD__ = new MongoMemoryServer();
  const uri = await global.__MONGOD__.getUri();
  process.env.MONGO_URL = uri.replace(/\?$/g, '');
};
