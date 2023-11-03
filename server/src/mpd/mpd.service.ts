import { MPD_HOST, MPD_PORT } from '../config';

import MPDClient from '../clients/mpd.client';
import ACKError from '../errors/ack.error';
import Logger from '../logger/logger';
import { addLeadSlash } from '../utils/string';

type CommonObject = Record<string, string | number>;

type ACKObject = {
  code: number;
  index: number;
  command: string;
  message: string;
};

type FileObject = {
  file: string;
  Title: string;
  Pos: number;
  Id: number;
  Name?: string;
  'Last-Modified'?: string;
  Artist?: string;
  Album?: string;
  Genre?: string;
  Time?: number;
  duration?: number;
};

type FSObject = {
  file?: string;
  directory?: string;
  Title?: string;
  Pos?: number;
  Id?: number;
  Name?: string;
  'Last-Modified'?: string;
  Artist?: string;
  Album?: string;
  Genre?: string;
  Time?: number;
  duration?: number;
};

type DirectoryObject = {
  directory: string;
  'Last-Modified': string;
};

type NormalizedPlaylistItem = {
  type: string;
  path: string;
  title: string;
  pos: number;
  id: number;
  name?: string;
  lastmodified?: string;
  artist?: string;
  album?: string;
  genre?: string;
  time?: number;
  duration?: number;
};

function mapPlainTextToObject(text: string): CommonObject {
  const separator = ': ';
  const separatorLength = separator.length;

  return text.split('\n')
    .filter(Boolean) // omit empty lines
    .reduce((object, row) => {
      const separatorIndex = row.indexOf(separator);
      const key = row.slice(0, separatorIndex);
      const value = row.slice(separatorIndex + separatorLength);
      const numberValue = Number(value);
      const parsedValue = Number.isNaN(numberValue) ? value : numberValue;

      return Object.assign(object, { [key]: parsedValue });
    }, {});
}

function mapOkBufferToObject(buffer: Buffer): CommonObject {
  // const buffer = buff.slice(0, buff.indexOf('\nOK\n'));
  const separator = '\n';
  const bufferLength = buffer.length;
  const separatorBytesLength = Buffer.from(separator).length;
  const object = {};
  let offset = 0;

  let index = buffer.indexOf(separator);

  while (index !== -1) {
    const isLastRow = (index + separatorBytesLength) === bufferLength;
    const row = buffer.slice(offset, index);

    if (!isLastRow) {
      const [key, value] = row.toString().split(': ');
      const numberValue = Number(value);
      const parsedValue = Number.isNaN(numberValue) ? value : numberValue;

      Object.assign(object, { [key]: parsedValue });
    }

    offset = offset + row.length + separatorBytesLength;
    index = buffer.indexOf(separator, offset);
  }

  return object;
}

function mapACKBufferToObject(buffer: Buffer): ACKObject {
  const errorString = buffer.toString();
  const [_, code, index, command, message] = /^ACK\s\[(\d+)@(\d+)\]\s{(\w*)}\s(.+)\n$/.exec(errorString) || [];

  return {
    code: parseInt(code, 10),
    index: parseInt(index, 10),
    command,
    message,
  };
}

const mapObjectKeysToLowerCase = (object: Record<string, string | number>): Record<string, string | number> => Object
  .entries(object)
  .reduce((acc, [key, value]) => ({ ...acc, [key.replace('-', '').toLowerCase()]: value }), {});

export class MPDService {
  constructor(
    private readonly logger: Logger,
  ) {}

  // eslint-disable-next-line class-methods-use-this
  private async send(commandString: string): Promise<Buffer> {
    try {
      const client = new MPDClient({ host: MPD_HOST, port: MPD_PORT });
      await client.connect();
      const resultBuffer = await client.send(`${commandString}\n`);
      await client.close();

      // console.log('==================')
      // console.log(resultBuffer.toString())
      // console.log('==================')

      // if (resultBuffer.indexOf('\nOK\n') === -1) {
      //   return resultBuffer.slice(0, resultBuffer.indexOf('OK\n'));
      // }

      // return resultBuffer.slice(0, resultBuffer.indexOf('\nOK\n'));
      return resultBuffer.slice(0, resultBuffer.indexOf('OK\n'));
    } catch (error) {
      if (!(error instanceof Buffer)) {
        throw error;
      }

      const { code, index, command, message } = mapACKBufferToObject(error);

      throw new ACKError(message, { code, index, command });
    }
  }

  async status() {
    const command = 'status';
    const resultBuffer = await this.send(command);

    return mapPlainTextToObject(
      resultBuffer
        .toString(),
    );
  }

  async getStats() {
    const command = 'stats';
    const resultBuffer = await this.send(command);

    return mapOkBufferToObject(resultBuffer);
  }

  async listfiles(url?: string) {
    const command = url ? `listfiles "${url}"` : 'listfiles';
    const resultBuffer = await this.send(command);

    const result = resultBuffer
      .toString()
      .replace(/\ndirectory/g, '\n\ndirectory')
      .replace(/\nfile/g, '\n\nfile')
      .split('\n\n')
      .map(mapPlainTextToObject);

    return result;
  }

  async lsinfo(url?: string): Promise<FSObject[]> {
    const command = url ? `lsinfo "${url}"` : 'lsinfo';
    const resultBuffer = await this.send(command);

    const result = resultBuffer
      .toString()
      .replace(/\ndirectory/g, '\n\ndirectory')
      .replace(/\nplaylist/g, '\n\nplaylist')
      .replace(/\nfile/g, '\n\nfile')
      .split('\n\n')
      .map(mapPlainTextToObject);

    return result as FSObject[];
  }

  async playlistinfo(songpos?: number): Promise<FileObject[]> {
    const command = songpos ? `playlistinfo ${songpos}` : 'playlistinfo';
    const resultBuffer = await this.send(command);
    const resultString = resultBuffer.toString();

    if (!resultString) {
      return [];
    }

    const result = resultString
      .replace(/\nfile/g, '\n\nfile')
      .split('\n\n')
      .map(mapPlainTextToObject);

    if (result.find((item) => !item.id)) {
      // may return not all the list
    }

    return result as FileObject[];
  }

  async listplaylists() {
    const command = 'listplaylists';

    const resultBuffer = await this.send(command);

    return { not_implemented: true };
  }

  async play(songpos?: string | number) {
    const command = songpos !== undefined ? `play ${songpos}` : 'play';

    await this.send(command);
  }

  async pause() {
    await this.send('pause');
  }

  async next() {
    await this.send('next');

    return {};
  }

  async previous() {
    await this.send('previous');
  }

  async stop() {
    await this.send('stop');
  }

  async seekcur(time: string | number) {
    await this.send(`seekcur ${time}`);
  }

  async move(from: string | number, to: string | number) {
    await this.send(`move ${from} ${to}`);

    return {};
  }

  async add(uri: string) {
    await this.send(`add "${uri}"`);
  }

  async getExtendedStatus() {
    const status = await this.status();
    // TODO: remove 'as'
    const playlistInfo = await this.getPlaylistInfo(status.song as number);
    console.log('2', playlistInfo)

    if (!playlistInfo.length) {
      return status;
    }

    return {
      ...status,
      songtype: playlistInfo[0].type,
      songpath: playlistInfo[0].path,
      songtitle: playlistInfo[0].title,
      songname: playlistInfo[0].name,
    };
  }

  async getPlaylistInfo(songpos?: number): Promise<Record<string, string | number>[]> {
    const playlistInfo = await this.playlistinfo(songpos);
    console.log('1', playlistInfo)

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
}
type ActionParams = {
  args?: (string | number)[];
};
