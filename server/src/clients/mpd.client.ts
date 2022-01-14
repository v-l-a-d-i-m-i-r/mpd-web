import { Socket, NetConnectOpts } from 'net';

class MPDClient {
  private socket: Socket | null;

  private options: NetConnectOpts;

  constructor(options: NetConnectOpts) {
    this.socket = null;
    this.options = options;

    // this.socket.on('end', () => console.log('END'));
    // this.socket.on('close', () => console.log('CLOSE'));
  }

  connect(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.socket = new Socket();
      let buffer = Buffer.from('');
      this.socket.connect(this.options);

      // this.socket.once('connect', () => {

      // });

      this.socket.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);

        if (buffer.indexOf('OK') !== -1 && buffer.indexOf('\n')) {
          resolve(buffer);
        }

        resolve(buffer);
      });
      this.socket.once('error', reject);
    });
  }

  send(data: string): Promise<Buffer> {
    const { socket } = this;

    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not initialized'));

        return;
      }

      let buffer = Buffer.from('');

      function onErrorHandler(error: Error) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        socket?.off('data', onDataHandler);

        reject(error);
      }

      function onDataHandler(chunk: Buffer) {
        buffer = Buffer.concat([buffer, chunk]);

        if (buffer.indexOf('OK\n') !== -1) {
          socket?.off('data', onDataHandler);
          socket?.off('error', onErrorHandler);

          resolve(buffer);
        }

        if (buffer.indexOf('ACK') !== -1 && buffer.indexOf('\n')) {
          socket?.off('data', onDataHandler);
          socket?.off('error', onErrorHandler);

          reject(buffer);
        }
      }

      socket.on('data', onDataHandler);
      socket.once('error', onErrorHandler);

      socket.write(data);
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));

        return;
      }

      this.socket.end();
      this.socket.once('close', () => {
        this.socket?.removeAllListeners();
        this.socket = null;

        resolve();
      });
    });
  }
}

export default MPDClient;
