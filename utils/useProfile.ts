import { useState } from "react"


export function useProfile(){
  const [isOpen, setIsOpen] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [profileType, setProfileType] = useState<'user' | 'group'>('user')

  const openUserProfile = (userId: string) => {
    setProfileId(userId)
    setProfileType('user')
    setIsOpen(true)
  }

  const openGroupProfile = (groupId: string) => {
    setProfileId(groupId)
    setProfileType('group')
    setIsOpen(true)
  }

  const closeProfile = () => {
    setIsOpen(false)
    setTimeout(() => {
      setProfileId(null)
    }, 300)
  }

  return {
    isOpen,
    profileId,
    profileType,
    openUserProfile,
    openGroupProfile,
    closeProfile
  }

}