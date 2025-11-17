'use client'

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { IoCalendarOutline, IoChatbubblesOutline, IoClose, IoExitOutline, IoMailOutline, IoPeopleOutline, IoPersonOutline, IoSettingsOutline } from "react-icons/io5"
import { RiAdminFill } from "react-icons/ri";

interface UserProfile {
  type: 'user'
  id: string
  name: string
  email: string
  username?: string
  avatar?:string|null
  image?: string | null
  isOnline?: boolean
  lastSeen?: Date
  bio?: string
  createdAt: Date
  stats?: {
    messagesSent: number
    conversations: number
    groupsJoined: number
    groupsCreated: number
  }
}

interface GroupProfile {
  type: 'group'
  id: string
  name: string
  description?: string
  avatar?: string | null
  isPublic: boolean
  creator: {
    id: string
    name: string
    avatar?: string | null
  }
  memberCount: number
  messageCount: number
  members?: Array<{
    userId: string
    role: string
    joinedAt: Date
    user: {
      id: string
      name: string
      avatar?: string | null
      isOnline?: boolean
    }
  }>
  createdAt: Date
  isMember: boolean
  userRole?: string | null
}

type Profile = UserProfile | GroupProfile

interface ProfileModalProps {
  profileId: string
  profileType: 'user' | 'group'
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({profileId, profileType, isOpen, onClose}: ProfileModalProps) {
    const {data:session}= useSession()
    const [profile, setProfile]= useState<Profile|null>(null)
    const [isLoading, setIsLoading]= useState(true)
    const [error, setError] = useState<string|null>(null)

    const fetchProfile = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const display = profileType === 'user' ? `/api/users/${profileId}`
            : `/api/groups/${profileId}`
            console.log('Fetching profile:' ,display)

            const res = await fetch(display)
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch profile')
            }

