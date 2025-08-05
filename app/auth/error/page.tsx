import { ErrorCard } from '@/components/auth/error-card'
import React from 'react'

const AuthErrorPage = () => {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex justify-center items-center my-[50px] md:my-0">
      <ErrorCard/>
    </div>
  )
}

export default AuthErrorPage
