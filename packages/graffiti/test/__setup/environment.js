const { MongoMemoryServer } = require('mongodb-memory-server');
const NodeEnvironment = require('jest-environment-node');

class Environment extends NodeEnvironment {
  async setup() {
    await super.setup();

    // create new in-mem mongodb server
    const mongo = new MongoMemoryServer();
    // get new URI
    const uri = await mongo.getUri();

    this.global.__MONGOD__ = mongo;
    this.global.__MONGO_URI__ = uri.replace(/\?$/g, '');
  }

  async teardown() {
    await this.global.__MONGOD__.stop();
    super.teardown();
  }
}

module.exports = Environment;
