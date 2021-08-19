import Dependencies from '../types/dependencies';

const capitalize = (string: string): string => string[0].toUpperCase() + string.substring(1);

class Container {
  services: Map<string, Service>;

  constructor() {
    this.services = new Map();
  }

  registerService(name: string, service: Service): void {
    this.services.set(name, service);
  }

  getService(name: string): Service {
    const service = this.services.get(name);

    if (!service) {
      throw new Error(`Service ${name} not found.`);
    }

    return service;
  }
}

type Service = new (dependencies: Dependencies) => any;

class Injector {
  container: Container;

  constructor(container: Container) {
    this.container = container;
  }

  inject(): Dependencies {
    return new Proxy({}, {
      get: (target, prop, receiver) => {
        const Service = this.container.getService(capitalize(prop as string));

        return new Service(this.inject());
      },
    }) as Dependencies;
  }
}
