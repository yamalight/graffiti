const authPlugin = require('graffiti-plugin-auth');

module.exports = {
  mongoUrl: 'mongodb://localhost/graffiti-example',
  plugins: [authPlugin({ secret: 'my_super_secret_jwt_secret' })],
};
