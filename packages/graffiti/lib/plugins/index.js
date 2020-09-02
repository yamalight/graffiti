const { getConfig } = require('../config');

exports.loadPlugins = async () => {
  // get current project config
  const config = getConfig();
  // get list of plugins or use empty array
  const plugins = config?.plugins ?? [];
  // allow plugins init (if needed)
  await Promise.all(plugins.map((plugin) => plugin.init?.()));
  // return plugins
  return plugins;
};
