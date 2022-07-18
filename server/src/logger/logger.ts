import { ILogger, LoggerContext, LogData } from '../types/logger';

class Logger implements ILogger {
  context: LoggerContext;

  constructor({ context }: { context: LoggerContext }) {
    this.context = context;
  }

  log(message: string, data?: LogData): void {
    console.log(JSON.stringify({
      level: 'log',
      timestamp: Date.now(),
      context: this.context,
      message,
      data,
    }), '\n');
  }

  error(message: string, data?: LogData): void {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: Date.now(),
      context: this.context,
      message,
      data,
    }));
  }

  child({ context }: { context: LoggerContext }): Logger {
    return new Logger({
      context: { ...this.context, ...context },
    });
  }
}

export default Logger;
