const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
globalThis.importMetaEnv = {
  VITE_DEV_URI: "http://localhost:5000/api/",
};

Object.defineProperty(global, "import", {
  value: {
    meta: {
      env: global.importMetaEnv,
    },
  },
});
