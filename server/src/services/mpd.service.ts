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
  const [fullString, code, index, command, message] = /^ACK\s\[(\d+)@(\d+)\]\s{(\w*)}\s(.+)\n$/.exec(errorString) || [];

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
    this.logger.log('MPDService.status');

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

  async playlistinfo() {
    const command = 'playlistinfo';
    const resultBuffer = await this.send(command);

    const result = resultBuffer
      .toString()
      .replace(/\nfile/g, '\n\nfile')
      .split('\n\n')
      .map(mapPlainTextToObject);

    return result;
  }

  async listplaylists() {
    const command = 'listplaylists';

    const resultBuffer = await this.send(command);

    return { not_implemented: true };
  }

  async play() {
    const command = 'play';
    await this.send(command);

    return {};
  }

  async pause() {
    const command = 'pause';
    await this.send(command);

    return {};
  }

  async next() {
    const command = 'next';
    await this.send(command);

    return {};
  }

  async previous() {
    const command = 'previous';
    await this.send(command);

    return {};
  }

  async stop() {
    const command = 'stop';
    await this.send(command);

    return {};
  }

  async seekcur(position: number) {
    const command = `seekcur ${position}`;

    await this.send(command);

    return {};
  }
}

export default MPDService;
