import ActionDependencies from '../types/action-dependencies';
import Action from '../types/action';

class StatsAction implements Action {
  mpdService: ActionDependencies['mpdService'];

  constructor({ mpdService }: ActionDependencies) {
    this.mpdService = mpdService;
  }

  execute(): Promise<any> {
    return this.mpdService.getStats();
  }
}

export default StatsAction;
