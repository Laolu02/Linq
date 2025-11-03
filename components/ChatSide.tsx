'use client'

import React from 'react';
import Image from 'next/image';
import { FaUsers, FaLock, FaSearch, FaPlus } from 'react-icons/fa';
interface ChatList {
    id: string
    type: 'PRIVATE'| 'GROUP'
    name: string
    lastMessage: string;
    time: string; 
    avatarUrl: string;
    unreadCount: number;
}
interface ChatSideBar{
    chats: ChatList[];
    selectedChatId: string | null;
    onSelectChat: (chatId: string) => void;
}
export default function ChatSideBar({chats,selectedChatId,onSelectChat}: ChatSideBar) {
    return (
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-xl">
           
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold text-gray-800">Chats</h2>
                <div className="flex space-x-2">
                    <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition" aria-label="New chat">
                        <FaPlus className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition" aria-label="Search chats">
                        <FaSearch className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 mt-10">
                        No active conversations. Start a new chat!
                    </div>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => onSelectChat(chat.id)}
                            className={`flex items-center p-4 cursor-pointer border-b border-gray-100 transition-colors duration-150 ${
                                selectedChatId === chat.id 
                                    ? 'bg-blue-50 border-l-4 border-blue-600'
                                    : 'hover:bg-gray-50'
                            }`}
                        >
                            <div className="relative w-12 h-12 flex-shrink-0 rounded-full bg-gray-200 overflow-hidden">
                                <Image src={chat.avatarUrl} alt={chat.name} fill className="object-cover" />
                                <span className={`absolute bottom-0 right-0 p-1 rounded-full ${chat.type === 'GROUP' ? 'bg-indigo-500' : 'bg-green-500'}`}>
                                    {chat.type === 'PRIVATE' ? <FaLock className="w-2 h-2 text-white" /> : <FaUsers className="w-2 h-2 text-white" />}
                                </span>
                            </div>
                            <div className="ml-3 flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-gray-800 truncate">{chat.name}</p>
                                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                            </div>
                            <div className="flex flex-col items-end ml-2">
                                <p className="text-xs text-gray-400 mb-1">{chat.time}</p>
                                {chat.unreadCount > 0 && (
                                    <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}