const fs = require('fs');
const { join } = require('path');

const defaultConfig = {
  mongoUrl: 'mongodb://localhost/graffiti',
  port: 3000,
  host: '0.0.0.0',
};

exports.getConfig = () => {
  // get current work folder
  const workFolder = process.cwd();
  // construct path to config file
  const configFilePath = join(workFolder, 'graffiti.config.js');
  // if config doesn't exist - return default config
  if (!fs.existsSync(configFilePath)) {
    return defaultConfig;
  }
  // otherwise - require and return config
  const config = require(configFilePath);
  return config;
};
