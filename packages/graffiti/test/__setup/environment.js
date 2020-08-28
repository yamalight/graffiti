const NodeEnvironment = require('jest-environment-node');

class Environment extends NodeEnvironment {
  async setup() {
    await super.setup();
  }
}

module.exports = Environment;
