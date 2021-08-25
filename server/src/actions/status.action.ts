import ActionDependencies from '../types/action-dependencies';
import Action from '../types/action';

class StatusAction implements Action {
  mpdService: ActionDependencies['mpdService'];

  constructor({ mpdService }: ActionDependencies) {
    this.mpdService = mpdService;
  }

  execute(): Promise<any> {
    return this.mpdService.getStatus();
    // return Promise.resolve({
    //   repeat: 0,
    //   random: 0,
    //   single: 0,
    //   consume: 0,
    //   playlist: 0,
    //   playlistlength: 0,
    //   mixrampdb: 0,
    //   state: 'stop',
    //   song: 0,
    //   songid: 0,
    //   time: '0:0',
    //   elapsed: 0,
    //   bitrate: 128,
    //   audio: '44100:24:2',
    //   nextsong: 0,
    //   nextsongid: 0,
    // })
  }
}

export default StatusAction;
