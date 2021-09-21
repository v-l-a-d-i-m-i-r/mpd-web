import React, { useState, useEffect } from 'react';

import RPCService from '../../services/rpc.service';
import { classNames, fancyTimeFormat } from '../../utils';

const rpcService = new RPCService();

const errorHandler = (error: Error) => console.error(error);

type FileExplorerProps = {
};

const FileExplorer: React.FC<FileExplorerProps> = () => {
  const [state, setState] = useState({ path: '/', items: [] });

  useEffect(() => {
    let isMounted = true;

    rpcService.call('MPD.getFilesList', [state.path])
      .then((items) => {
        if (isMounted) {
          setState((currentState) => ({ ...currentState, items }));
        }
      })
      .catch(errorHandler);

    return () => {
      isMounted = false;
    };
  }, [state.path]);

  return (
    <div className="file-explorer">
      <table>
        <thead>
          <tr>
            <th className="name">Name</th>
            <th className="time">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>. .</td>
          </tr>
          { state.items.map((item) => {
            const isFile = item.type === 'file';
            const title = isFile ? item.file : item.directory;
            const time = isFile ? fancyTimeFormat(item.duration) : '';
            const icon = isFile ? 'insert_drive_file' : 'folder';

            return (
              <tr>
                <td>
                  <span className="icon material-icons-outlined">{icon}</span>
                  { title }
                </td>
                <td>{ time }</td>
              </tr>
            );
          }) }
        </tbody>
      </table>
    </div>
  );
};

export default FileExplorer;
