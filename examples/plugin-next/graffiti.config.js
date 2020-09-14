const nextPlugin = require('graffiti-plugin-next');

module.exports = {
  mongoUrl: 'mongodb://localhost/graffiti-example',
  plugins: [nextPlugin()],
};
