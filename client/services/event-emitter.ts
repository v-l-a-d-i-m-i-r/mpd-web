type EventHandler = (event?: any) => void;

class EventEmitter<T extends string> {
  private handlersMap: Partial<Record<T, EventHandler[]>>;

  constructor() {
    this.handlersMap = {};
  }

  emit(eventName: T, eventData?: any): void {
    const handlers = this.handlersMap[eventName];

    handlers?.forEach((handler: EventHandler) => handler(eventData));
  }

  on(eventName: T, eventHandler: EventHandler): void {
    const handlers = this.handlersMap[eventName];

    if (handlers) {
      handlers.push(eventHandler);

      return;
    }

    this.handlersMap[eventName] = [eventHandler];
  }
}

type EventName = 'PLAY' | 'PAUSE';

const eventEmitter = new EventEmitter<EventName>();

export default eventEmitter;
