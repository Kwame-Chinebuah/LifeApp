const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withAdiRegistration = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformRoot = config.modRequest.platformProjectRoot;

      // Source file in your project
      const sourceFile = path.join(projectRoot, 'assets', 'adi-registration.properties');

      // Destination inside Android native folder
      const destDir  = path.join(platformRoot, 'app', 'src', 'main', 'assets');
      const destFile = path.join(destDir, 'adi-registration.properties');

      // Create the assets directory if it doesn't exist
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Copy the file
      if (fs.existsSync(sourceFile)) {
        fs.copyFileSync(sourceFile, destFile);
        console.log('✓ adi-registration.properties copied to Android assets');
      } else {
        console.warn('⚠ adi-registration.properties not found in assets folder');
      }

      return config;
    },
  ]);
};

module.exports = withAdiRegistration;
