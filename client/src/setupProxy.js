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

  // Proxy some requests that cloudcmd makes itself.  Notably for the CSS.
  // Perhaps others too.
  app.use(
    '/files/backend',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: false,
      logLevel: 'debug',
    })
  );

  // Proxy requests to the cloudcmd backend.
  app.use(
    '/files/:port/backend',
    createProxyMiddleware({
      target: 'http://localhost:9000',
      changeOrigin: false,
      pathRewrite: {
        '^/files/[0-9]*/backend': '/files/backend',
      },
      logLevel: 'debug',
      router: function(req) {
        return {
          port: req.params.port,
        };
      },
    })
  );
};
