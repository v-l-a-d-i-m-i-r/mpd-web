import ActionDependencies from '../types/action-dependencies';
import Action from '../types/action';

class StatusAction implements Action {
  mpdService: ActionDependencies['mpdService'];

  constructor({ mpdService }: ActionDependencies) {
    this.mpdService = mpdService;
  }

  execute(): Promise<any> {
    return this.mpdService.getStatus();
  }
}

export default StatusAction;
