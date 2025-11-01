'use client'

import Link from "next/link"
import Image from "next/image"
import { useSession,signOut } from "next-auth/react"
import React, { useEffect } from 'react'
import { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import {FaUserAlt } from 'react-icons/fa';
import { IoIosChatboxes } from "react-icons/io";


function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {status} = useSession();


  const isAuthenticated = status === 'authenticated';
  const isUnauthenticated = status === 'unauthenticated';
  
  const handleSignOut=()=>{
    signOut({callbackUrl:'/'})
    setMobileMenuOpen(false);
  }

  useEffect(()=>{
    const handleResize=()=>{
      if(window.innerWidth >= 768 && mobileMenuOpen){
        setMobileMenuOpen(false)
      }
    };
    window.addEventListener('resize', handleResize)
    return()=>window.removeEventListener('resize', handleResize);
  },[mobileMenuOpen]);

  const AuthLinks = (
    <>
      
      <Link href="/chats" className="px-3 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 hover:text-blue-600 transition flex items-center space-x-2">
        <IoIosChatboxes className="w-5 h-5" />
        <span className="hidden sm:inline"></span>
      </Link>
      <Link href="/profile" className="px-3 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 hover:text-blue-600 transition flex items-center space-x-2">
        <FaUserAlt className="w-5 h-5" />
        <span className="hidden sm:inline"></span>
      </Link>
      <button 
        onClick={handleSignOut}
        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-red-600 active:scale-95 transition shadow-sm hover:shadow-md ml-2"
      >
        Sign Out
      </button>
    </>
  );

  const UnauthLinks = (
    <>
     <Link href="/register" className="px-4 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 hover:text-blue-600 transition">Sign Up</Link>
    <Link href="/signin" className="px-4 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 hover:text-blue-600 transition">Sign In</Link>
          {/*<button onClick={() => signIn(undefined, { callbackUrl: '/chat' })}
              className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-white hover:text-blue-800  active:scale-95 transition shadow-sm hover:shadow-md">
              <Link href="/signin">Sign In</Link>
        </button>*/}
    </>
  );

  return (
    <header className="bg-blue-300 sticky top-0 z-50 shadow-md rounded-md rounded-t-none border-b border-gray-200 bg-gradient-to-tr from-blue-400 to-purple-400">
      <nav className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
        <Link href="/" className="flex items-center space-x-2 group" > 
          <Image src="/logorb.png" alt="Icon" className="h-20 w-20 object-contain transition-transform group-hover:scale-110" width={50} height={50}/>
          <span className="text-xl font-bold group-hover:text-blue-700 transition font-serif bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Linq</span>
        </Link> 
        <div className="hidden md:flex items-center space-x-1">
         {isAuthenticated && AuthLinks}
         {isUnauthenticated && UnauthLinks }
        </div>
        <button onClick={()=> setMobileMenuOpen(!mobileMenuOpen)}
         className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition flex items-center justify-center" aria-label="Toggle menu">
          {mobileMenuOpen?(<HiX className="w-6 h-6"/>):(<HiMenu className="w-6 h-6"/>)}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden py-4 border-t border-gray-200 space-y-2 flex flex-col items-stretch">
         {isAuthenticated && (
              <>
                <Link href='/profile' onClick={()=>setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 hover:text-blue-600 transition text-center border">
                Profile
                </Link>
                <Link href='/chats' onClick={()=>setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 hover:text-blue-600 transition text-center border">
                Chat
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-red-600 transition text-center"
                >
                  Sign Out
                </button>
              </>
            )}

            {isUnauthenticated && (
              <>
                <Link href='/register' onClick={()=>setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 hover:text-blue-600 transition text-center border">
                  Sign Up
                </Link>
                <Link href="/signin" onClick={()=>setMobileMenuOpen(false)} className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-center">
                    Sign In
                </Link>
              </>
            )}
        </div>
      )}
      </nav>
    </header>
  )
}

export default Navbar