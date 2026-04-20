module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // ForkTsCheckerWebpackPlugin (bundled in react-scripts 5) crashes on
      // Node.js 22 because its nested ajv-keywords v3 is incompatible with
      // the ajv v8 override required by webpack-dev-server.
      // This project is plain JavaScript (no .ts/.tsx files), so TypeScript
      // type-checking is unnecessary.
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (p) => p.constructor.name !== 'ForkTsCheckerWebpackPlugin'
      );
      return webpackConfig;
    },
  },
};
