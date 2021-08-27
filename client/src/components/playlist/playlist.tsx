import React, { useState, useEffect } from 'react';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';

import RPCService from '../../services/rpc.service';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const rpcService = new RPCService();

const errorHandler = (error: Error) => console.error(error);

const columnDefs = [
  { field: 'path', rowDrag: true },
];
const defaultColDef = {};

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

  const onGridReady = ({ api }) => {
    window.addEventListener('resize', () => api.sizeColumnsToFit());
    api.sizeColumnsToFit();
  }

  const onFirstDataRendered = ({ api }) => api.sizeColumnsToFit();
  const onGridSizeChanged = ({ api }) => api.sizeColumnsToFit();

  return (
    // <pre>{JSON.stringify(state, null, 2)}</pre>
    <AgGridReact
      className="ag-theme-alpine"
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      rowDragManaged={true}
      animateRows={true}
      onGridReady={onGridReady}
      onFirstDataRendered={onFirstDataRendered}
      onGridSizeChanged={onGridSizeChanged}
      rowData={state}
    />
  );
};

export default Playlist;
