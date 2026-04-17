const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');
const { withUniwindConfig } = require('uniwind/metro');
const { resolve } = require('metro-resolver');

const config = getDefaultConfig(__dirname);

const aliasMap = {
  zustand: path.resolve(__dirname, 'node_modules/zustand/index.js'),
  'zustand/vanilla': path.resolve(__dirname, 'node_modules/zustand/vanilla.js'),
  'zustand/middleware': path.resolve(__dirname, 'node_modules/zustand/middleware.js'),
  'zustand/shallow': path.resolve(__dirname, 'node_modules/zustand/shallow.js'),
  'zustand/vanilla/shallow': path.resolve(__dirname, 'node_modules/zustand/vanilla/shallow.js'),
  'zustand/react/shallow': path.resolve(__dirname, 'node_modules/zustand/react/shallow.js'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const aliasedPath = aliasMap[moduleName];

  if (aliasedPath) {
    return {
      filePath: aliasedPath,
      type: 'sourceFile',
    };
  }

  return resolve(context, moduleName, platform);
};

module.exports = withUniwindConfig(wrapWithReanimatedMetroConfig(config), {
  cssEntryFile: './global.css',
  dtsFile: './src/uniwind-types.d.ts',
});
