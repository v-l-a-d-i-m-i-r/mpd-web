import ActionDependencies from '../types/action-dependencies';
import Action from '../types/action';

class PlayAction implements Action {
  mpdService: ActionDependencies['mpdService'];

  constructor({ mpdService }: ActionDependencies) {
    this.mpdService = mpdService;
  }

  execute(): Promise<any> {
    return this.mpdService.play();
  }
}

export default PlayAction;
