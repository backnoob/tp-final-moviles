
const { expo } = require('./app.json');

module.exports = ({ config }) => ({
  ...config,
  ...expo,
  plugins: expo.plugins.map((plugin) => {
    if (
      plugin === 'react-native-maps' ||
      (Array.isArray(plugin) && plugin[0] === 'react-native-maps')
    ) {
      return [
        'react-native-maps',
        {
          androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      ];
    }

    return plugin;
  }),
});
