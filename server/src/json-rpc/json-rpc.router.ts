import { plainToInstance } from 'class-transformer';
import { Allow, Equals, IsNotEmpty, IsOptional, IsString, validateOrReject } from 'class-validator';
import { IncomingMessage, ServerResponse } from 'http';
import { Router } from '../router/router';
import { parseJSONBody, sendJSONResponse } from '../utils/http';
import Matcher, { MatcherObject } from '../utils/matcher';

type JSONRPCHandler = (jsonRpcRequest: JSONRPCBaseRequest)=> void | Promise<void>;

export class JSONRPCBaseRequest {
  @IsString()
  @Equals('2.0')
  public jsonrpc: '2.0';

  @IsString()
  @IsOptional()
  public id?: string;

  @IsString()
  @IsNotEmpty()
  public method: string;

  @Allow()
  @IsOptional()
  public params?: unknown;
}

export class JSONRPCRouter {
  private matcher: Matcher<MatcherObject> = new Matcher([]);

  public constructor(private readonly router: Router) {
    this.router.POST(/\/api\/jsonrpc\/*/, this.handle.bind(this));
  }

  public async addHandler(method: string, handler: JSONRPCHandler): Promise<void> {
    this.matcher.addMatch({
      when: (methodName: string) => (methodName === method),
      then: handler,
    });
  }

  private async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    let jsonRpcRequest;

    try {
      jsonRpcRequest = await parseJSONBody<JSONRPCBaseRequest>(req);
    } catch (error) {
      return sendJSONResponse(res, {
        body: {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: 'Parse error',
            data: error,
          },
        },
      });
    }

    try {
      const requestDto = plainToInstance(JSONRPCBaseRequest, jsonRpcRequest);
      await validateOrReject(requestDto, { whitelist: true });
    } catch (error) {
      return sendJSONResponse(res, {
        body: {
          jsonrpc: '2.0',
          id: typeof jsonRpcRequest.id === 'string' && jsonRpcRequest.id !== '' ? jsonRpcRequest.id : null,
          error: {
            code: -32600,
            message: 'Invalid Request',
            data: error,
          },
        },
      });
    }

    const handler = this.matcher.match(jsonRpcRequest.method);

    if (!handler) {
      return sendJSONResponse(res, {
        body: {
          jsonrpc: '2.0',
          id: jsonRpcRequest.id,
          error: {
            code: -32601,
            message: 'Method not found',
          },
        },
      });
    }

    try {
      const result = await handler(jsonRpcRequest);

      return await sendJSONResponse(res, {
        body: {
          jsonrpc: '2.0',
          id: jsonRpcRequest.id,
          result,
        },
      });
    } catch (error) {
      return sendJSONResponse(res, {
        body: {
          jsonrpc: '2.0',
          id: jsonRpcRequest.id,
          error: {
            code: 0,
            message: 'TODO',
            data: error,
          },
        },
      });
    }
  }
}
