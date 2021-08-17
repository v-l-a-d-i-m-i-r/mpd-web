interface Action {
  execute: (...args: any) => any | Promise<any>
}

export default Action;
