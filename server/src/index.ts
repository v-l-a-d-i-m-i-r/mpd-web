import { createServer } from 'http';
import { parse } from 'url';

import { HTTP_PORT, NODE_ENV } from './config';
import HttpController from './controllers/http.controller';
import Logger from './logger/logger';

const dev = NODE_ENV !== 'production';

try {
  const server = createServer((req, res) => {
    const { pathname } = parse(req.url!, true);
    const traceId = Date.now();

    // req.on('error', (error) => {
    //   console.log('Request error: ', error);
    // });

    // res.on('error', (error) => {
    //   console.log('Response error: ', error);
    // });

    const logger = new Logger({ context: { traceId, url: pathname } });

    logger.log('HTTP incoming request');

    if (pathname === '/api') {
      new HttpController({ logger }).execute(req, res);
    }
  });

  server.listen(HTTP_PORT, () => {
    // tslint:disable-next-line:no-console
    console.log(`> Server listening at http://localhost:${HTTP_PORT}`);
  });
} catch (error) {
  console.error(error);

  process.exit(1);
}
