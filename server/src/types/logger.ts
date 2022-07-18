export type LogMessage = string;

export type LogData = Record<string | number, unknown>;

export type LoggerContext = Record<string | number, unknown>;

export interface ILogger {
  log: (message: LogMessage, data: LogData) => void;
  error: (message: LogMessage, data: LogData) => void;
  child: ({ context }: { context: LoggerContext }) => ILogger;
}

export default ILogger;
