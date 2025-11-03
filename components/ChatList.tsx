'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { BsChatDots, BsPeopleFill } from 'react-icons/bs'
import { IoSearchOutline } from 'react-icons/io5'

interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
}

interface LastMessage {
  content: string
  createdAt: Date
  senderId: string
}

interface PrivateChat {
  id: string
  type: 'private'
  otherUser: User
  lastMessage?: LastMessage
  unreadCount: number
}

interface GroupChat {
  id: string
  type: 'group'
  name: string
  description?: string
  avatar?: string | null
  memberCount: number
  lastMessage?: LastMessage
  unreadCount: number
}

type Chat = PrivateChat | GroupChat

export default function ChatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'private' | 'group'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  const fetchChats = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/chats?userId=${session?.user?.id}`)
      
      if (!response.ok) throw new Error('Failed to fetch chats')
      
      const data = await response.json()
      setChats(data.chats)
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setIsLoading(false)
    }
  },[session?.user?.id, setChats, setIsLoading])

  useEffect(() => {
    if (session?.user?.id) {
      fetchChats()
    }
  }, [session?.user?.id, fetchChats])

  const handleChatClick = (chat: Chat) => {
    if (chat.type === 'private') {
      router.push(`/private/${chat.otherUser.id}`)
    } else {
      router.push(`/chat/${chat.id}`)
    }
  }

  const formatLastMessageTime = (date: Date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60))
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return diffInDays === 1 ? 'Yesterday' : `${diffInDays}d ago`
    }
  }

  const filteredChats = chats.filter(chat => {
    const matchesFilter = filter === 'all' || chat.type === filter
    const matchesSearch = searchQuery === '' || (
      chat.type === 'private' 
        ? chat.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
        : chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return matchesFilter && matchesSearch
  })

  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold  bg-gradient-to-l from-blue-600 to-purple-700 text-transparent bg-clip-text mb-2">Chats</h1>
          <p className="text-gray-600">All your conversations in one place</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative mb-4">
            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("private")}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                filter === "private"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <BsChatDots className="w-4 h-4" />
              Private
            </button>
            <button
              onClick={() => setFilter("group")}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                filter === "group"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <BsPeopleFill className="w-4 h-4" />
              Groups
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading chats...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-2">No chats found</p>
              <p className="text-sm text-gray-400">
                {searchQuery
                  ? "Try a different search term"
                  : "Start a new conversation!"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      {chat.type === "private" ? (
                        chat.otherUser.avatar ? (
                          <Image
                            src={chat.otherUser.avatar}
                            alt={chat.otherUser.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {chat.otherUser.name.charAt(0).toUpperCase()}
                          </div>
                        )
                      ) : chat.avatar ? (
                        <Image
                          src={chat.avatar}
                          alt={chat.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {chat.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {chat.type === "group" && (
                        <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1">
                          <BsPeopleFill className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {chat.type === "private"
                            ? chat.otherUser.name
                            : chat.name}
                        </h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatLastMessageTime(chat.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      {chat.type === "group" && (
                        <p className="text-xs text-gray-500 mb-1">
                          {chat.memberCount} members
                        </p>
                      )}

                      {chat.lastMessage ? (
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage.senderId === session?.user?.id &&
                            "You: "}
                          {chat.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          No messages yet
                        </p>
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                        {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="fixed bottom-8 right-8 flex flex-row gap-4 space-y-4">
          <button
            onClick={() => router.push("/chat/list")}
            title="Group Chat" aria-label='More Groups'
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          >
            <BsPeopleFill className="w-6 h-6" />
          </button>

          <button
            onClick={() => router.push("/users")}
            title="Private Chat" aria-label='More People'
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          >
            <BsChatDots className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}