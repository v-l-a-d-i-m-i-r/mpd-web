import React, { useState, useEffect } from 'react';

import RPCService from '../../services/rpc.service';
import { fancyTimeFormat } from '../../utils';

import './file-explorer.scss';

const rpcService = new RPCService();

const errorHandler = (error: Error) => console.error(error);
// const getFilesList = (path: string) => rpcService.call('MPD.getFilesList', [path]).catch(errorHandler);
const getRelativePath = (fullPath: string): string => fullPath.split('/').slice(-1)[0];
const getPreviousPath = (fullPath: string): string => fullPath.split('/').slice(0, -1).join('/');

type FileExplorerProps = {
};

type FSObject = {
  type: string,
  file: string,
  directory: string,
  duration: number,
};

const FileExplorer: React.FC<FileExplorerProps> = () => {
  const [state, setState] = useState({ path: '', items: [] });

  useEffect(() => {
    let isMounted = true;

    rpcService.call('MPD.getFilesList', ['/'])
      .then((items: FSObject[]) => {
        if (isMounted) {
          setState((currentState) => ({ ...currentState, items }));
        }
      })
      .catch(errorHandler);

    return () => {
      isMounted = false;
    };
  }, []);

  const onFolderClick = (path: string) => {
    // console.log('path', path);

    rpcService.call('MPD.getFilesList', [path])
      .then((items: FSObject[]) => {
        setState((currentState) => ({ ...currentState, path, items }));
      })
      .catch(errorHandler);
  };

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
          <tr onClick={() => onFolderClick(getPreviousPath(state.path))}>
            <td>. .</td>
          </tr>
          { state.items.map((item: FSObject) => {
            const isFile = item.type === 'file';
            const path = isFile ? item.file : item.directory;
            const title = getRelativePath(path);
            const time = isFile ? fancyTimeFormat(item.duration) : '';
            const icon = isFile ? 'insert_drive_file' : 'folder';

            return (
              <tr key={path} onClick={() => !isFile && onFolderClick(`${state.path}/${title}`)}>
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
