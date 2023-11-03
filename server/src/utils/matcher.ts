export type MatcherObject = {
  when: (...params: any[]) => boolean;
  then: (...params: any[]) => any;
};

export class Matcher<T extends MatcherObject> {
  private matches: T[];

  public constructor(matches: T[]) {
    this.matches = matches;
  }

  public addMatch(match: T): void {
    this.matches.push(match);
  }

  public match(...params: Parameters<T['when']>): T['then'] | undefined {
    const matchObject = this.matches.find((m) => m.when(...params));

    return matchObject && matchObject.then;
  }
}

export default Matcher;
