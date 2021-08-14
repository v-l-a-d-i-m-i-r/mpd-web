import React from 'react';
import eventEmitter from '../services/event-emitter';

type PlaybackProps = {
  state: 'play' | 'stop' | 'pause';
};

const Playback: React.FC<PlaybackProps> = function Playback({ state }) {
  const isStopped = state === 'stop';
  const isPaused = state === 'pause' || isStopped;
  const playButtonEvent = isPaused ? 'PLAY' : 'PAUSE';
  const playButtonText = isPaused ? 'Play' : 'Pause';

  return (
    <div>
      <button type="button" onClick={() => eventEmitter.emit(playButtonEvent)}>{playButtonText}</button>
    </div>
  );
};

export default Playback;
