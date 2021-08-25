/* eslint-disable class-methods-use-this */
import { IncomingMessage, ServerResponse } from 'http';
import MPDService from '../services/mpd.service';
import { JSONRPCRequest } from '../types/jsonrpc';
import ActionDependencies from '../types/action-dependencies';
import ILogger from '../types/logger';

import MPDAction from '../actions/mpd.action';

const router: Record<string, new (deps: ActionDependencies) => any> = {
  MPD: MPDAction,
};

// const mpdService = new MPDService();
const validateRequest = (requestData: any): JSONRPCRequest => requestData as JSONRPCRequest;

class HttpController {
  logger: ILogger;

  constructor({ logger }: { logger: ILogger }) {
    this.logger = logger;
  }

  execute(request: IncomingMessage, response: ServerResponse): void {
    Promise.resolve()
      .then(() => new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        request.on('data', (chunk: Buffer) => chunks.push(chunk));
        request.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString()) as unknown as JSONRPCRequest));
        request.on('error', reject);
      }))
      .then((body: any) => validateRequest(body))
      .then(async ({ jsonrpc, method, params, id }): Promise<void> => {
        const logger = this.logger.child({ context: { id, method } });
        logger.log('HttpController.execute request', { params });

        try {
          const [actionClassName, actionMethodName] = method.split('.');
          const ActionClass = router[actionClassName];

          if (!ActionClass) {
            throw Error(`Action ${actionClassName} not found`);
          }

          if (!(typeof ActionClass.prototype[actionMethodName] === 'function')) {
            throw Error(`Method ${actionClassName}.${actionMethodName} not found`);
          }

          const mpdService = new MPDService({ logger });

          const action = new ActionClass({ mpdService });
          const result = await action[actionMethodName](params);

          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ id, jsonrpc, result }));

          logger.log('HttpController.execute response', { result });
        } catch (error) {
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            error,
          }));

          logger.error('HttpController.execute response', { error });
        }
      })
      .catch((error) => {
        this.logger.error(error);

        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(error));
      });
  }
}

export default HttpController;
