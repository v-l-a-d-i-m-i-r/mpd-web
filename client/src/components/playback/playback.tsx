import React, { useEffect, useState } from 'react';
import RPCService from '../../services/rpc.service';

// import './styles.scss';

const interval = 1000;

// last song status
// {
//   "repeat": 0,
//   "random": 0,
//   "single": 0,
//   "consume": 0,
//   "playlist": 2,
//   "playlistlength": 3,
//   "mixrampdb": 0,
//   "state": "pause",
//   "song": 2,
//   "songid": 3,
//   "time": "5:2806",
//   "elapsed": 4.988,
//   "bitrate": 0,
//   "duration": 2805.6,
//   "audio": "48000:24:2"
// }

// end of last song status
// {
//   "repeat": 0,
//   "random": 0,
//   "single": 0,
//   "consume": 0,
//   "playlist": 48,
//   "playlistlength": 4,
//   "mixrampdb": 0,
//   "state": "stop"
// }

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
};

const rpcService = new RPCService();

const errorHandler = (error: Error) => console.error(error);
function fancyTimeFormat(duration) {
  // Hours, minutes and seconds
  var hrs = ~~(duration / 3600);
  var mins = ~~((duration % 3600) / 60);
  var secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = "";

  if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}

const Playback: React.FC = () => {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    let isMounted = true;

    const getMPDStatus = (): Promise<void> => rpcService
      .call({ method: 'MPD.getStatus' })
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

  const isStopped = status.state === 'stop';
  const isPlaying = status.state === 'play';
  const isPaused = status.state === 'pause';
  const isPrevButtonDisabled = status.repeat ? false : status.song === 0;
  const isNextButtonDisabled = status.repeat ? false : status.song === status.playlistlength - 1;

  const statusTime = status.time || '0:0';
  const [elapsedTime, durationTime] = statusTime.split(':');

  const playButtonText = (status.state === 'pause' || status.state === 'stop') ? 'Play' : 'Pause';
  const onPlayButtonClick = () => {
    const promise = isPlaying ? rpcService.call({ method: 'MPD.pause' }) : rpcService.call({ method: 'MPD.play' });

    promise.catch(errorHandler);
  };

  const onPrevButtonClick = () => {
    rpcService.call({ method: 'MPD.previous' }).catch(errorHandler);
  };

  const onNextButtonClick = () => {
    rpcService.call({ method: 'MPD.next' }).catch(errorHandler);
  };

  const onSeekCurrent = (value: number) => {
    rpcService.call({ method: 'MPD.seekCurrent', args: [value] }).catch(errorHandler);
  };

  return (
    <section className="playback">
      <span>Elapsed {fancyTimeFormat(elapsedTime)}</span>
      <span>Duration {fancyTimeFormat(durationTime)}</span>

      <input
        style={{ display: 'block', width: '100%' }}
        type="range"
        min={0}
        max={durationTime}
        defaultValue={elapsedTime}
        onTouchEnd={(event: HTMLElementEvent<HTMLInputElement>) => onSeekCurrent(event.target.value)}
        onMouseUp={(event: HTMLElementEvent<HTMLInputElement>) => onSeekCurrent(event.target.value)}
      />

      <button
        disabled={isPrevButtonDisabled}
        type="button"
        className="prev-button"
        onClick={() => onPrevButtonClick()}
      >
        Prev
      </button>

      <button
        type="button"
        className="play-button"
        onClick={() => onPlayButtonClick()}
      >
        {playButtonText}
      </button>

      <button
        disabled={isNextButtonDisabled}
        type="button"
        className="next-button"
        onClick={() => onNextButtonClick()}
      >
        Next
      </button>
      <pre>{JSON.stringify(status, null, 2)}</pre>
    </section>
  );
};

export default Playback;
