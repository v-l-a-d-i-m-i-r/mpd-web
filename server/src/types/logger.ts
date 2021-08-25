interface Logger {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  child: (...args: any[]) => Logger
}

export default Logger;
