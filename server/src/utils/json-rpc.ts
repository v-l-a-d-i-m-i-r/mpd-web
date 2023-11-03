import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { IncomingMessage, ServerResponse } from 'http';
import { parseJSONBody } from './http';

export async function parseJSONRPCRequest<T extends object>(request: IncomingMessage, RequestDtoClass: { new(): T }): Promise<T> {
  const parsedBody = parseJSONBody<T>(request);
  const requestDto = plainToInstance(RequestDtoClass, parsedBody);
  await validateOrReject(requestDto, { whitelist: true });

  return instanceToPlain<T>(requestDto) as T;
}

type JSONRPCResponseData = {
  id: string;
  result: unknown;
};
export async function sendJSONRPCResponse(res: ServerResponse, data: JSONRPCResponseData): Promise<void> {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify({
    id: data.id,
    jsonrpc: '2.0',
    result: data.result,
  }));
  res.end();
}
