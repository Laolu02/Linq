'use client'

import React, { useEffect, useRef, useState } from 'react'
import io, { Socket } from 'socket.io-client';
import { IoSend } from 'react-icons/io5';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Image from 'next/image';


//let socket :  Socket
interface Message{
    text: string
    self: boolean
    time: string
    
}
interface Users{
    id: string
    senderId: string
    receiverId: string
}
interface StoredMessage {
    id: string;
    text: string;
    message:string;
    type: string
    senderId: string;
    receiverId?: string;
    conversationId?: string;
    groupId?: string;
    createdAt: Date
}
interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}
interface ChatAreaProps {
  currentUser: User;
  recipient: User | null;
}
const fetchMessagesFor = async (userId1: string, userId2: string): Promise<StoredMessage[]> => {
    console.log(`[API] Fetching messages between ${userId1} and ${userId2}...`);
    try {
      const res = await fetch(`/api/messages?userId1=${userId1}&userId2=${userId2}`);
    if (!res.ok) {
            const errorData = await res.json();
            console.error(errorData.error || `HTTP error! Status: ${res.status}`);
            return [];
        }
    const messages: StoredMessage[] = await res.json();
    return messages;
    } catch (error) {
      console.error("Error fetching private messages:", error);
       return [];
    }
};

function PrivateChat({currentUser, recipient}: ChatAreaProps) {
    const[message,setMessage]= useState('');
    const[messages,setMessages]= useState<Message[]>([ ]);
    //const[myid, setMyid]= useState<string|undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

     useEffect(()=>{
        const loadMessages = async () => {
            if(!currentUser?.id || !recipient?.id) return
            setIsLoading(true);
            const user1 = currentUser.id;
            const user2 = recipient.id;
            try {
                const history = await fetchMessagesFor(user1, user2);
                const messagesArray = Array.isArray(history) ? history : [];
                const displayMessages = messagesArray.map(msg =>({
                    text:msg.message,self: msg.senderId === currentUser.id, time: new Date(msg.createdAt).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}),
                }))
                setMessages(displayMessages);
            } catch (error) {
                console.error("Failed to load chat history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadMessages()
    }, [currentUser?.id, recipient?.id]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(()=>{
      if (!currentUser?.id || !recipient?.id) return;
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!,{
        transports:["websocket"],
        withCredentials: true,
      });
        socketRef.current = socket;
        socket.emit('register', currentUser.id);

        socket.on('newMessage', ({text, senderId,receiverId}:{text: string, senderId:string, receiverId:string,})=>{
          const isMessageForMe = receiverId === currentUser.id && senderId === recipient.id;
          const isMessageFromMe = senderId === currentUser.id && receiverId === recipient.id;
           if ( isMessageForMe
          // (senderId === currentUser.id && receiverId === recipient.id) ||
          // (senderId === recipient.id && receiverId === currentUser.id)
        ) {setMessages((prev)=>[...prev, {text,time: new Date().toLocaleTimeString([],{ hour: '2-digit', minute: '2-digit' }),
           self: false , },])}
           else if (isMessageFromMe) {
            
           }
        });
        return ()=>{
            socket.disconnect();
        }; 
    }, [currentUser?.id, recipient?.id]);


    const postMessage= async (messageData: {
      senderId: any; text: string, receiverId: string 
       }) => {
      try {
        const res = await fetch('/api/messages',{
          method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageData.text,
                    senderId: messageData.senderId,
                    receiverId: messageData.receiverId,
                }),
        });
        if (!res.ok) {
                const error = await res.json();
                console.error("Failed to persist message:", error.error);
            } else {
                console.log("Message persisted successfully.");
            }
      } catch (error) {
        console.error("API error during message persistence:", error);
      }
    }
    const sendMessage = async ()=>{ 
      const messageText= message.trim()
        if(!messageText) return;
        if (!socketRef.current) return;
        if (!recipient) {
          console.error("Recipient is not defined. Cannot send message.");
          return;
        }
        const messageData={ text:messageText, senderId: currentUser.id, receiverId: recipient.id,}
            socketRef.current.emit('privateMessage', messageData);
            postMessage({ text:messageText, receiverId:recipient.id, senderId:currentUser.id,});

            setMessages((prev)=>[...prev,{
              id:Date.now(), text:messageText, 
              time: new Date().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}),
            self:true, senderId:currentUser.id
            },]);
            setMessage('');
    };
     const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
  return (
    <div className="flex flex-col gap-1 h-screen  bg-white bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl">
        <div className="bg-white border-b rounded-t-xl border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                <Image
                  src={recipient?.image || "/dp.jpeg"}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-blue-500"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {recipient?.name || "User"}
                </h2>
                <p className="text-xs text-grey-900 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                  Online
                </p>
              </div>
            </div>
            <button className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition">
              <BsThreeDotsVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6 max-w-5xl w-full mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center font-serif">
                <p className="text-gray-500 text-lg "> No messages yet</p>
                <p className="text-gray-600 text-lg">
                  Start a conversation now
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, index) => (
                <div
                  key={index}
                  className={`flex flex-row text-md sm:max-w-md px-4 py-3 p-2 mb-2 gap-2 w-fit max-w-[56%] break-words 
                        ${
                          m.self
                            ? "ml-auto  bg-blue-500 text-right text-lg rounded-l-2xl rounded-br-2xl font-semibold justify-end text-white"
                            : "mr-auto bg-gray-200 rounded-r-2xl text-lg rounded-bl-2xl  text-left font-semibold justify-start text-gray-950"
                        } text-shadow-black`}
                >
                  <p className=" text-sm leading-relaxed break-words">
                    {m.text}
                  </p>
                  <p className="text-indigo-800 mt-3 text-xs opacity-70">
                    {m.time}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
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
              onKeyDown={handleKeyPress}
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

export default PrivateChat