import path from 'path';

export const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3000', 10);
export const NODE_ENV = process.env.NODE_ENV || '';
export const MPD_HOST = process.env.MPD_HOST || '';
export const MPD_PORT = parseInt(process.env.MPD_PORT || '6600', 10);
export const PUBLIC_PATH = process.env.PUBLIC_PATH || path.join(__dirname, 'public');
