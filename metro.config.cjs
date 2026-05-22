// PulseSense — Metro bundler configuration
// Required for expo-sqlite web support (wa-sqlite .wasm asset)

const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Treat .wasm as an asset for expo-sqlite web support
  config.resolver.assetExts.push('wasm');

  return config;
})();
