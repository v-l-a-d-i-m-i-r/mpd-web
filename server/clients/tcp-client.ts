import { Socket, NetConnectOpts } from 'net';

class MPDClient {
  private socket: Socket;

  constructor() {
    this.socket = new Socket();
  }

  connect(options: NetConnectOpts): Promise<void> {
    if (this.socket) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.socket.connect(options);

      this.socket.once('connect', () => {
        this.socket.once('data', () => resolve());
      });
      this.socket.once('error', reject);
    });
  }

  send(data: string): Promise<Buffer> {
    let buffer = Buffer.from('');

    return new Promise((resolve, reject) => {
      this.socket.write(data);
      this.socket.once('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);

        if (buffer.indexOf('OK') !== -1) {
          resolve(buffer);
        }

        if (buffer.indexOf('ACK') !== -1 && buffer.indexOf('\n')) {
          resolve(buffer);
        }
      });
      this.socket.once('error', reject);
    });
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
