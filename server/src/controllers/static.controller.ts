import { IncomingMessage, ServerResponse } from 'http';
import ILogger from '../types/logger';

class StaticController {
  logger: ILogger;

  constructor({ logger }: { logger: ILogger }) {
    this.logger = logger;
  }

  execute(request: IncomingMessage, response: ServerResponse): void {
    // https://nodejs.org/en/knowledge/HTTP/servers/how-to-serve-static-files/
    // https://habr.com/ru/post/481898/
  }
}

export default StaticController;
