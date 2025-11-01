"use client";

import UserList from '@/components/UserList'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

interface User{
    id: string
    name:string
    email: string
    image?: string
}

function Page() {
  const { data: session, status } = useSession();
  const [selectedUser, setSelectedUser] = useState<User|null>(null);
  const router = useRouter();
  
   useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading session...
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return null;
  }
  // if (status === "unauthenticated" || !session?.user) {
  //   router.replace("/signin");
  //   return null;
  // }
  const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        router.push(`/private/${user.id}`);
    };
   const currentUser = {
    id: session.user.id || (session?.user.email ? `user-${session.user.email}` : 'unknown'), 
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };
  return (
    <div>
        <UserList currentUserId={currentUser.id} selectedUser={selectedUser}
        onSelectUser={handleSelectUser}/>
    </div>
  )
}

export default Page