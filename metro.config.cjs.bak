// PulseSense — Metro bundler configuration
// Required for expo-sqlite web support (wa-sqlite .wasm asset)

const { getDefaultConfig } = require('@expo/metro/metro-config');

const config = getDefaultConfig(__dirname);

// Treat .wasm as an asset so Metro serves it as a static file URL
// (expo-sqlite's web worker imports wa-sqlite.wasm and passes the URL to Emscripten's locateFile)
config.resolver.assetExts.push('wasm');

module.exports = config;
