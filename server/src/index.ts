import { createServer } from 'http';
import { parse } from 'url';
// import next from 'next';
import HttpController from './controllers/http.controller';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';

// const app = next({
//   dev,
//   dir: join(__dirname, 'client'),
// });
// const handle = app.getRequestHandler();

(async () => {
  // await app.prepare();

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);

    if (parsedUrl.pathname === '/api') {
      new HttpController().execute(req, res);

      return;
    }

    // handle(req, res, parsedUrl)
    //   .catch((error) => console.error(error));
  });

  server.listen({ port }, () => {
    // tslint:disable-next-line:no-console
    console.log(
      `> Server listening at http://localhost:${port} as ${
        dev ? 'development' : process.env.NODE_ENV
      }`,
    );
  });
})()
  .catch((error) => {
    console.error(error);

    process.exit(1);
  });
