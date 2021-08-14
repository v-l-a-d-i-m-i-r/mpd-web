import React from 'react';

import eventEmitter from '../services/event-emitter';

import Playback from '../components/playback';

eventEmitter.on('PLAY', () => console.log('On PLAY'));
eventEmitter.on('PAUSE', () => console.log('On PAUSE'));

type Status = {
  state: 'play' | 'stop' | 'pause';
};

type State = {
  status: Status;
};

const App: React.FC = function App() {
  return (
    <div>
      <Playback state="pause" />
    </div>
  );
};

export default App;
