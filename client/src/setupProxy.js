const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.get(
    '/files/api/ping',
    (req, res) => {
      res.send('OK');
    },
  );

  app.post(
    '/files/api/start',
    (req, res) => {
      res.send(JSON.stringify({
        url: `http://localhost:3000/files/api`,
      }));
    },
  );

  app.use(
    '/files/api/files',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: false,
    })
  );
};
