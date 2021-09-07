import ActionDependencies from '../types/action-dependencies';

type ActionParams = {
  args?: (string | number)[];
};

class MPDAction {
  mpdService: ActionDependencies['mpdService'];

  logger: ActionDependencies['logger'];

  constructor({ mpdService, logger }: ActionDependencies) {
    this.mpdService = mpdService;
    this.logger = logger;
  }

  getStatus() {
    return this.mpdService.status();
  }

  getExtendedStatus() {
    return this.mpdService.getExtendedStatus();
  }

  getFiles() {
    return this.mpdService.listfiles();
  }

  getPlaylists() {
    return this.mpdService.listplaylists();
  }

  getPlaylistInfo() {
    return this.mpdService.getPlaylistInfo();
  }

  pause() {
    return this.mpdService.pause();
  }

  play({ args }: ActionParams) {
    const songpos = args && args[0];

    return this.mpdService.play(songpos);
  }

  stop() {
    return this.mpdService.stop();
  }

  previous() {
    return this.mpdService.previous();
  }

  next() {
    return this.mpdService.next();
  }

  seekCurrent({ args }: ActionParams) {
    const time = args ? args[0] : 0;

    return this.mpdService.seekcur(time);
  }

  async reorder({ args }: ActionParams) {
    const [from, to] = args || [];

    await this.mpdService.move(from, to);

    return this.getPlaylistInfo();
  }
}

export default MPDAction;
