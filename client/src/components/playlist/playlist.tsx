import React, { useState, useEffect } from 'react';
import RPCService from '../../services/rpc.service';

const rpcService = new RPCService();

const errorHandler = (error: Error) => console.error(error);

const initialState = [];

const Playlist: React.FC = ({ songid }) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let isMounted = true;

    rpcService
      .call({ method: 'MPD.getPlaylistInfo' })
      .then((newState) => (isMounted && setState(newState)))
      .catch(errorHandler);

    return () => {
      isMounted = false;
    };
  }, [songid]);

  return (
    <pre>{JSON.stringify(state, null, 2)}</pre>
  );
};

export default Playlist;
