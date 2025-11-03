import React from 'react'
import Landing from '@/components/Landing'
import { Footer } from '@/components/Footer'


function page() {
  return (
    <div className='w-full'>
      <main className="w-[90%] m-auto">
      <Landing/>
    </main>
    <Footer />
    </div>
  )
}

export default page