// mock for config, return globally set mongo URI instead of real config
exports.getConfig = () => ({
  mongoUrl: global.__MONGO_URI__,
});
