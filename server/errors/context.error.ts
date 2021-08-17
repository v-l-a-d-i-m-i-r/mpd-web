class ContextError extends Error {
  details: Record<string, any>;

  constructor(message: string, details: Record<string, any> = {}) {
    super(message);

    this.message = message;
    this.details = details;
  }
}

export default ContextError;
