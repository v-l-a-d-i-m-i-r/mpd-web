import React, { useState, useEffect } from 'react';
import {
  DragDropContext, Droppable, Draggable,
  DropResult, DroppableStateSnapshot, DraggableStateSnapshot, DraggableProvided, DroppableProvided,
} from 'react-beautiful-dnd';

import './playlist.scss';

import RPCService from '../../services/rpc.service';
import { classNames, fancyTimeFormat } from '../../utils';

const rpcService = new RPCService();

const errorHandler = (error: Error) => console.error(error);

type PlaylistItem = {
  id: number;
  pos: number;
  path: string;
  type: string;
  name?: string;
  title?: string;
  time?: number;
};

type PlaylistProps = {
  songid: number;
};

const Playlist: React.FC<PlaylistProps> = ({ songid }) => {
  const [state, setState] = useState<PlaylistItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    rpcService.call('MPD.getPlaylistInfo')
      .then((playlistItems) => {
        if (isMounted) {
          setState(playlistItems as PlaylistItem[]);
        }
      })
      .catch(errorHandler);

    return () => {
      isMounted = false;
    };
  }, [songid]);

  const reorder = ({ items, startIndex, endIndex }) => {
    console.log('Start index ', startIndex);
    console.log('End index ', endIndex);

    const result = Array.from(items);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    rpcService.call('MPD.reorder', [result.source.index, result.destination.index])
      .then((playlistItems) => setState(playlistItems as PlaylistItem[]))
      .catch(errorHandler);
  };

  const getListStyle = (snapshot: DroppableStateSnapshot) => ({
    // background: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
    // padding: grid,
    // width: '100%',
  });

  const getItemStyle = (snapshot: DraggableStateSnapshot, provided: DraggableProvided) => provided.draggableProps.style;

  const onRowDoubleClick = (item: PlaylistItem): void => {
    rpcService.call('MPD.play', [item.pos]).catch(errorHandler);
  };

  const getDroppableProps = (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => ({
    ...provided.droppableProps,
    ref: provided.innerRef,
    style: getListStyle(snapshot),
  });

  const getDraggableProps = (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => ({
    ...provided.draggableProps,
    ...provided.dragHandleProps,
    ref: provided.innerRef,
    style: getItemStyle(snapshot, provided),
  });

  return (
    <div className="playlist">
      <table>
        <thead>
          <tr>
            <th className="position">#</th>
            <th className="title">Title</th>
            <th className="time">Time</th>
          </tr>
        </thead>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(droppableProvided, droppableStateSnapshot) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <tbody {...getDroppableProps(droppableProvided, droppableStateSnapshot)}>
                {state.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                    {(draggableProvided, draggableStateSnapshot) => {
                      const position = item.pos + 1;
                      const title = item.name || item.title || item.path;
                      const time = fancyTimeFormat(item.time);

                      return (
                        <tr
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...getDraggableProps(draggableProvided, draggableStateSnapshot)}
                          className={classNames({ active: item.id === songid })}
                          onDoubleClick={() => onRowDoubleClick(item)}
                        >
                          <td className="position">
                            {position}
                          </td>
                          <td className="title">
                            <span className="icon material-icons-outlined">{item.type === 'stream' ? 'podcasts' : 'insert_drive_file'}</span>
                            {title}
                          </td>
                          <td className="time">
                            {time}
                          </td>
                        </tr>
                      );
                    }}
                  </Draggable>
                ))}
                {droppableProvided.placeholder}
              </tbody>
            )}
          </Droppable>
        </DragDropContext>
      </table>
    </div>
  );
};

export default Playlist;
