import React, { useEffect, useState } from 'react';

import RPCService from '../../services/rpc.service';

import Playback from '../playback/playback';
import Playlist from '../playlist/playlist';
import List from '../list/list';
import Menu from '../menu/menu';

const interval = 1000;

const initialStatus = {
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
};

const rpcService = new RPCService();

const errorHandler = (error: Error) => console.error(error);

const App: React.FC = () => {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    let isMounted = true;

    const getMPDStatus = (): Promise<void> => rpcService
      .call('MPD.getExtendedStatus')
      .then((newStatus) => isMounted && setStatus(newStatus))
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

  return (
    <>
      <Playback
        state={status.state}
        repeat={status.repeat}
        song={status.song}
        playlistlength={status.playlistlength}
        elapsed={status.elapsed}
        duration={status.duration}
      />
      <Playlist songid={status.songid} />
      <Menu />
    </>
  );
};

export default App;
