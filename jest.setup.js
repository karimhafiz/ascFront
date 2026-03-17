const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill Web Fetch APIs for React Router v7 (requires Request/Response/Headers)
if (!global.Request) {
  global.Request = class Request {
    constructor(url, init = {}) {
      this.url = typeof url === "string" ? url : url.url;
      this.method = (init.method || "GET").toUpperCase();
      this.headers = new (global.Headers || Map)(Object.entries(init.headers || {}));
      this.body = init.body || null;
      this.signal = init.signal || null;
    }
  };
}
if (!global.Response) {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || "";
      this.headers = new (global.Headers || Map)(Object.entries(init.headers || {}));
      this.ok = this.status >= 200 && this.status < 300;
    }
    async text() {
      return typeof this.body === "string" ? this.body : "";
    }
    async json() {
      return JSON.parse(await this.text());
    }
  };
}
if (!global.Headers) {
  global.Headers = class Headers extends Map {
    constructor(init) {
      super();
      if (init) {
        const entries = Array.isArray(init) ? init : Object.entries(init);
        for (const [k, v] of entries) this.set(k.toLowerCase(), v);
      }
    }
    get(name) {
      return super.get(name.toLowerCase()) || null;
    }
    set(name, value) {
      return super.set(name.toLowerCase(), value);
    }
    has(name) {
      return super.has(name.toLowerCase());
    }
  };
}

// Mock import.meta.env for Jest (Vite's import.meta is not available in Jest)
globalThis.importMetaEnv = {
  VITE_DEV_URI: process.env.VITE_DEV_URI || "http://localhost:5000",
  VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || "test-client-id",
};

Object.defineProperty(global, "import", {
  value: {
    meta: {
      env: globalThis.importMetaEnv,
    },
  },
});
