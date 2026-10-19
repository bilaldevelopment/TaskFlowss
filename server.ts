import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './src/server/app.js';
import { config } from './src/server/config/index.js';

async function startServer() {
  const app = createExpressApp();
  const PORT = config.port || 3000;

  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(process.cwd(), 'dist');

  if (isProd && fs.existsSync(distDir)) {
    console.log('Serving production static build from dist directory');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    console.log('Initializing Vite in dev middleware mode');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ TaskFlow Server running at http://0.0.0.0:${PORT}`);
    console.log(`✓ REST API mounted at /api/v1`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
