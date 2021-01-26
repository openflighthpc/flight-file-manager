const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy requests to the supervisor.
  app.use(
    '/files/api/v0',
    createProxyMiddleware({
      target: 'http://localhost:6309',
      changeOrigin: false,
      pathRewrite: {
        '^/files/api/': '/', // Remove base path.
      },
      logLevel: 'debug',
    })
  );

  // Proxy requests to the cloudcmd backend.
  app.use(
    '/files/backend/:user',
    createProxyMiddleware({
      target: 'http://localhost:6309',
      changeOrigin: false,
      pathRewrite: {
        '^/files/': '/',
      },
      logLevel: 'debug',
    })
  );
};
