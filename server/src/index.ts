import { createServer } from 'http';
import { parse } from 'url';

import { HTTP_PORT, NODE_ENV } from './config';
import HttpController from './controllers/http.controller';

const dev = NODE_ENV !== 'production';

try {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);

    console.log(`request url=${parsedUrl.pathname}`);

    // req.on('error', (error) => {
    //   console.log('Request error: ', error);
    // });

    // res.on('error', (error) => {
    //   console.log('Response error: ', error);
    // });

    if (parsedUrl.pathname === '/api') {
      new HttpController().execute(req, res);
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
