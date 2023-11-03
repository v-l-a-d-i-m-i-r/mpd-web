export class JSONRPCBaseRequest {
  public jsonrpc: '2.0';

  public id: string;

  public method: string;
}
