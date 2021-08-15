type Id = string;

export type JSONRPCRequest = {
  id: Id;
  jsonrpc: '2.0';
  method: string;
  params: Record<string, any>
};

export type JSONRPCSuccessResponse = {
  id: Id;
  jsonrpc: '2.0',
  result: any,
};
