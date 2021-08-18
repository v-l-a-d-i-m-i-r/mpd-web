import { Socket, NetConnectOpts } from 'net';

type ACKObject = {
  code: number;
  index: number;
  command: string;
  message: string;
};

class MPDClient {
  private socket: Socket;

  private options: NetConnectOpts;

  constructor(options: NetConnectOpts) {
    this.socket = new Socket();
    this.options = options;

    this.socket.on('end', () => console.log('END'));
    // this.socket.on('close', () => console.log('CLOSE'));
  }

  connect(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.socket.connect(this.options);

      this.socket.once('connect', () => {
        this.socket.once('data', (chunk) => {
          resolve(chunk.toString());
        });
      });
      this.socket.once('error', reject);
    });
  }

  send(data: string): Promise<Buffer> {
    let buffer = Buffer.from('');

    return new Promise((resolve, reject) => {
      this.socket.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);

        if (buffer.indexOf('OK') !== -1) {
          resolve(buffer);
        }

        if (buffer.indexOf('ACK') !== -1 && buffer.indexOf('\n')) {
          reject(buffer);
        }
      });
      this.socket.once('error', reject);

      this.socket.write(data);
    });
  }

  destroy(): Promise<void> {
    return new Promise((resolve) => {
      this.socket.once('close', resolve);

      this.socket.destroy();
    });
  }

  static mapOkBufferToObject(buffer: Buffer): Record<string, string | number> {
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
      console.log(row.toString());

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

  static mapACKBufferToObject(buffer: Buffer): ACKObject {
    const errorString = buffer.toString();
    const [fullString, code, index, command, message] = /^ACK\s\[(\d+)@(\d+)\]\s{(\w*)}\s(.+)\n$/.exec(errorString) || [];

    return {
      code: parseInt(code, 10),
      index: parseInt(index, 10),
      command,
      message,
    };
  }
}

export default MPDClient;
