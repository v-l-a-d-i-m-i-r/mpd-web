import ActionDependencies from '../types/action-dependencies';

import { addLeadSlash } from '../utils/string';

type ActionParams = {
  args?: (string | number)[];
};

const mapObjectKeysToLowerCase = (object: Record<string, string | number>): Record<string, string | number> => Object
  .entries(object)
  .reduce((acc, [key, value]) => ({ ...acc, [key.replace('-', '').toLowerCase()]: value }), {});
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

  async getFilesList({ args }: ActionParams) {
    const basePath = args && args[0] as string;

    const fsObjects = await this.mpdService.lsinfo(basePath);

    const directories = fsObjects.filter((fsObject) => fsObject.directory).sort();
    const files = fsObjects.filter((fsObject) => fsObject.file).sort();

    return [...directories, ...files]
      .map((fsObject) => {
        const { file, directory, ...rest } = mapObjectKeysToLowerCase(fsObject);
        const type = file ? 'file' : 'directory';
        const path = file || directory;

        return {
          type,
          path,
          ...rest,
        };
      });
  }

  async getPlaylistInfo({ args }: ActionParams): Promise<Record<string, string | number>[]> {
    const playlistInfo = await this.mpdService.playlistinfo(args);

    return playlistInfo.map((playlistItem) => {
      // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
      const type = playlistItem.file.match(/^http/) ? 'stream' : 'file';
      const path = type === 'file' ? addLeadSlash(playlistItem.file) : playlistItem.file;

      return {
        type,
        path,
        ...mapObjectKeysToLowerCase(playlistItem),
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

  seekcur({ args }: ActionParams) {
    const time = args ? args[0] : 0;

    return this.mpdService.seekcur(time);
  }

  async move({ args }: ActionParams) {
    const [from, to] = args || [];

    await this.mpdService.move(from, to);

    return this.getPlaylistInfo({});
  }

  async add({ args }: ActionParams) {
    if (!(args && args.length && typeof args[0] === 'string')) throw new Error('Validation error');

    await this.mpdService.add(args[0]);
  }
}

export default MPDAction;
