import React from 'react';

import RPCService from '../../services/rpc.service';
import { fancyTimeFormat } from '../../utils';

import './playback.scss';

const rpcService = new RPCService();

const errorHandler = (error: Error) => console.error(error);

const Playback: React.FC = ({ state, repeat, song, playlistlength, elapsed, duration, songtitle }) => {
  const isStream = !duration;
  const isStopped = state === 'stop';
  const isPlaying = state === 'play';
  const isPaused = state === 'pause';
  const isPrevButtonDisabled = repeat ? false : song === 0;
  const isNextButtonDisabled = repeat ? false : song === playlistlength - 1;

  const onPlayButtonClick = () => rpcService.call(isPlaying ? 'MPD.pause' : 'MPD.play').catch(errorHandler);
  const onPrevButtonClick = () => rpcService.call('MPD.previous').catch(errorHandler);
  const onNextButtonClick = () => rpcService.call('MPD.next').catch(errorHandler);

  const onSeekCurrent = (value: number) => {
    rpcService.call('MPD.seekCurrent', [value]).catch(errorHandler);
  };

  return (
    <div className="playback">
      <div className="title-bar">
        <span className="elapsed">{fancyTimeFormat(elapsed)}</span>
        <span className="title">{songtitle}</span>
        <span className="duration">{fancyTimeFormat(duration)}</span>
      </div>

      <input
        disabled={isStream}
        style={{ display: 'block', width: '100%' }}
        type="range"
        min={0}
        max={isStream ? 0 : duration}
        defaultValue={elapsed}
        onTouchEnd={(event: React.TouchEvent<HTMLButtonElement>) => onSeekCurrent(event.target.value)}
        onMouseUp={(event: React.MouseEvent<HTMLButtonElement>) => onSeekCurrent(event.target.value)}
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
          onClick={() => onPrevButtonClick()}
        >
          <span className="icon material-icons">skip_previous</span>
        </button>

        <button
          type="button"
          className="play-button"
          onClick={() => onPlayButtonClick()}
        >
          <span className="icon material-icons">{isPaused || isStopped ? 'play_arrow' : 'pause'}</span>
          {/* <i className={`fa ${isPaused || isStopped ? 'fa-play' : 'fa-pause'}`} /> */}
        </button>

        <button
          disabled={isNextButtonDisabled}
          type="button"
          className="next-button"
          onClick={() => onNextButtonClick()}
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
