// 'use client'

// import { useParams } from 'next/navigation'
// import { useSession } from 'next-auth/react'
// import { useEffect, useState } from 'react'
// import ChatArea from '@/components/ChatArea'


// export default function GroupChatPage() {
//   const params = useParams()
//   const { data: session } = useSession()
//   const [group, setGroup] = useState(null)

//   useEffect(() => {
//     if (params.id) {
//       fetchGroup()
//     }
//   }, [params.id])

//   const fetchGroup = async () => {
//     const res = await fetch(`/api/groups/${params.id}`)
//     const data = await res.json()
//     setGroup(data.group)
//   }

//   if (!session || !group) return <div>Loading...</div>

//   return (
//     <ChatArea
//       currentUser={session.user}
//       group={group}
//     />
//   )
// }