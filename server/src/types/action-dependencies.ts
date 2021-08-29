import MPDService from '../services/mpd.service';
import ILogger from './logger';

type ActionDependencies = {
  mpdService: MPDService;
  logger: ILogger;
};

export default ActionDependencies;
