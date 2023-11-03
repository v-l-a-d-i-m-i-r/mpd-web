import { IncomingMessage, ServerResponse } from 'http';
import { MatcherObject, Matcher } from '../utils/matcher';

type Handler = (req: IncomingMessage, res: ServerResponse)=> void | Promise<void>;

export class Router {
  private matcher: Matcher<MatcherObject> = new Matcher([]);

  public POST(url: string | RegExp, handler: Handler): void {
    this.matcher.addMatch({
      when: (req: IncomingMessage) => {
        if (req.method !== 'POST') {
          return false;
        }

        if (!req.url) {
          return false;
        }

        if (typeof url === 'string') {
          return req.url === url;
        }

        return url.test(req.url);
      },
      then: handler,
    });
  }

  public handle(req: IncomingMessage, res: ServerResponse): void {
    const handler = this.matcher.match(req);

    if (!handler) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write('404 Not Found\n');
      res.end();

      return;
    }

    Promise
      .resolve()
      .then(() => handler(req, res))
      .catch(() => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write('500 Internal Server Error\n');
        res.end();
      });
  }
}
