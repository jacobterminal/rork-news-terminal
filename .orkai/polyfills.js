// --- local polyfills to replace deprecated deep import ---
// Avoid using react-native/Libraries/Utilities/PolyfillFunctions (deprecated)

if (typeof global.setImmediate !== 'function') {
  global.setImmediate = (cb, ...args) =>
    setTimeout(cb, 0, ...args);
}
if (typeof global.clearImmediate !== 'function') {
  global.clearImmediate = (id) => clearTimeout(id);
}
// Nothing else from RN internals is required here.
// ------------------------------------------------------
