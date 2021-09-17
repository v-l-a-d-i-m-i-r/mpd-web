import { MPD_HOST, MPD_PORT } from '../config';

import MPDClient from '../clients/mpd.client';
import ACKError from '../errors/ack.error';
import ILogger from '../types/logger';

type ACKObject = {
  code: number;
  index: number;
  command: string;
  message: string;
};

type PlaylistItem = {
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

function mapPlainTextToObject(text: string): Record<string, string | number> {
  return text.split('\n')
    .reduce((object, row) => {
      const [key, value] = row.split(': ');
      const numberValue = Number(value);
      const parsedValue = Number.isNaN(numberValue) ? value : numberValue;

      return Object.assign(object, { [key]: parsedValue });
    }, {});
}

function mapOkBufferToObject(buffer: Buffer): Record<string, string | number> {
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

class MPDService {
  logger: ILogger;

  constructor({ logger }: { logger: ILogger }) {
    this.logger = logger;
  }

  // eslint-disable-next-line class-methods-use-this
  private async send(commandString: string): Promise<Buffer> {
    try {
      const client = new MPDClient({ host: MPD_HOST, port: MPD_PORT });
      await client.connect();
      const resultBuffer = await client.send(`${commandString}\n`);
      await client.close();

      return resultBuffer.slice(0, resultBuffer.indexOf('\nOK\n'));
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
    const command = url ? `listfiles ${url}` : 'listfiles';
    const resultBuffer = await this.send(command);

    const result = resultBuffer
      .toString()
      .replace(/\ndirectory'/g, '\n\ndirectory')
      .replace(/\nfile/g, '\n\nfile')
      .split('\n\n')
      .map(mapPlainTextToObject);

    return result;
  }

  async playlistinfo(args?: (string | number)[]): Promise<PlaylistItem[]> {
    const songpos = args && args[0];
    const command = songpos ? `playlistinfo ${songpos}` : 'playlistinfo';
    const resultBuffer = await this.send(command);

    const result = resultBuffer
      .toString()
      .replace(/\nfile/g, '\n\nfile')
      .split('\n\n')
      .map(mapPlainTextToObject);

    return result as PlaylistItem[];
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
}

export default MPDService;
