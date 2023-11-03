import { JSONRPCRouter } from '../json-rpc';
import Logger from '../logger/logger';
import { Router } from '../router/router';
import { MPDController } from './mpd.controller';
import { MPDService } from './mpd.service';

export class MPDModule {
  public static new(router: Router, jsonRpcRouter: JSONRPCRouter, logger: Logger): void {
    const mpdService = new MPDService(logger);
    new MPDController(router, jsonRpcRouter, mpdService);
  }
}
