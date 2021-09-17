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

  async getExtendedStatus() {
    const status = await this.getStatus();
    const [{ type, path, title, name }] = await this.getPlaylistInfo({ args: [status.song as string] }) || [{}];

    return {
      ...status,
      songtype: type,
      songpath: path,
      songtitle: title,
      songname: name,
    };
  }

  getFiles() {
    return this.mpdService.listfiles();
  }

  getPlaylists() {
    return this.mpdService.listplaylists();
  }

  async getPlaylistInfo({ args }: ActionParams): Promise<Record<string, string | number>[]> {
    const playlistInfo = await this.mpdService.playlistinfo(args);

    return playlistInfo.map((playlistItem) => {
      // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
      const type = playlistItem.file.match(/^http/) ? 'stream' : 'file';
      const path = type === 'file' ? `/${playlistItem.file}` : playlistItem.file;

      return {
        type,
        path,
        ...Object.entries(playlistItem)
          .reduce((acc, [key, value]) => ({ ...acc, [key.replace('-', '').toLowerCase()]: value }), {}),
      };
    });
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

    return this.getPlaylistInfo({});
  }
}

export default MPDAction;
