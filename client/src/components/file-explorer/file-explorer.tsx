import React, { useState, useEffect } from 'react';

import RPCService from '../../services/rpc.service';
import { fancyTimeFormat, classNames } from '../../utils';

import './file-explorer.scss';

const rpcService = new RPCService();

const errorHandler = (error: Error) => console.error(error);
// const getFilesList = (path: string) => rpcService.call('MPD.getFilesList', [path]).catch(errorHandler);
const getRelativePath = (fullPath: string): string => fullPath.split('/').slice(-1)[0];
const getPreviousPath = (fullPath: string): string => fullPath.split('/').slice(0, -1).join('/');
const getFileMeta = (fsObject: FSObject): { isFile: boolean, path: string, relativePath: string } => {
  const isFile = fsObject.type === 'file';
  const { path } = fsObject;
  const relativePath = getRelativePath(path);

  return { isFile, path, relativePath };
};

type FileExplorerProps = {
};

type FSObject = {
  type: string,
  path: string,
  duration: number,
};

type ExtendedFSObject = FSObject & {
  selected?: boolean,
};

type FileExplorerState = {
  path: string,
  items: ExtendedFSObject[],
  selectMode: boolean,
  selectedItemsIndexes: number[],
};

const FileExplorer: React.FC<FileExplorerProps> = () => {
  const [state, setState] = useState<FileExplorerState>({ path: '', items: [], selectMode: false, selectedItemsIndexes: [] });

  useEffect(() => {
    let isMounted = true;

    rpcService.call('MPD.getFilesList', [''])
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

  const openFolder = (path: string) => {
    rpcService.call('MPD.getFilesList', [path])
      .then((items: FSObject[]) => {
        setState((currentState) => ({ ...currentState, path, items }));
      })
      .catch(errorHandler);
  };

  const addToPlaylist = () => {
    [...state.selectedItemsIndexes]
      .sort((a, b) => a - b)
      .forEach((index) => {
        rpcService.call('MPD.add', [state.items[index].path])
          .then(() => {
            setState((currentState) => ({
              ...currentState,
              selectedItemsIndexes: currentState.selectedItemsIndexes.filter((i) => (i !== index)),
            }));
          })
          .catch(errorHandler);
      });
  };

  const onRowClick = (index: number) => {
    if (state.selectMode) {
      setState((currentState) => ({
        ...currentState,
        selectedItemsIndexes: currentState.selectedItemsIndexes.includes(index)
          ? currentState.selectedItemsIndexes.filter((i) => (i !== index))
          : [...currentState.selectedItemsIndexes, index],
      }));

      return;
    }

    const targetItemMeta = getFileMeta(state.items[index]);

    if (!state.selectMode && !targetItemMeta.isFile) {
      openFolder(state.path ? `${state.path}/${targetItemMeta.relativePath}` : targetItemMeta.relativePath);
    }
  };

  const onSelectButtonClick = () => {
    setState((currentState) => ({
      ...currentState,
      selectMode: !currentState.selectMode,
      selectedItemsIndexes: [],
    }));
  };

  return (
    <div className="file-explorer">
      <button type="button" className={classNames({ active: state.selectMode })} onClick={onSelectButtonClick}>
        <span className="icon material-icons-outlined">check</span>
      </button>
      <button type="button" onClick={addToPlaylist}>
        <span className="icon material-icons-outlined">add</span>
      </button>
      <table>
        <thead>
          <tr>
            {/* { state.selectMode ? <th>Select</th> : null } */}
            <th className="name">Name</th>
            <th className="time">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr onClick={() => openFolder(getPreviousPath(state.path))}>
            {/* { state.selectMode ? <td /> : null } */}
            <td>. .</td>
          </tr>
          { state.items.map((item: ExtendedFSObject, index) => {
            const { isFile, relativePath: title } = getFileMeta(item);
            const time = isFile ? fancyTimeFormat(item.duration) : '';
            const icon = isFile ? 'insert_drive_file' : 'folder';
            const selected = state.selectedItemsIndexes.includes(index);

            return (
              <tr className={classNames({ active: selected })} key={item.path} onClick={() => onRowClick(index)}>
                {/* { state.selectMode ? <td><input type="checkbox" checked={selected} readOnly /></td> : null } */}
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
