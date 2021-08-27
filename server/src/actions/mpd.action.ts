import MPDService from '../services/mpd.service';

type MPDActionDependencies = {
  mpdService: MPDService;
};

class MPDAction {
  mpdService: MPDService;

  constructor({ mpdService }: MPDActionDependencies) {
    this.mpdService = mpdService;
  }

  getStatus() {
    return this.mpdService.status();
  }

  getExtendedStatus() {
    return this.mpdService.getExtendedStatus();
  }

  getFiles() {
    return this.mpdService.listfiles();
  }

  getPlaylists() {
    return this.mpdService.listplaylists();
  }

  getPlaylistInfo() {
    return this.mpdService.getPlaylistInfo();
  }

  pause() {
    return this.mpdService.pause();
  }

  play() {
    return this.mpdService.play();
  }

  stop() {
    return this.mpdService.stop();
  }

  previous() {
    return this.mpdService.previous();
  }

  next() {
    return this.mpdService.next();
  }

  seekCurrent({ args }: { args: number[] }) {
    return this.mpdService.seekcur(args[0]);
  }
}

export default MPDAction;
