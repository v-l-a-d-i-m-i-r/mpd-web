type MatcherObject = {
  when: (...params: any[]) => boolean;
  then: (...params: any[]) => any;
};

class Matcher<T extends MatcherObject> {
  matches: T[];

  constructor(matches: T[]) {
    this.matches = matches;
  }

  match(...params: Parameters<T['when']>): T['then'] | undefined {
    const matchObject = this.matches.find((m) => m.when(...params));

    return matchObject && matchObject.then;
  }
}

export default Matcher;
