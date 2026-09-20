const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The bundled photo2cartoon ONNX model (assets/models/photo2cartoon.onnx) needs to be
// require()-able as a binary asset, same as Metro already treats .png/.jpg.
config.resolver.assetExts.push('onnx');

module.exports = config;
