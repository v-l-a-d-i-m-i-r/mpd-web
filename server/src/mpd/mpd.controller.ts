import { IncomingMessage, ServerResponse } from 'http';
import { JSONRPCBaseRequest, JSONRPCRouter } from '../json-rpc';
import { Router } from '../router/router';
import { parseJSONBody, sendJSONError, sendJSONResponse } from '../utils/http';
import { validate } from '../utils/validator';
import { GetExtendedStatusRequestParams } from './dto/get-extended-status.dto';
import { GetPlaylistInfoRequestParams } from './dto/get-playlist-info.dto';
import { MPDService } from './mpd.service';

export class MPDController {
  public constructor(
    router: Router,
    jsonRpcRouter: JSONRPCRouter,
    private readonly mpdService: MPDService,
  ) {
    router.POST('/api/mpd/play', this.play.bind(this));

    jsonRpcRouter.addHandler('getExtendedStatus', this.getExtendedStatus.bind(this));
    jsonRpcRouter.addHandler('getPlaylistInfo', this.getPlaylistInfo.bind(this));
  }

  private async play(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const body = await parseJSONBody(req);

      await this.mpdService.play();
      await sendJSONResponse(res, { body });
    } catch (error) {
      await sendJSONError(res, error);
    }
  }

  private async getExtendedStatus(req: JSONRPCBaseRequest): Promise<any> {
    // const params = await validate(req.params, GetExtendedStatusRequestParams);
    const result = await this.mpdService.getExtendedStatus();

    return result;
  }

  private async getPlaylistInfo(req: JSONRPCBaseRequest): Promise<any> {
    const params = await validate(req.params, GetPlaylistInfoRequestParams);
    return this.mpdService.getPlaylistInfo(params.songpos);
  }
}
