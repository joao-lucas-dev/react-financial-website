import React, { useState, useEffect } from 'react'
import AuthContext from './AuthContext'
import authManager from '../api/authManager'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  
  // Sincroniza o estado do contexto com o authManager na inicialização
  useEffect(() => {
    const managerToken = authManager.getAccessToken()
    if (managerToken !== accessToken) {
      setAccessToken(managerToken)
    }
    
    // Configura callback para atualizações do authManager
    authManager.setTokenUpdateCallback(setAccessToken)
  }, [])

  // Função que atualiza tanto o contexto quanto o authManager
  const updateAccessToken = (token: string | null) => {
    setAccessToken(token)
    authManager.setAccessToken(token)
  }

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken: updateAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}
