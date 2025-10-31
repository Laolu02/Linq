"use client"

import { useSession } from 'next-auth/react'

export default function TestSession() {
  const { data: session, status } = useSession();

  return (
    <div className="p-8 text-black">
      <h1 className="text-2xl text-black font-bold mb-4">Session Debug</h1>
      <div className="space-y-2">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Session:</strong></p>
        <pre className="bg-gray-100 p-4  text-black rounded overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  )
}