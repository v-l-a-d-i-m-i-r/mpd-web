import React, { useEffect, useState } from 'react';

import RPCService from '../../services/rpc.service';

import Playback from '../playback/playback';
import Playlist from '../playlist/playlist';
import Menu from '../menu/menu';
import FileExplorer from '../file-explorer/file-explorer';

const interval = 1000;

const initialState = {
  activeTabName: 'playlist',
  playback: {
    repeat: 0,
    random: 0,
    single: 0,
    consume: 0,
    playlist: 0,
    playlistlength: 0,
    mixrampdb: 0,
    state: 'stop',
    song: 0,
    songid: 0,
    time: '0:0',
    elapsed: 0,
    bitrate: 128,
    audio: '44100:24:2',
    nextsong: 0,
    nextsongid: 0,
    duration: 0,
    songtitle: '',
  },
};

type ExtendedStatus = {
  repeat: number,
  random: number,
  single: number,
  consume: number,
  playlist: number,
  playlistlength: number,
  mixrampdb: number,
  state: string,
  song: number,
  songid: number,
  time: string,
  elapsed: number,
  bitrate: number,
  audio: string,
  nextsong: number,
  nextsongid: number,
  duration: number,
  songtitle: string,
};

const rpcService = new RPCService();

const errorHandler = (error: Error) => console.error(error);

const App: React.FC = () => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let isMounted = true;

    const getMPDStatus = (): Promise<void> => rpcService
      .call('MPD.getExtendedStatus')
      .then((playback: ExtendedStatus) => {
        if (isMounted) {
          setState((currentState) => ({ ...currentState, playback }));
        }
      })
      .catch(errorHandler)
      .then(() => {
        if (isMounted) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          setTimeout(() => { getMPDStatus(); }, interval);
        }
      });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getMPDStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const setActiveTab = (activeTabName: string) => setState((currentState) => ({ ...currentState, activeTabName }));

  return (
    <>
      <section className="playback-section">
        <div className="wrapper">
          <Playback
            state={state.playback.state}
            repeat={state.playback.repeat}
            song={state.playback.song}
            playlistlength={state.playback.playlistlength}
            elapsed={state.playback.elapsed}
            duration={state.playback.duration}
            songtitle={state.playback.songtitle}
          />
        </div>
      </section>
      <section className="content-section">
        <div className="wrapper">
          { state.activeTabName === 'playlist' ? <Playlist songid={state.playback.songid} /> : '' }
          { state.activeTabName === 'file-explorer' ? <FileExplorer /> : '' }
        </div>
      </section>
      <section className="tabs-section">
        <div className="wrapper">
          <Menu activeTabName={state.activeTabName} onTabClick={setActiveTab} />
        </div>
      </section>
    </>
  );
};

export default App;
