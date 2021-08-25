import ILogger from '../types/logger';

/* eslint-disable class-methods-use-this */
class Logger implements ILogger {
  context: Record<string | number, any>;

  constructor({ context }: { context?: Record<string | number, any> }) {
    this.context = context || {};
  }

  log(message: string, data?: any) {
    console.log(JSON.stringify({
      level: 'log',
      timestamp: Date.now(),
      context: this.context,
      message,
      data,
    }));
  }

  error(message: string, data?: any) {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: Date.now(),
      context: this.context,
      message,
      data,
    }));
  }

  child({ context }: { context?: Record<string | number, any> }): Logger {
    return new Logger({
      context: { ...this.context, ...(context || {}) },
    });
  }
}

export default Logger;
