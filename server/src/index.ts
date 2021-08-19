import { createServer } from 'http';
import { parse } from 'url';

import { HTTP_PORT, NODE_ENV } from './config';
import HttpController from './controllers/http.controller';

const dev = NODE_ENV !== 'production';

try {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);

    if (parsedUrl.pathname === '/api') {
      new HttpController().execute(req, res);

      return;
    }
  });

  server.listen({ port: HTTP_PORT }, () => {
    // tslint:disable-next-line:no-console
    console.log(
      `> Server listening at http://localhost:${HTTP_PORT} as ${
        dev ? 'development' : process.env.NODE_ENV
      }`,
    );
  });
} catch (error) {
  console.error(error);

  process.exit(1);
}
