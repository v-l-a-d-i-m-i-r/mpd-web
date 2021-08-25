import { MPD_HOST, MPD_PORT } from '../config';

import MPDClient from '../clients/mpd.client';
import ACKError from '../errors/ack.error';

function mapPlainTextToObject(text: string): Record<string, string | number> {
  return text.split('\n')
    .reduce((object, row) => {
      const [key, value] = row.split(': ');
      const numberValue = Number(value);
      const parsedValue = Number.isNaN(numberValue) ? value : numberValue;

      return Object.assign(object, { [key]: parsedValue });
    }, {});
}
class MPDService {
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

      const {
        code,
        index,
        command,
        message,
      } = MPDClient.mapACKBufferToObject(error);

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

    return MPDClient.mapOkBufferToObject(resultBuffer);
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
