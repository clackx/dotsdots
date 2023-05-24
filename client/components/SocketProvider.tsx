import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { TGameObj } from '../types';
import { config } from './Constants';
import { io, Socket } from 'socket.io-client';
const back_url = config.url.BACKEND_URL

import { TStatsObj } from '../types';

export type SocketContextValue = {
  socket: Socket | undefined,
  isSocketReady: boolean,
  socketData: TStatsObj | undefined
}

interface Props {
  game: TGameObj, 
  children: ReactNode
}

export const SocketContext = createContext<SocketContextValue>({
  socket: undefined,
  isSocketReady: false,
  socketData: undefined
});

export const SocketProvider: React.FC<Props> = ({ game, children }) => {
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [socket, setSocket] = useState<Socket>();
  const [data, setData] = useState<TStatsObj>();

  useEffect(() => {
    var socket = io(back_url + 'woofwoof',
      {
        path: '/ws/', transports: ['websocket'],
        query: { gameId: game.gameId, userId: game.userId }
      })

    setSocket(socket);

    socket.on("connect", () => {
      setIsSocketReady(true)
    });

    socket.on('connect_error', () => {
      setIsSocketReady(false)
    })

    socket.on('connect_failed', () => {
      setIsSocketReady(false)
    })

    socket.on('statsToClient', (data: TStatsObj) => {
      setData(data);
    });

    return () => {
      socket.disconnect();
    };

  }, [game]);

  return (
    <SocketContext.Provider value={{ socket, isSocketReady, socketData: data }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider
