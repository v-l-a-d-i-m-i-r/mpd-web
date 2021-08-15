import ActionDependencies from 'server/types/action-dependencies';

class CommandAction {
  mpdClient: ActionDependencies['mpdClient'];

  constructor({ mpdClient }: ActionDependencies) {
    this.mpdClient = mpdClient;
  }

  async execute(command: string, _args?: string[]) {
    await this.mpdClient.connect();
    const data = await this.mpdClient.send(`${command}\n`);
    await this.mpdClient.destroy();

    // const [data, data2] = await Promise.all([
    //   this.mpdClient.send(`${command}\n`),
    //   // this.mpdClient.send(`stats\n`),
    // ]);
    // const data = await this.mpdClient.send(`${command}\n`);
    // const data2 = await this.mpdClient.send(`stats\n`);

    // console.log(data2.toString());

    return data;
  }
}

export default CommandAction;
