import express from 'express';
import { extname, resolve } from 'node:path'
import { genAvatar } from './gen-avatar.js';
import errors, { HttpError } from 'http-errors';
import favicon from 'serve-favicon';
import etag from 'etag';
import 'dotenv';

const port = parseInt(process.env.PORT || '3022');
const hostname = process.env.HOST || '127.0.0.1';
const app = express();

app.use(favicon(resolve('public/favicon.ico')));
app.use(express.static(resolve('public'), { extensions: ['png', 'svg'] }));

app.get('/', (req, res) => {
  console.log(`[200] /`)

  res.writeHead(200, {
    'Content-Type': 'text/plain',
  })
  res.write('OK')
  res.end();
})

app.get('/healthz', (req, res, next) => {
  res.status(200)
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime()
  });
})

app.get('/:filename', (req, res, next) => {
  const ext = extname(req.params.filename).slice(1)
  if (ext !== 'svg') {
    return next(new errors.NotFound(`/${req.params.filename}`));
  }
  const avatar = genAvatar(req.params.filename)

  console.log(`[200] /${req.params.filename}`)

  res.removeHeader('connection')
  res.removeHeader('keep-alive')
  res.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Content-Length': avatar.length,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Vary': 'Accept-Encoding',
    'Etag': etag(req.params.filename)
  });

  res.write(avatar)
  res.end();
});

app.use((err: HttpError, req: express.Request, res: express.Response, next: express.NextFunction) => {

  console.log(`[${err.statusCode}] ${err.message}`)

  res.status(err.statusCode)
  res.end(err.message)
})

const server = app.listen(port, hostname, (error?: Error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Listening on port http://${hostname}:${port}`);
  }
});

function stopServer(signal: string) {
  console.log(`[${signal}] cleaning up connections...`);
  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    console.error('forcing shutdown due to stuck connections...');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', stopServer);
process.on('SIGINT', stopServer);
