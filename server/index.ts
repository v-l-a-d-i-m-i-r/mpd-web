import { join } from 'path';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
console.log(join(__dirname, 'client/pages'));
const app = next({
  dev,
  dir: join(__dirname, '../client'),
});
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer((req, res): Promise<any> => {
      const parsedUrl = parse(req.url!, true);
      return handle(req, res, parsedUrl);
    }).listen(port);

    // tslint:disable-next-line:no-console
    console.log(
      `> Server listening at http://localhost:${port} as ${
        dev ? 'development' : process.env.NODE_ENV
      }`,
    );
  })
  .catch((error) => {
    console.error(error);

    process.exit(1);
  });