            const profileData = profileType === 'user'?
            {...data.user, type:'user' as const}: {...data.group, type:'group' as const}
            setProfile(profileData)
        } catch (err) {
             console.error('Error fetching profile:', err)
            setError(err instanceof Error ? err.message : 'Failed to load profile')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(()=>{
        if (isOpen && profileId) {
            fetchProfile()
        }
    }, [isOpen, profileId, profileType])

    const handleLeaveGroup = async () => {
        if(!profile || profile.type !== 'group') return
        if(!confirm('Are you sure you want to exit this group')) return
        try {
            const res = await fetch(`/api/groups/join?groupId=${profile.id}&userId=${session?.user?.id}`,{ method: 'DELETE'})
            if (!res.ok) {
                const data= await res.json()
                throw new Error(data.error|| 'Failed to exit group')
            }
            alert("Successfully exited group")
            onClose()
        } catch (err) {
            alert(err instanceof Error ? err .message: 'Failed to exit group')
        }
    }
    const date = (date: Date)=>{
        return new Date(date).toLocaleDateString('en-US',{
            year:'numeric', month:'short', day:'numeric'
        })
    }

    const runlastSeen = (lastSeen?: Date) =>{
        if(!lastSeen) return 'Never'

        const now = new Date()
        const lastSeenDate = new Date(lastSeen)
        const diffInMinutes = Math.floor((now.getTime()- lastSeenDate.getTime())/(1000*60))
        if(diffInMinutes< 1) return 'Just now'
        if (diffInMinutes < 60) return `${diffInMinutes}ms ago`
         const diffInHours = Math.floor(diffInMinutes/ 60)
        if (diffInHours < 24) return`${diffInHours}hr(s) ago`
        const diffInDays = Math.floor(diffInHours/24)
        if(diffInDays === 1) return 'Yesterday'
        if(diffInDays < 7) return `${diffInDays}d ago`

        return lastSeenDate.toLocaleDateString()
    }

    if(!isOpen) return null
    return (
      <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-w rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-yellow-500 to-lime-600 rounded-t-2xl"></div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition "
            >
              <IoClose className="w-6 h-6 text-black" />
            </button>
            <div className=" absolute -bottom-16 left-8">
              {profile?.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={120}
                  height={120}
                  className=" rounded-3xl border-4 shadow-lg border-amber-50"
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  {profileType === "user" ? (
                    <IoPersonOutline className=" h-16 w-16 text-white" />
                  ) : (
                    <IoPeopleOutline className="h-16 w-16 text-white" />
                  )}
                </div>
              )}
              {profile?.type === "user" && profile.isOnline && (
                <div className=" absolute bottom-2 right-2 w-6 h-6 bg-lime-700 border-white border-4 rounded-full"></div>
              )}
            </div>
          </div>
          <div className=" pt-20 px-8 pb-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading profile...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : profile ? (
              <>
                <div className=" mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile.name}
                    </h1>
                    {profile.type === "group" && profile.userRole && (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                          profile.userRole === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : profile.userRole === "MODERATOR"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {profile.userRole === "ADMIN" && (
                          <RiAdminFill className="w-4 h-4" />
                        )}
                        {profile.userRole}
                      </span>
                    )}
                  </div>
                  {profile.type === "user" ? (
                    <>
                      {profile.username && (
                        <p className="text-gray-600 mb-1">@{profile.name}</p>
                      )}
                      <p className="text-gray-500 flex items-center gap-2">
                        <IoMailOutline className="w-4 h-4" />
                        {profile.email}
                      </p>
                      {profile.isOnline ? (
                        <p className="text-green-600 font-medium mt-2">
                          Online
                        </p>
                      ) : (
                        <p className="text-gray-500 mt-2">
                          Last seen {runlastSeen(profile.lastSeen)}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      {profile.description && (
                        <p className="text-gray-600 mt-2">
                          {profile.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <IoPeopleOutline className="w-4 h-4" />
                          {profile.memberCount} members
                        </span>
                        <span className="flex items-center gap-1">
                          <IoChatbubblesOutline className="w-4 h-4" />
                          {profile.messageCount} messages
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            profile.isPublic
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {profile.isPublic ? "🌐 Public" : "🔒 Private"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {profile.type === "user" && profile.stats ? (
                    <>
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {profile.stats.messagesSent}
                        </p>
                        <p className="text-sm text-gray-600">Messages</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {profile.stats.conversations}
                        </p>
                        <p className="text-sm text-gray-600">Chats</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {profile.stats.groupsJoined}
                        </p>
                        <p className="text-sm text-gray-600">Groups</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {profile.stats.groupsCreated}
                        </p>
                        <p className="text-sm text-gray-600">Created</p>
                      </div>
                    </>
                  ) : (
                    profile.type === "group" && (
                      <div className="col-span-2 md:col-span-4 bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <IoCalendarOutline className="w-4 h-4" />
                          Created on {date(profile.createdAt)} by{" "}
                          <span className="font-semibold">
                            {profile.creator.name}
                          </span>
                        </p>
                      </div>
                    )
                  )}
                </div>
                {profile.type === "group" &&
                  profile.members &&
                  profile.members.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <IoPeopleOutline className="w-5 h-5" /> Members (
                        {profile.members.length})
                      </h2>
                      <div className="space y-2 max-h-48 overflow-y-auto">
                        {profile.members.slice(0, 10).map((member) => (
                          <div
                            key={member.userId}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-200 transition"
                          >
                            <div className="flex items-center gap-3">
                              {member.user.avatar ? (
                                <Image
                                  src={member.user.avatar}
                                  alt={member.user.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                  {member.user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {member.user.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Joined {date(member.joinedAt)}
                                </p>
                              </div>
                              {member.user.isOnline && (
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              )}
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                member.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {member.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                <div className="flex gap-3"> 
                  {profile.type === "group"  && (
                    <button
                      onClick={handleLeaveGroup}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition font-medium"
                    >
                      <IoExitOutline className="w-5 h-5" /> Exit group
                    </button>
                  )}
                  {session?.user?.id ===
                    (profile.type === "user"
                      ? profile.id
                      : profile.creator.id) && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium">
                      <IoSettingsOutline className="w-5 h-5" />
                      Settings
                    </button>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
}