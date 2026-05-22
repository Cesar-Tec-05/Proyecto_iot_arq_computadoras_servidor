import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { Readable } from 'node:stream';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
const backendUrl = process.env['BACKEND_URL'] ?? 'http://backend:3000';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', async (req, res, next) => {
  try {
    const targetUrl = `${backendUrl}${req.originalUrl.replace(/^\/api/, '')}`;
    const headers: Record<string, string> = {};

    for (const [key, value] of Object.entries(req.headers)) {
      if (value === undefined || key.toLowerCase() === 'host') {
        continue;
      }

      headers[key] = Array.isArray(value) ? value.join(',') : value;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      headers['content-type'] = headers['content-type'] ?? 'application/json';
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body ?? {}),
    });

    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (!['connection', 'content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const contentType = response.headers.get('content-type') ?? '';

    // Si la respuesta es un stream SSE, pasarla directamente al cliente sin bufferizar
    if (contentType.includes('text/event-stream') && response.body) {
      response.headers.forEach((value, key) => {
        if (!['connection', 'content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });

      res.status(response.status);
      const nodeStream = Readable.fromWeb(response.body as any);
      nodeStream.pipe(res);
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
