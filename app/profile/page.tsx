'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import React, { useState } from 'react';
import { FaUserCircle, FaEnvelope, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa';
import { IoIdCard } from "react-icons/io5";

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const [isIdVisible, setIsIdVisible] = useState(false);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-4 border-blue-500 border-opacity-25 border-t-blue-500"></div>
        <p className="ml-3 text-gray-600">Loading user data...</p>
      </div>
    );
  }
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-xl text-red-500 mb-4">You must be signed in to view this page.</p>
        <button
          onClick={() => window.location.href = '/signin'}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
        >
          Go to Sign In
        </button>
      </div>
    );
  }
  const { name, email, image, createdAt } = session.user;
  const userInitial = name?.[0]?.toUpperCase() || 'User';
  const rawDate = session.user.createdAt; 
  console.log('Raw createdAt:', session.user.createdAt);
let memberSinceDate = 'N/A';

if (rawDate && typeof rawDate === 'string') {
    const dateObj = new Date(rawDate);
    
    // Check if the date object is valid
    if (!isNaN(dateObj.getTime())) {
        memberSinceDate = dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-28 h-28 mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-lg">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {image ? (
                <Image 
                  src={image} 
                  alt={`${name}'s Profile`} 
                  fill 
                  className="object-cover" 
                />
              ) : (
                <span className="text-4xl font-bold text-white bg-indigo-500 w-full h-full flex items-center justify-center">
                  {userInitial}
                </span>
              )}
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-1">
             Profile
          </h1>
        </div>
          <hr className="mb-8 border-gray-100" />
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <FaUserCircle className="w-5 h-5 text-indigo-500 mr-4 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500">Username</p>
              <p className="text-base font-semibold text-gray-800">{name || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <FaEnvelope className="w-5 h-5 text-indigo-500 mr-4 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500">Email Address</p>
              <p className="text-base font-semibold text-gray-800">{email || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-xl text-indigo-500 mr-2 flex-shrink-0">
              <IoIdCard className="w-6 h-6 text-indigo-600 mr-4 flex-shrink-0" />
            </span>
            <div className='flex-grow'>
              <p className="text-xs font-medium text-gray-500">User ID</p>
              <p className="text-base font-semibold text-gray-800 break-all transition-all duration-300">{
                isIdVisible ? session.user.id || 'N/A'
              : '***********************'}</p>
            </div>
            <button onClick={()=>setIsIdVisible(prev => !prev)}
              aria-label={isIdVisible?'Hide Id': 'Show Id'}
              className='ml-4 p-2 text-sm font-semibold rounded-full text-blue-500 hover:bg-blue-200 transition duration-150 flex-shrink-0'>
              {isIdVisible ? 'Hide':'Show'}</button>
          </div>
          <div className="flex items-center p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/70 shadow-sm">
                        <FaCalendarAlt className="w-6 h-6 text-indigo-600 mr-4 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-gray-600">Join Date</p>
                            <p className="text-lg font-semibold text-gray-900">{memberSinceDate}</p>
                        </div>
                    </div>
        </div>
        <hr className="mt-8 mb-6 border-gray-100" />
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="mt-8 w-full flex items-center justify-center px-4 py-3 border border-transparent text-xl font-medium rounded-xl text-white bg-gradient-to-bl from-blue-400 to-purple-500 hover:bg-bluue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 shadow-md"
        >
          <FaSignOutAlt className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
}