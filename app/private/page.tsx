'use client'
import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import PrivateChat from '@/components/PrivateChat';


function Page() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const recipient= {
    id: "2",
    name: "Chat Partner",
    email: "partner@example.com",
    image: "/dp.jpeg",
  };
    if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-600">
        Loading Session...
      </div>
    );
  }
    if (status === 'unauthenticated' || !session?.user) {
    router.replace('/signin'); 
    return null; 
    }

    const currentUser = {
    id: session.user.id || (session.user.email ? `user-${session.user.email}` : 'unknown'), 
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };
  return (
    <div> <PrivateChat currentUser={currentUser} recipient={recipient} /> </div>
  )
}

export default Page