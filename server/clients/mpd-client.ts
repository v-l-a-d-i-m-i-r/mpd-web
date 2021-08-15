import { Socket, NetConnectOpts } from 'net';

const customParsers = {

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

  send(data: string): Promise<Record<string, any>> {
    let buffer = Buffer.from('');

    return new Promise((resolve, reject) => {
      this.socket.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);

        if (buffer.indexOf('OK') !== -1) {
          resolve(MPDClient.mapOkBufferToObject(buffer));
        }

        if (buffer.indexOf('ACK') !== -1 && buffer.indexOf('\n')) {
          resolve(buffer);
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

  // if (buffer.indexOf('OK') !== -1) {
  //   resolve(MPDClient.parseOK(buffer));
  // }

  // if (buffer.indexOf('ACK') !== -1) {
  //   resolve(MPDClient.parseACK(buffer));
  // }

  // close() {
  //   return new Promise(res)
  // }

  // static parseOK(buffer) {
  //   return buffer.toString();
  // }

  // static parseACK(buffer) {
  //   return buffer.toString();
  // }
}

// (async () => {
//   try {
//     const client = new MPDClient();
//     await client.connect({ port: 6600 });

//     const command = [
//       'stop'
//     ]

//     const dataBuffer = await client.send(`${command.join('\n')}\n`);
//     console.log(dataBuffer.toString());

//     // setInterval(async () => {
//     //   try {
//     //     const dataBuffer = await client.send('status\n');
//     //     console.log('dataBuffer', dataBuffer.toString());
//     //   } catch (error) {
//     //     console.log(error);
//     //   }
//     // }, 1000)

//   } catch (error) {
//     console.error(error);
//     process.exit(1);
//   }
// })()

// const net = require('net');
// const client = net.createConnection({ port: 6600 }, (a, b) => {
//   console.log(a, b);

//   // 'connect' listener.
//   console.log('connected to server!');

//   setInterval(() => {
//     client.write('status\n');
//     client.write('currentsong\n')
//   }, 1000);

//   // client.write('playlist\n');
// });
// client.on('error', (e, d) => {
//   console.log(e, d);
// });

// client.on('data', (data) => {
//   console.log(data.toString());

//   // client.end();
// });
// client.on('end', () => {
//   console.log('disconnected from server');
// });

export default MPDClient;
