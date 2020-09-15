exports.loadPlugins = async ({ projectConfig }) => {
  // get list of plugins or use empty array
  const plugins = projectConfig?.plugins ?? [];
  // allow plugins init (if needed)
  await Promise.all(plugins.map((plugin) => plugin.init?.()));
  // return plugins
  return plugins;
};
