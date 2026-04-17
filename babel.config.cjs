module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: [
    // Transform import.meta.env → globalThis.importMetaEnv for Jest compatibility
    function importMetaPlugin() {
      return {
        visitor: {
          MetaProperty(path) {
            // import.meta.env.X → globalThis.importMetaEnv.X
            // import.meta → { env: globalThis.importMetaEnv }
            const { parent } = path;
            if (
              parent.type === "MemberExpression" &&
              parent.property.name === "env"
            ) {
              path.parentPath.replaceWithSourceString("globalThis.importMetaEnv");
            }
          },
        },
      };
    },
  ],
};
