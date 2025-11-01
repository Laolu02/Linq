"use client"

import ChatArea from '@/components/ChatArea'
import React, { use, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation';

interface PageParams { 
    id: string; 
}
interface Group {
  id: string;
  name: string; 
  avatar: string | null;
}
function Page({params}: { params: { id: string }}) {
   const { data: session, status } = useSession();
   const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const resolvedParams = use(params as any)as PageParams; 
   const groupId = resolvedParams.id;
   const [group, setGroup] = useState<Group|null>(null);
   const [{/*isLoadingGroup*/}, setIsLoadingGroup] = useState(true);

 
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/signin')
    }
  }, [status, router]);

  React.useEffect(() => {
    if (status === 'authenticated' && groupId) {
      const fetchGroup = async () => {
        try {
          const response = await fetch(`/api/chats/${groupId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch group');
          }
          const groupData = await response.json();
          if (groupData && groupData.name) {
            setGroup(groupData);
        } else {
            throw new Error('Group data is missing required name property.');
        }
        } catch (error) {
          console.error('Error fetching group:', error);
          setGroup(null)
        } finally {
          setIsLoadingGroup(false);
        }
      };
      fetchGroup();
    }
  }, [status, groupId]);


  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-600">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-4 border-blue-500 border-opacity-25 border-t-blue-500"></div>
        <p>Loading session...</p>
      </div>
    )
  }
  
  if (status === 'unauthenticated'|| !session?.user) {
    return null
  }
  if (!group || !group.name) { 
    return <div className="p-8 text-center text-blue-500">Group not found or data missing.</div>;
}


  const currentUser = {
       id: session.user.id || (session.user.email ? `user-${session.user.email}` : 'unknown'), 
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
    };


  return (
    <div>
        <ChatArea currentUser={currentUser} group={group} />
    </div>
  )
}

export default Page