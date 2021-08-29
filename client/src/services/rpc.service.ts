import { generateId } from '../utils';

type RPCCallResponse = Record<string, string | number> | Record<string, string | number>[];

class RPCService {
  // eslint-disable-next-line class-methods-use-this
  async call(method: string, args?: (string | number)[], opts?: Record<string, string | number>): Promise<RPCCallResponse> {
    const requestPayload = {
      id: generateId(),
      jsonrpc: '2.0',
      method,
      params: {
        args: args || [],
        opts: opts || {},
      },
    };

    // Default options are marked with *
    const response = await fetch('/api/jsonrpc', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *client
      body: JSON.stringify(requestPayload), // body data type must match "Content-Type" header
    });

    const parsedResponse = await response.json();
    console.log(parsedResponse);

    if (parsedResponse.result) return parsedResponse.result as RPCCallResponse;

    throw parsedResponse.error;
  }
}

export default RPCService;
