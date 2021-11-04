import { createServer, IncomingMessage, ServerResponse } from 'http';

import { HTTP_PORT, NODE_ENV } from './config';
import ILogger from './types/logger';
import Logger from './logger/logger';
import Matcher from './utils/matcher';

import JsonRpcHttpController from './controllers/jsonrpc-http.controller';
import StaticController from './controllers/static.controller';

const dev = NODE_ENV !== 'production';

const routes = [
  {
    when: (req: IncomingMessage) => (req.url === '/api/jsonrpc' && req.method === 'POST'),
    then: (req: IncomingMessage, res: ServerResponse, { logger }: { logger: ILogger }) => new JsonRpcHttpController({ logger }).execute(req, res),
  },
  {
    when: (req: IncomingMessage) => (req.method === 'GET'),
    then: (req: IncomingMessage, res: ServerResponse, { logger }: { logger: ILogger }) => new StaticController({ logger }).execute(req, res),
  },
];

const router = new Matcher(routes);

try {
  const server = createServer((req: IncomingMessage, res: ServerResponse): void => {
    const traceId = Date.now();
    const routeHandler = router.match(req);

    const logger = new Logger({ context: { traceId, url: req.url } });

    logger.log('HTTP incoming request');

    if (routeHandler) {
      routeHandler(req, res, { logger });

      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write('404 Not Found\n');
    res.end();
  });

  server.listen(HTTP_PORT, () => {
    // tslint:disable-next-line:no-console
    console.log(`> Server listening at http://localhost:${HTTP_PORT}`);
  });
} catch (error) {
  console.error(error);

  process.exit(1);
}
