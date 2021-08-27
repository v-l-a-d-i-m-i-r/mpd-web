import { IncomingMessage, ServerResponse } from 'http';
import ILogger from '../types/logger';

type Route = {
  when: (req: IncomingMessage) => boolean;
  then: (
    req: IncomingMessage,
    res: ServerResponse,
    deps: { logger: ILogger },
  )=> void | Promise<void>;
};

class Router {
  routes: Route[];

  constructor({ routes }: { routes: Route[] }) {
    this.routes = routes;
  }

  matchRouteHandler(...args: Parameters<Route['when']>): Route['then'] | undefined {
    const route = this.routes.find((r) => r.when(...args));

    return route?.then;
  }
}

export default Router;
