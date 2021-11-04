import path from 'path';
import fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import ILogger from '../types/logger';

class StaticController {
  logger: ILogger;

  constructor({ logger }: { logger: ILogger }) {
    this.logger = logger;
  }

  // eslint-disable-next-line class-methods-use-this
  execute(request: IncomingMessage, response: ServerResponse): void {
    // https://nodejs.org/en/knowledge/HTTP/servers/how-to-serve-static-files/
    // https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework
    // https://habr.com/ru/post/481898/

    const { url } = request;
    const publicFolderAbsolutePath = path.join(__dirname, '..', 'public');
    const relativeFilePath = url === '/' ? 'index.html' : url as string;
    const absoluteFilePath = path.join(publicFolderAbsolutePath, relativeFilePath);

    const extname = String(path.extname(absoluteFilePath)).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'application/font-woff',
      '.ttf': 'application/font-ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'application/font-otf',
      '.wasm': 'application/wasm',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    response.on('pipe', () => {
      response.writeHead(200, { 'Content-Type': contentType });
    });

    fs.createReadStream(absoluteFilePath)
      .on('error', (error: Error & { code: string }) => {
        error.code === 'ENOENT'
          ? response.writeHead(404).end()
          : response.writeHead(500).end()
      })
      .pipe(response, { end: true });
  }
}

export default StaticController;
