/* eslint-env jest */
const { getConfig } = jest.requireActual('../config');

// mock for config, return globally set mongo URI instead of real config
exports.getConfig = () => {
  const originalConfig = getConfig();
  return {
    ...originalConfig,
    // replace mongo URL with one in-mem
    mongoUrl: global.__MONGO_URI__,
  };
};
