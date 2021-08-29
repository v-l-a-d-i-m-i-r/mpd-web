type Id = string;

export type JSONRPCRequest = {
  id: Id;
  jsonrpc: '2.0';
  method: string;
  params: {
    args: (string | number)[];
    opts: Record<string, string | number>;
  }
};

export type JSONRPCSuccessResponse = {
  id: Id;
  jsonrpc: '2.0',
  result: Record<string, any> | Record<string, any>[],
};
