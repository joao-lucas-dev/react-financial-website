import React, { useState } from 'react'
import AuthContext from './AuthContext'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [accessToken, setAccessToken] = useState<string | null>(null)

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}
