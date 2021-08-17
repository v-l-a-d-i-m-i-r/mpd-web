import ActionDependencies from '../types/action-dependencies';
import Action from '../types/action';

class PlaylistInfoAction implements Action {
  mpdService: ActionDependencies['mpdService'];

  constructor({ mpdService }: ActionDependencies) {
    this.mpdService = mpdService;
  }

  execute(): Promise<any> {
    return this.mpdService.getPlaylistInfo();
  }
}

export default PlaylistInfoAction;
