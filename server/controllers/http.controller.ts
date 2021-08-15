/* eslint-disable class-methods-use-this */
import { IncomingMessage, ServerResponse } from 'http';
import CommandAction from '../actions/command.action';
import MPDClient from '../clients/mpd-client';
import { JSONRPCRequest, JSONRPCSuccessResponse } from '../types/jsonrpc';

const mpdClient = new MPDClient({ port: 6600 });

const validateRequest = (requestData: any): JSONRPCRequest => {
  return requestData as JSONRPCRequest;
}

class HttpController {
  execute(request: IncomingMessage, response: ServerResponse): void {
    Promise.resolve()
      .then(() => new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        request.on('data', (chunk: Buffer) => chunks.push(chunk));
        request.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString()) as unknown as JSONRPCRequest));
        request.on('error', reject);
      }))
      .then(async (body: any): Promise<JSONRPCSuccessResponse> => {
        const { jsonrpc, method, params, id } = validateRequest(body);
        const action = new CommandAction({ mpdClient });
        const result = await action.execute(params.command, params.args);

        return {
          id,
          jsonrpc,
          result,
        };
      })
      .then((data) => {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(data));
      })
      .catch((error) => {
        console.error(error);

        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ ok: false }));
      });
  }
}

export default HttpController;
