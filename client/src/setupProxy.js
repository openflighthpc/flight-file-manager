const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  if (process.env.REACT_APP_PROXY_API === "true") {
    // Proxy requests to the file manager.

    let rewriteFrom = process.env.REACT_APP_PROXY_API_PATH_REWRITE_FROM ||
      '^/dev/files/api';
    let rewriteTo = process.env.REACT_APP_PROXY_API_PATH_REWRITE_TO ||
      '/';

    app.use(
      process.env.REACT_APP_PROXY_API_PATH || '/dev/files/api/v0',
      createProxyMiddleware({
        target: process.env.REACT_APP_PROXY_API_URL || 'http://localhost:6309',
        changeOrigin: false,
        pathRewrite: {
          [rewriteFrom]: rewriteTo,
        },
        logLevel: 'debug',
      })
    );

    // Proxy requests to the cloudcmd backend.

    rewriteFrom = process.env.REACT_APP_PROXY_CLOUDCMD_API_PATH_REWRITE_FROM ||
      '^/dev/files/';
    rewriteTo = process.env.REACT_APP_PROXY_CLOUDCMD_API_PATH_REWRITE_TO ||
      '/';
    app.use(
      process.env.REACT_APP_PROXY_CLOUDCMD_API_PATH || '/dev/files/backend/:user',
      createProxyMiddleware({
        target: process.env.REACT_APP_PROXY_API_URL || 'http://localhost:6309',
        changeOrigin: false,
        pathRewrite: {
          [rewriteFrom]: rewriteTo,
        },
        logLevel: 'debug',
      })
    );
  }

  if (process.env.REACT_APP_PROXY_LOGIN_API === "true") {
    // Proxy requests to the login api.

    const rewriteFrom = process.env.REACT_APP_PROXY_LOGIN_API_PATH_REWRITE_FROM ||
      '^/dev/login/api';
    const rewriteTo = process.env.REACT_APP_PROXY_LOGIN_API_PATH_REWRITE_TO ||
      '/';

    app.use(
      process.env.REACT_APP_PROXY_LOGIN_API_PATH || '/login/api/v0',
      createProxyMiddleware({
        target: process.env.REACT_APP_PROXY_LOGIN_API_URL || 'http://localhost:6311',
        changeOrigin: false,
        pathRewrite: {
          [rewriteFrom]: rewriteTo,
        },
        logLevel: 'debug',
      })
    );
  }
};
