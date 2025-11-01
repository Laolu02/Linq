'use client'

import React, { useEffect, useRef, useState } from 'react'
import io, { Socket } from 'socket.io-client';
import { IoSend } from 'react-icons/io5';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Image from 'next/image';


//let socket :  Socket
type Message={
    id: number| string
    text: string
    self: boolean
    time: string
    senderId: string
    senderName?: string;
    image?: string | null;
    
}
interface User{
    id: string
     name: string;
    email: string;
    image?: string | null;
}
interface Group {
    id: string;
    name: string;
    description?: string;
    avatar?: string | null;
}

interface ChatAreaProps {
  currentUser: User 
  group: Group 
}

interface UserGroupEventData {
    userId: string;
}
interface SocketMessageData {
    id: string | number;
    text: string;
    type: 'GROUP' | 'group'; 
    groupId: string;
    senderId: string;
    createdAt: string;
    sender?: {
        id: string;
        name: string;
        image: string | null;
    };
}

const fetchMessages = async (groupId: string): Promise<Message[]> => {
    console.log(`[API] Fetching messages for group ${groupId} ...`);
   try {
    const res = await fetch(`/api/messages/group?groupId=${groupId}`);
    if(!res.ok) throw new Error('Failed to fetch group messages');
    const data = await res.json();
    return data.messages||[];
   } catch (error) {
    console.error('Error fetching group messages:', error);
      return [];
   }
};

const postMessage = async (messageData:{text:string, groupId: string, senderId: string}) => {
  try {
    const res = await fetch('/api/messages/group',{
      method:'POST',
      headers:{
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
                message: messageData.text,
                groupId: messageData.groupId,
                senderId: messageData.senderId, 
            }),
    });
    if (!res.ok) {
      const responseError = await res.json();
      throw new Error(responseError.error||'Failed to message DB');
    }
    console.log("Message persisted successfully.");
  } catch (error:unknown) {
    console.error("Message persisted successfully.",error);
  }
}

function ChatArea({currentUser, group}: ChatAreaProps) {
    const [message,setMessage] = useState('');
    const[ messages,setMessages]= useState<Message[]>([ ]);
   // const[ myid, setMyid]= useState<string|undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
   
  useEffect(()=>{
    const loadMessages = async () => {
        if (!group?.id) return;
        setIsLoading(true);
        try {
          const history = await fetchMessages(group.id);
          console.log("History Received:", history);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const displayMessages = history.map((msg:any)=>({
            id:msg.id, text: msg.message, self: msg.senderId === currentUser.id,
             time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }), senderId: msg.senderId,
              senderName: msg.sender?.name,
               image: msg.sender?.image
          }));
          setMessages(displayMessages);
        } catch (error) {
          console.error('Failed to load chat history:', error)
        }finally{
          setIsLoading(false);
        }
      }; loadMessages();
  }, [group?.id, currentUser.id]);
  
  useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    
    useEffect(() => {
      if (!currentUser?.id || !group?.id) return;
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!,{
        transports:["websocket"],
        withCredentials: true,
      });
      // socket.on("connect", () => {
      //   console.log('connected')
      //   setMyid(socket.id || "");
      // });
      socketRef.current = socket;
      socket.emit('register', currentUser.id);

      socket.emit('joinGroup', { 
            userId: currentUser.id, 
            groupId: group.id 
        });
      
      socket.on('newMessage',(data: SocketMessageData) => {
        console.log("📩 Received:", data);
        if (data.type?.toUpperCase() === 'GROUP' && data.groupId === group.id) {
          const isCurrentSender = data.senderId === currentUser.id
          setMessages((prev)=>[...prev,{
            id:data.id, text: data.text,
            time: new Date(data.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    self: isCurrentSender,
                    senderId: data.senderId,
                    senderName: isCurrentSender ? currentUser.name : data.sender?.name, 
                    image: isCurrentSender ? currentUser.image : data.sender?.image
          },]);
        } console.log("RECEIVED:", data.type, "Target:", data.groupId, "Current:", group.id);
      }
    );
     socket.on('userJoinedGroup', (data: UserGroupEventData) => {
            console.log(`User ${data.userId} joined the group`);
        });

        socket.on('userLeftGroup', (data: UserGroupEventData) => {
            console.log(`User ${data.userId} left the group`);
        });

        socket.on('error', (data: unknown) => {
           if (typeof data === 'object' && data !== null && 'message' in data) {
        alert((data as { message: string }).message); // Safely cast and access
    } else {
        alert('An unknown socket error occurred.');
    };
        });
    return () => {
      socket.disconnect();
    };
  }, [currentUser?.id, group?.id, currentUser.name, currentUser.image]);



    const sendMessage = ()=>{ 
      const messageText = message.trim();
        if(!messageText) return;
        const messageData={text:messageText, senderId:currentUser.id, groupId:group.id,senderName:currentUser.name, image: currentUser.image };
        if (socketRef.current) {
          socketRef.current.emit('groupMessage', messageData)
        } else {
          console.warn("Socket not connected. Message will only be saved to DB.");
        }
            //socketRef.current.emit('groupMessage', messageData);
            postMessage({text:messageText, senderId:currentUser.id, groupId:group.id})
            // setMessages((prev)=>[...prev,{
            //   id:Date.now(),text: messageText, time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
            //   self:true, senderId: currentUser.id, senderName:currentUser.name, image: currentUser.image,
            // }]);
            setMessage('');
    };
  return (
    <div className="flex flex-col  h-screen  bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden rounded-xl">
      <div className="bg-white border-b rounded-t-xl border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-5xl mx-auto text-blue-950 relative">
          <div className="flex items-center gap-3">
            <Image
              src={group.avatar || "/group.png"}
              alt={group.name}
              width={48}
              height={48}
              className="rounded-full"
            />
            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-bold font-serif bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {group.name || "Linq Room"}
            </h1>
          </div>
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
                className={`flex gap-2 mb-3 ${
                  m.self ? "justify-end" : "justify-start"
                }`}
              >
                {!m.self && (
                  <Image
                    src={m.image || "/dp.jpeg"}
                    alt="Avatar" width={40} height={40}
                    className="w-8 h-8 rounded-full self-end mb-1 flex-shrink-0"
                  />
                )}
                <div
                  className={`flex flex-col text-sm sm:max-w-md px-3 py-2 mb-1 max-w-[56%] shadow-sm
                        ${
                          m.self
                            ? "ml-auto  bg-blue-500 text-right rounded-l-2xl rounded-tr-2xl  text-white"
                            : "mr-auto bg-gray-200 rounded-r-2xl rounded-tl-2xl  text-left  text-gray-950"
                        } text-shadow-black`}
                >
                  {!m.self && m.senderName && (
                    <p className="text-xs font-semibold mb-1 text-blue-600">
                      {m.senderName}
                    </p>
                  )}
                  <p className=" text-sm leading-relaxed break-words mb-1">
                    {m.text}
                  </p>
                  <p
                    className={`text-xs opacity-70 ${
                      m.self ? "text-blue-100" : "text-gray-600"
                    }`}
                  >
                    {m.time}
                  </p>
                  <div></div>
                </div>
                {m.self && (
                  <Image
                    src={currentUser.image || "/dp.jpeg"}
                    alt="Avatar" width={48} height={48}
                    className="w-8 h-8 rounded-full self-end mb-1"
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef}/>
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