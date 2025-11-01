'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { BsGlobe, BsLock, BsPlus } from 'react-icons/bs'
import Image from 'next/image'
import { IoChevronBack } from 'react-icons/io5'


interface Group {
  id: string
  name: string
  description?: string
  avatar?: string | null
  isPublic: boolean
  memberCount: number
  isMember: boolean
  creator: {
    name: string
  }
  lastMessage?: {
    content: string
    createdAt: Date
  }
}



function GroupList() {
    const { data: session, status } = useSession()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, {/*setSearchQuery*/}] = useState('')
  const [joinGroupId, setJoinGroupId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated' || !session?.user) {
      router.push('/auth')
    }
  }, [status, router, session])

  useEffect(() => {
    if (session?.user?.id) {
      fetchGroups()
    }
  }, [session?.user?.id])

  const fetchGroups = async () => {
    try {
        setIsLoading(true)
        const res = await fetch('/api/groups')
        if(!res.ok) {
           console.error('Error fetching groups:', res.status, res.statusText);
           const errorData = await res.json();
            console.error('Server error details:', errorData);
            throw new Error(`Failed to fetch groups: ${res.statusText}`);
          }
        const data= await res.json()
      setGroups(data.groups || [])    
    } catch (error) {
        console.error('Error fetching groups:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const handlejoinGroup = async (groupId: string) => {
    try {
        setJoinGroupId(groupId)
        const res= await fetch('/api/groups/join',{
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            groupId,
            userId: session?.user?.id
            })
        })
        await res.json()
        if (!res.ok) {
            throw new Error('Failed to join')
  
        }
        await fetchGroups()
        router.push(`/chat/${groupId}`)
    } catch (error) {
        console.error('Error joining group:', error)
      alert('Failed to join group')
    } finally {
        setJoinGroupId(null)
    }
  }
const handleOpenGroup = (group: Group)=>{
    if (group.isMember) {
        router.push(`/chat/${group.id}`)
    } else {
        handlejoinGroup(group.id)
    }
}
const filterGroup = groups.filter(group=>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
)
if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center p-4 border-b border-gray-200">
            <button onClick={()=>{router.back()}} aria-label='Back to previous page' className="p-2 text-3xl text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer" >
               <IoChevronBack/>
          </button>
          <div className='flex-grow'>
             <h1 className="text-xl font-bold text-gray-900 mb-2 leading-none">
              Groups
            </h1>
            <p className=" text-sm text-gray-700">Discover and connect more </p>
          </div>
          </div>
          <button
            onClick={() => router.push("/chats/new")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <BsPlus className="w-6 h-6" /> New Group
          </button>
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <p> Loading groups...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterGroup.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6 border-b border-gray-300">
                  <div className=" flex items-start gap-4">
                    <Image
                      src={group.avatar || "/group.png"}
                      alt={group.name}
                      width={60}
                      height={60}
                      className="rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-=">
                      <h3 className='className="font-semibold text-lg text-gray-900 truncate mb-1'>
                        {group.name}
                      </h3>
                      {group.isPublic ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BsGlobe className="w-4 h-4" />
                          <span>Public</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BsLock className="w-4 h-4" />
                          <span>Private</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className='p-6'>
                    {group.description && (
                        <p className='text-sm text-gray-600 mb-4 line-clamp-2'>{group.description.slice(20)}</p>
                    )}
                    {group.lastMessage && (
                        <div className='text-xs text-gray-500 mb-4 p-2 bg-blue-50 rounded'>
                            <p className='truncate'>{group.lastMessage.content}</p>
                        </div>
                    )}
                    <button onClick={()=>handleOpenGroup(group)} disabled={joinGroupId=== group.id}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                      group.isMember
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}  >
                        {joinGroupId=== group.id?(<span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Joining...
                      </span>
                    ) : group.isMember ? (
                      'Open Chat'
                    ) : (
                      'Join Group')}
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupList