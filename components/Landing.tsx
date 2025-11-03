'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link';
import {  FiZap } from 'react-icons/fi';
import { Footer } from './Footer';
//import { FiMessageCircle, FiZap, FiShield, FiUsers, FiGlobe, FiCheck } from 'react-icons/fi';

function Landing() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:p-6 lg:px-8 py-20 lg:py-28 ">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left z-10">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full rounded-tr-none mb-6">
                <FiZap className="text-blue-600 mr-2" />
                <span className="text-sm font-semibold text-blue-900">
                  {" "}
                  Linq: All-time messaging
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6 ">
                Connect{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Instantly.
                </span>
                <br />
                Chat{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Seamlessly.
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed ">
                Experience real-time, secure messaging with people across the
                globe. Connect with friends, family, and colleagues instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start ">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center group"
                >
                  Get Started Free
                </Link>
              </div>
              <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start flex-wrap">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">2+</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">15</p>
                  <p className="text-sm text-gray-600">Messages Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">90%</p>
                  <p className="text-sm text-gray-600">Uptime</p>
                </div>
              </div>
            </div>
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-4 transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src="/image.png"
                    alt="Chat Interface"
                    width={600}
                    height={700}
                    className="rounded-2xl object-cover"
                  />
                  <div className="absolute -left-4 top-20  bg-white text-black px-4 py-2 rounded-2xl rounded-bl-none shadow-lg animate-float">
                    <p className="text-sm">Hey there! 👋</p>
                  </div>
                  
                  <div className="absolute -right-4 top-40 bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-tr-none shadow-lg animate-float animation-delay-2000">
                    <p className="text-sm text-gray-900">How are you?</p>
                  </div>
                </div>
                {/*<div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse animation-delay-2000"></div>*/}
              </div>
            </div>
          </div>
        </div>
      </section>
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default Landing
