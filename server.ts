import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import apicache from 'apicache';
import { SitemapStream } from 'sitemap';
// import { createGzip } from 'zlib';

// const { SitemapStream } = require('sitemap')
let cache = apicache.middleware
// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  server.get('/sitemap.xml', cache('1 hour'), (req, res) => {
    res.header('Content-Type', 'application/xml');

    try {
      const smStream = new SitemapStream({ hostname: 'https://magrolabs.com' });

      (async () => {
        const routes = [
          { url: '/', changefreq: 'daily', priority: 1 },
          { url: '/registro', changefreq: 'weekly', priority: 0.9 },
        ];

        for (const route of routes) {
          smStream.write(route);
        }

        smStream.end();

        smStream.pipe(res).on('error', (e: any) => {
          throw e;
        });
      })();
    } catch (e) {
      console.error(e);
      res.status(500).end();
    }
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
