const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
globalThis.importMetaEnv = {
  VITE_DEV_URI: `${import.meta.env.VITE_DEV_URI}`,
};

Object.defineProperty(global, "import", {
  value: {
    meta: {
      env: global.importMetaEnv,
    },
  },
});
