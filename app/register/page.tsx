'use client'

import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError]= useState('')
    const router = useRouter()

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!name|| !email|| !password) {
            setError('Fill in all details.')
            return
        }
        try {
            const res = await fetch('api/register',{
                method:'POST',
                headers:{'Content-Type': 'application/json'},
                body: JSON.stringify({name,email,password})
            })
            if (res.ok) {
                const result= await signIn('credentials',{redirect:false, email,password,callbackUrl:'/chat',})
                if (result?.ok) {
                    router.push('/chat')
                } else {
                    setError('Registration successful, but sign-in failed. Please try signing in. ')
                }
            } else {
                const data = await res.text()
                setError(data|| 'Registration failed')
            }
        } catch (error) {
           setError('An error occurred during registration.') 
        }  
    }
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-100 p-4">
        <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-2xl overflow-hidden">
            <h1 className="text-center text-4xl mb-6 font-extrabold text-blue-800 font-serif">
          Linq
        </h1>
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 items-stretch">
        <div className="flex-1 lg:pr-8 lg:border-r lg:border-gray-200">
            <form onSubmit={handleSubmit} action="" className="space-y4">
              <div className="mb-2">
                <label className="block text-lg font-bold text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your name"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-700 text-black text-sm"
                />
              </div>
              <div className="mb-2">
                <label className="block text-lg font-bold text-gray-700">
                  Email
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-700 text-black text-sm"
                />
              </div>
              <div className="mb-2">
                <label className="block text-lg font-bold text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a strong password"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-700 text-black text-sm"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 mt-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-150 shadow-lg"
              >
                Sign Up
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{"  "}
                <a
                  className="text-blue-600 hover:underline cursor-pointer font-medium"
                >
                   <Link href="/signin">Sign In</Link>
                </a>
              </p>
            </div>
            </div>
          <div/>
          <div className="lg:hidden flex items-center justify-center my-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="px-4 text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center lg:pl-8 lg:items-stretch mt-8 lg:mt-0">
            <div className="flex flex-col space-y-4 w-full max-w-md lg:max-w-none">
                <button
              onClick={() => signIn("google", { redirect:true, callbackUrl: "/chat" })}
              className="flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white border border-gray-300 text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition duration-300"
            >
              <span className="mr-2 text-sm"><FcGoogle className="mr-3 text-2xl"/></span>
              Sign Up with Google
            </button>
            <button
              onClick={() => signIn("github", { redirect: true, callbackUrl: "/chat"})}
              className="flex items-center justify-center px-8 py-4 text-lg font-semibold bg-gray-800 text-white rounded-xl shadow-lg hover:bg-gray-900 transition duration-300"
            >
              <span className="mr-2 text-"><FaGithub className="mr-3 text-2xl"/></span>
              Sign Up with GitHub
            </button>
            </div>
             <p className="mt-6 text-xs text-gray-500 text-center leading-relaxed">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
        </div>
      </div>
    );
    
}