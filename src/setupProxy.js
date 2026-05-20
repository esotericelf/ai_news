const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  const target = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000').replace(
    /\/$/,
    ''
  );
  const apiKey = (process.env.REACT_APP_API_KEY || '').trim();

  app.use(
    ['/api', '/health', '/robots.txt', '/sitemap.xml'],
    createProxyMiddleware({
      target,
      changeOrigin: true,
      onProxyReq(proxyReq) {
        if (apiKey) {
          proxyReq.setHeader('X-Api-Key', apiKey);
        }
        if (/ngrok/i.test(target)) {
          proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
        }
      },
    })
  );
};
