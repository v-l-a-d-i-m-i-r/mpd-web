/* eslint-disable class-methods-use-this */
import { IncomingMessage, ServerResponse } from 'http';
import MPDService from '../services/mpd.service';
import { JSONRPCRequest, JSONRPCSuccessResponse } from '../types/jsonrpc';
import Action from '../types/action';
import ActionDependencies from '../types/action-dependencies';

import StatusAction from '../actions/status.action';
import StatsAction from '../actions/stats.action';
import ListFilesAction from '../actions/listfiles.action';
import PlaylistInfoAction from '../actions/playlistinfo.action';
import ListPlaylistsAction from '../actions/listplaylists.action';
import PlayAction from '../actions/play.action';
import PauseAction from '../actions/pause.action';

import MPDAction from '../actions/mpd.action';

const router: Record<string, new (deps: ActionDependencies) => any> = {
  // 'mpd:status': StatusAction,
  // 'mpd:stats': StatsAction,
  // 'mpd:listfiles': ListFilesAction,
  // 'mpd:playlistinfo': PlaylistInfoAction,
  // 'mpd:listplaylists': ListPlaylistsAction,
  // 'mpd:play': PlayAction,
  // 'mpd:pause': PauseAction,
  MPD: MPDAction,
};

// const mpdService = new MPDService();
const validateRequest = (requestData: any): JSONRPCRequest => requestData as JSONRPCRequest;

class HttpController {
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
        try {
          const [actionClassName, actionMethodName] = method.split('.');
          const ActionClass = router[actionClassName];

          if (!ActionClass) {
            throw Error(`Action ${actionClassName} not found`);
          }

          if (!(typeof ActionClass.prototype[actionMethodName] === 'function')) {
            throw Error(`Method ${actionClassName}.${actionMethodName} not found`);
          }

          const mpdService = new MPDService();

          const action = new ActionClass({ mpdService });
          const result = await action[actionMethodName](params);

          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ id, jsonrpc, result }));
        } catch (error) {
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            error,
          }));
        }
      })
      .catch((error) => {
        console.error(error);

        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(error));
      });
  }
}

export default HttpController;
