'use client'
import React, { use, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import PrivateChat from '@/components/PrivateChat';

interface PageParams { 
    id: string; 
}

interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
}

function Page({params}: { params: { id: string }}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
    const [isLoadingRecipient, setIsLoadingRecipient] = useState(true);
    const resolvedParams = use(params as any)as PageParams;
    const recipientId = resolvedParams.id;

    useEffect(()=>{
      if (status === 'authenticated' && recipientId) {
            const fetchRecipient = async () => {
                try {
                    const res = await fetch(`/api/users/${recipientId}`);
                    if (!res.ok) {
                      console.log(res.status)
                        throw new Error('Failed to fetch user');
                    }
                    const apiData = await res.json(); 
                    const userData: User = apiData.user;        
                    setSelectedRecipient(userData);
                } catch (error) {
                    console.error('Error fetching recipient:', error);
                    router.replace('/users'); 
                } finally {
                    setIsLoadingRecipient(false);
                }
            };
            fetchRecipient();
        }
    },[status, recipientId, router])
    
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
    <div> <PrivateChat currentUser={currentUser} recipient={selectedRecipient} /> </div>
  )
}

export default Page
