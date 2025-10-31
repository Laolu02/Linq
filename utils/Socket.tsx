'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const socketInstance = io( process.env.NEXTAUTH_URL||
  "https://linq-mu.vercel.app", 
); 

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setSocket(socketInstance);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocket(null);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && session?.user?.id) {
      socket.emit('register', session.user.id);
      console.log(`Attempting to register user ID: ${session.user.id}`);
    }
  }, [socket, session?.user?.id]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};