'use client'

import React, { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client';
import { IoSend } from 'react-icons/io5';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Image from 'next/image';


let socket :  Socket
type Message={
    id: number
    text: string
    self: boolean
    time: string
    senderId: string
    image?: string | null;
    
}
// interface User{
//     id: number
   
//     receiverId: string
// }
// interface StoredMessage extends User {
    
//     createdAt: Date;
// }
// interface ChatAreaProps {
//   currentUser: any 
//   recipient: any 
// }

/*const fetchMessagesFor = async (userId1: string, userId2: string): Promise<StoredMessage[]> => {
    console.log(`[API] Fetching messages between ${userId1} and ${userId2}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const simulatedHistory: StoredMessage[] = [
    
            ];
            resolve(simulatedHistory);
        }, 500); 
    });
};*/


function ChatArea() {
    const [message,setMessage] = useState('');
    const[ messages,setMessages]= useState<Message[]>([ ]);
   // const[ myid, setMyid]= useState<string|undefined>(undefined);
    const [isLoading,] = useState(false);
   

    
    useEffect(() => {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!,{
        transports:["websocket"],
        withCredentials: true,
      });
      // socket.on("connect", () => {
      //   console.log('connected')
      //   setMyid(socket.id || "");
      // });

      socket.on(
      'chat message',
      ({ text, senderId }: { text: string; senderId: string }) => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text,
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            self: senderId === socket.id,
            senderId, 
          },
        ]);
      }
    );
    return () => {
      socket.disconnect();
    };
  }, []);



    const sendMessage = ()=>{ 
        if(!message.trim()) return;
            socket.emit('chat message', {text: message , senderId: socket.id,});
            setMessage('');
    };
  return (
    <div className="flex flex-col  h-screen  bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden rounded-xl">
      <div className="bg-white border-b rounded-t-xl border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-5xl mx-auto text-blue-950 relative">
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-bold font-serif bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Linq Room
          </h1>
          <button className="ml-auto text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition">
            <BsThreeDotsVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-5xl w-full mx-auto bg-gradient-to-l from-blue-200 via-white to-purple-100 ">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center font-serif">
              <p className="text-gray-500 text-lg "> No messages yet</p>
              <p className="text-gray-600 text-lg">Start a conversation now</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex gap-2 mb-3 ${m.self ? "justify-end" : "justify-start"}`}>
                {!m.self && <Image src={ m.image||"/dp.jpeg"} alt="Avatar" className='w-8 h-8 rounded-full self-end mb-1 flex-shrink-0'/>}
                <div className={`flex flex-col text-sm sm:max-w-md px-3 py-2 mb-1 max-w-[56%] shadow-sm
                        ${
                          m.self
                            ? "ml-auto  bg-blue-500 text-right rounded-l-2xl rounded-tr-2xl  text-white"
                            : "mr-auto bg-gray-200 rounded-r-2xl rounded-tl-2xl  text-left  text-gray-950"
                        } text-shadow-black`}>
                    <p className=" text-sm leading-relaxed break-words mb-1">{m.text}</p>
                    <p className={`text-xs opacity-70 ${m.self ? "text-blue-100" : "text-gray-600"}`}>
                    {m.time}
                    </p>
                    <div></div>
                </div>
                {m.self && <Image src={ m.image||"/dp.jpeg"} alt="Avatar" className='w-8 h-8 rounded-full self-end mb-1'/>}
              </div>
            ))}
            <div />
          </div>
        )}
      </div>
      <div className="bg-white border-t rounded-b-xl border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center space-x-3">
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-gray-100 px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900 placeholder-gray-500"
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className={`p-3 rounded-full transition-all duration-200 ${
              message.trim()
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <IoSend className="w-5 h-5" />
          </button>
        </div>
      </div>
      
    </div>
  );
}

export default ChatArea