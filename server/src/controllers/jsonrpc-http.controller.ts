import { IncomingMessage, ServerResponse } from 'http';
import MPDService from '../services/mpd.service';
import { JSONRPCRequest } from '../types/jsonrpc';
import ActionDependencies from '../types/action-dependencies';
import { ILogger } from '../types/logger';
import MPDAction from '../actions/mpd.action';
import Matcher from '../utils/matcher';

const routes = [
  {
    when: (method: string) => (method === 'MPD.play'),
    then: (deps: ActionDependencies, params: JSONRPCRequest['params']) => new MPDAction(deps).play(params),
  },
  {
    when: (method: string) => (method === 'MPD.pause'),
    then: (deps: ActionDependencies) => new MPDAction(deps).pause(),
  },
  {
    when: (method: string) => (method === 'MPD.stop'),
    then: (deps: ActionDependencies) => new MPDAction(deps).stop(),
  },
  {
    when: (method: string) => (method === 'MPD.previous'),
    then: (deps: ActionDependencies) => new MPDAction(deps).previous(),
  },
  {
    when: (method: string) => (method === 'MPD.next'),
    then: (deps: ActionDependencies) => new MPDAction(deps).next(),
  },
  {
    when: (method: string) => (method === 'MPD.seekcur'),
    then: (deps: ActionDependencies, params: JSONRPCRequest['params']) => new MPDAction(deps).seekcur(params),
  },
  {
    when: (method: string) => (method === 'MPD.move'),
    then: (deps: ActionDependencies, params: JSONRPCRequest['params']) => new MPDAction(deps).move(params),
  },
  {
    when: (method: string) => (method === 'MPD.add'),
    then: (deps: ActionDependencies, params: JSONRPCRequest['params']) => new MPDAction(deps).add(params),
  },
  {
    when: (method: string) => (method === 'MPD.getFilesList'),
    then: (deps: ActionDependencies, params: JSONRPCRequest['params']) => new MPDAction(deps).getFilesList(params),
  },
  {
    when: (method: string) => (method === 'MPD.getExtendedStatus'),
    then: (deps: ActionDependencies) => new MPDAction(deps).getExtendedStatus(),
  },
  {
    when: (method: string) => (method === 'MPD.getPlaylistInfo'),
    then: (deps: ActionDependencies, params: JSONRPCRequest['params']) => new MPDAction(deps).getPlaylistInfo(params),
  },
];

const router = new Matcher(routes);
const validateRequest = (requestData: unknown): JSONRPCRequest => requestData as JSONRPCRequest;

class JSONRPCHTTPController {
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
      .then((body: unknown) => validateRequest(body))
      .then(async ({ jsonrpc, method, params, id }): Promise<void> => {
        const logger = this.logger.child({ context: { id, method } });
        logger.log('JSONRPCHTTPController.execute request', { params });

        try {
          const mpdService = new MPDService({ logger });
          const routeHandler = router.match(method);

          if (routeHandler) {
            const result = await routeHandler({ logger, mpdService }, params) || {};

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ id, jsonrpc, result }));

            logger.log('JSONRPCHTTPController.execute response', { result });

            return;
          }

          throw new Error('Method not found');
        } catch (error: Error | unknown) {
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            error,
          }));

          logger.error('JSONRPCHTTPController.execute response', { error });
        }
      })
      .catch((error: Error | unknown) => {
        this.logger.error('JSONRPCHTTPController.execute error', { error });

        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(error));
      });
  }
}

export default JSONRPCHTTPController;
