import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { GridReadyEvent, FirstDataRenderedEvent, RowDoubleClickedEvent, GridSizeChangedEvent, RowClassParams } from 'ag-grid-community';

import RPCService from '../../services/rpc.service';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-fresh.min.css';

const rpcService = new RPCService();

const errorHandler = (error: Error) => console.error(error);

const Playlist: React.FC = ({ songid }) => {
  const columnDefs = [
    { field: 'path', rowDrag: true },
  ];
  const defaultColDef = {};
  const initialState = [];

  const [state, setState] = useState(initialState);

  useEffect(() => {
    let isMounted = true;

    rpcService.call('MPD.getPlaylistInfo')
      .then((rows) => {
        const newState = rows.map((row) => (row.id === songid ? { ...row, active: true } : row));

        isMounted && setState(newState)
      })
      .catch(errorHandler);

    return () => {
      isMounted = false;
    };
  }, [songid]);

  const getRowStyle = ({ data }: RowClassParams) => {
    // https://www.ag-grid.com/react-data-grid/row-styles/
    if (data.active) {
      return { background: 'lightblue' };
    }
  };

  const onGridReady = ({ api }: GridReadyEvent) => api.sizeColumnsToFit();
  const onFirstDataRendered = ({ api }: FirstDataRenderedEvent) => api.sizeColumnsToFit();
  const onGridSizeChanged = ({ api }: GridSizeChangedEvent) => api.sizeColumnsToFit();

  const onRowDoubleClicked = ({ data }: RowDoubleClickedEvent): void => {
    rpcService.call('MPD.play', [data.pos]).catch(errorHandler);
  };

  return (
    // <pre>{JSON.stringify(state, null, 2)}</pre>
    <AgGridReact
      className="ag-theme-fresh"
      domLayout="autoHeight"
      getRowStyle={getRowStyle}
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      rowDragManaged={true}
      animateRows={true}
      onGridReady={onGridReady}
      onFirstDataRendered={onFirstDataRendered}
      onGridSizeChanged={onGridSizeChanged}
      rowData={state}
      onRowDoubleClicked={onRowDoubleClicked}
    />
  );
};

export default Playlist;
