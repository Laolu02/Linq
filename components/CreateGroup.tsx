'use client'
import { useSession } from 'next-auth/react'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { BsGlobe, BsLock } from 'react-icons/bs'
import { IoClose } from 'react-icons/io5'

function CreateGroup() {
const {data:session, status} =useSession();
const router = useRouter();
const [form, setForm] = useState({
    name:'', description:'', isPublic:true, avatar:''
})
const [isLoading, setIsLoading]= useState(false);
const [error, setError]=useState('');
if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (status === 'unauthenticated'|| !session?.user) {
    router.push('/auth')
    return null
  }

  const handleSubmit= async (e:React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true) 
    setError('')
    try {
        if (!form.name.trim()) {
            setError('Group name is required')
            setIsLoading(false)
            return
        }
        const res = await fetch('/api/chats/new',{
            method: 'POST', headers:{'Content-Type': 'application/json'},
            body:JSON.stringify({
                name:form.name.trim(),
                description: form.description.trim()|| undefined,
                creatorId: session?.user?.id,
                isPublic: form.isPublic,
                avatar: form.avatar|| undefined,
            }),
        })
        const data = await res.json()
        if (!res.ok) {
            setError(data.error || 'Failed to create group')
            setIsLoading(false)
            return
        }
        router.push(`/chat/${data.group.id}`)
    } catch (error) {
        console.error('Error creating group:', error)
        setError('Something went wrong')
        setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-purple-200 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">
              {" "}
              Create a New Group
            </h1>
            <p className="text-blue-600 mt-1">
              Converse and Share experiences with diverse people
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-blue-400 rounded-full transition"
          >
            <IoClose className="w-8 h-8 text-blue-700" />
          </button>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-md p-6">
          {error && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700">{error}</p>
            </div>
          )}
          <form action="" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                  <Image
                    src='/group.png'
                    alt="Group avatar"
                    width={120}
                    height={120}
                    className="rounded-full object-cover"
                  />
                  <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                Group Name <span className="text-blue-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Project Team, Book Club, Family Chat"
                maxLength={50}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <p className="text-xs font-semibold text-gray-500 mt-1">{form.name.length}/50 characters</p>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional) <span className="text-blue-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="About of the Group"
                maxLength={200}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <p className="text-xs font-semibold text-gray-500 mt-1">{form.description.length}/200 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Group Access
              </label>
              <div className="space-y-3">
                {/* Public Group */}
                <div
                  onClick={() => setForm({ ...form, isPublic: true })}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                    form.isPublic
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center ${
                    form.isPublic ? 'border-blue-600' : 'border-gray-300'
                  }`}>
                    {form.isPublic && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <BsGlobe className={`w-5 h-5 ${form.isPublic ? 'text-blue-600' : 'text-gray-600'}`} />
                      <span className={`font-semibold ${form.isPublic ? 'text-blue-900' : 'text-gray-900'}`}>
                        Public Group
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Anyone can join this group. Perfect for open communities.
                    </p>
                  </div>
                </div>

                {/* Private Group */}
                <div
                  onClick={() => setForm({ ...form, isPublic: false })}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                    !form.isPublic
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center ${
                    !form.isPublic ? 'border-blue-600' : 'border-gray-300'
                  }`}>
                    {!form.isPublic && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <BsLock className={`w-5 h-5 ${!form.isPublic ? 'text-blue-600' : 'text-gray-600'}`} />
                      <span className={`font-semibold ${!form.isPublic ? 'text-blue-900' : 'text-gray-900'}`}>
                        Private Group
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Only invited members can join. You can add members after creation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !form.name.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default CreateGroup