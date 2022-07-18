type Factory<I> = (dependencies: I) => I[keyof I];
type Service<I> = I[keyof I];

export default class DI<I> {
  private factories: Map<string, Factory<I>>;

  private services: Map<string, Service<I>>;

  private dependencies: I;

  constructor() {
    this.factories = new Map();
    this.services = new Map();
    this.dependencies = new Proxy({}, {
      get: (_, prop: string & keyof I) => {
        if (!this.services.has(prop)) {
          const factory = this.factories.get(prop);

          if (!factory) {
            throw new Error(`${prop} factory not registered`);
          }

          this.services.set(prop, factory(this.dependencies));
        }

        return this.services.get(prop);
      },
    }) as I;
  }

  addDependency(name: string, facory: Factory<I>): void {
    this.factories.set(name, facory);
  }

  getDependencies(): I {
    return this.dependencies;
  }
}
