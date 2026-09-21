const { getDefaultConfig } = require("expo/metro-config");

// Metro (SDK 50+) reads the "paths" alias (e.g. "@/*") straight from tsconfig.json,
// so no extra resolver config is needed here beyond the default.
const config = getDefaultConfig(__dirname);

module.exports = config;
