import React from 'react';

import RPCService from '../../services/rpc.service';
import { fancyTimeFormat } from '../../utils';

import './playback.scss';

const rpcService = new RPCService();

const errorHandler = (error: Error) => console.error(error);
const play = () => { rpcService.call('MPD.play').catch(errorHandler); };
const pause = () => { rpcService.call('MPD.pause').catch(errorHandler); };
const stop = () => { rpcService.call('MPD.stop').catch(errorHandler); };
const previous = () => { rpcService.call('MPD.previous').catch(errorHandler); };
const next = () => { rpcService.call('MPD.next').catch(errorHandler); };
const seekCurrent = (value: string) => { rpcService.call('MPD.seekcur', [value]).catch(errorHandler); };

type PlaybackProps = {
  state: string;
  repeat: number;
  song: number;
  playlistlength: number;
  elapsed: number;
  duration: number;
  songtitle: string;
};

const Playback: React.FC<PlaybackProps> = ({ state, repeat, song, playlistlength, elapsed, duration = 0, songtitle }) => {
  const isStopped = state === 'stop';
  const isPlaying = state === 'play';
  const isPaused = state === 'pause';
  const isPrevButtonDisabled = repeat ? false : song === 0;
  const isNextButtonDisabled = repeat ? false : song === playlistlength - 1;

  const onPlayButtonClick = () => {
    if (isPlaying && duration) {
      pause();

      return;
    }

    if (isPlaying && !duration) {
      stop();

      return;
    }

    play();
  };

  return (
    <div className="playback">
      <div className="title-bar">
        <span className="elapsed">{fancyTimeFormat(elapsed)}</span>
        <span className="title">{songtitle}</span>
        <span className="duration">{fancyTimeFormat(duration)}</span>
      </div>

      <input
        disabled={!duration}
        style={{ display: 'block', width: '100%' }}
        type="range"
        min={0}
        max={duration}
        defaultValue={elapsed}
        onTouchEnd={(event: React.TouchEvent<HTMLButtonElement>) => seekCurrent((event.target as HTMLButtonElement).value)}
        onMouseUp={(event: React.MouseEvent<HTMLButtonElement>) => seekCurrent((event.target as HTMLButtonElement).value)}
      />

      <div className="button-bar">
        <button
          type="button"
          className="repeat-button"
        >
          <span className="icon material-icons">repeat</span>
        </button>

        <button
          disabled={isPrevButtonDisabled}
          type="button"
          className="prev-button"
          onClick={previous}
        >
          <span className="icon material-icons">skip_previous</span>
        </button>

        <button
          type="button"
          className="play-button"
          onClick={onPlayButtonClick}
        >
          <span className="icon material-icons">{isPaused || isStopped ? 'play_arrow' : 'pause'}</span>
        </button>

        <button
          disabled={isNextButtonDisabled}
          type="button"
          className="next-button"
          onClick={next}
        >
          <span className="icon material-icons">skip_next</span>
        </button>

        <button
          type="button"
          className="repeat-button"
        >
          <span className="icon material-icons">shuffle</span>
        </button>
      </div>
    </div>
  );
};

export default Playback;
