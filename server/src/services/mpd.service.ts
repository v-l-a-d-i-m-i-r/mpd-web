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
  private client: MPDClient;

  constructor() {
    this.client = new MPDClient({ port: 6600 });
  }

  private async send(commandString: string): Promise<Buffer> {
    try {
      await this.client.connect();
      const resultBuffer = await this.client.send(`${commandString}\n`);
      await this.client.destroy();

      return resultBuffer.slice(0, resultBuffer.indexOf('OK\n'));
    } catch (errorBuffer) {
      const {
        code,
        index,
        command,
        message,
      } = MPDClient.mapACKBufferToObject(errorBuffer as Buffer);

      throw new ACKError(message, { code, index, command });
    }
  }

  async getStatus() {
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

  async listFiles(url?: string) {
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

  async getPlaylistInfo() {
    const command = 'playlistinfo';
    const resultBuffer = await this.send(command);

    const result = resultBuffer
      .toString()
      .replace(/\nfile/g, '\n\nfile')
      .split('\n\n')
      .map(mapPlainTextToObject);

    return result;
  }

  async listPlaylists() {
    const command = 'listplaylists';

    const resultBuffer = await this.send(command);

    return { not_implemented: true };
  }
}

export default MPDService;
