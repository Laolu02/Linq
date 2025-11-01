'use client'

import ChatSideBar from '@/components/ChatSide'
import React, { useState } from 'react'

function Page() {

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <div>
        <ChatSideBar chats={[]} selectedChatId={selectedChatId} onSelectChat={(chat)=> setSelectedChatId(chat) }/>
    </div>
  )
}

export default Page