'use client'

import ChatSideBar from '@/components/ChatSide'
import React, { useState } from 'react'

function page() {

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <div>
        <ChatSideBar chats={[]} selectedChatId={selectedChatId} onSelectChat={(chat)=> setSelectedChatId(chat) }/>
    </div>
  )
}

export default page