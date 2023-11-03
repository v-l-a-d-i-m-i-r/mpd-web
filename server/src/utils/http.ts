import { IncomingMessage, ServerResponse } from 'http';
import { collect } from './stream';

export async function parseJSONBody<T>(request: IncomingMessage): Promise<T> {
  const bodyBuffer = await collect(request);
  const bodyString = bodyBuffer.toString('utf8');

  return JSON.parse(bodyString) as T;
}

type SendJSONResponseData = {
  code?: number;
  body?: unknown;
};
export async function sendJSONResponse(res: ServerResponse, data: SendJSONResponseData): Promise<void> {
  const code = data.code ?? 200;
  const body = data.body ?? {};

  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify(body, (_, value) => {
    if (value instanceof Error) {
      return (Object.getOwnPropertyNames(value) as (keyof Error)[]).reduce<Partial<Error>>(
        (obj, propName) => {
          console.log(propName);
          obj[propName] = value[propName];
          return obj;
        },
        { name: value.name },
      );
    }
    return value;
  }));
  res.end();
}

export async function sendJSONError(res: ServerResponse, error: any): Promise<void> {
  console.log({ name: error?.name, message: error?.message, stack: error?.stack });
  return sendJSONResponse(res, {
    code: 500,
    body: { name: error?.name, message: error?.message, stack: error?.stack },
  });
}
