import React, { useState, useEffect, useCallback } from 'react'
import AuthContext from './AuthContext'
import authManager from '../api/authManager'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  
  // Função que atualiza tanto o contexto quanto o authManager
  // Usa skipCallback para evitar loop infinito
  const updateAccessToken = useCallback((token: string | null) => {
    setAccessToken(token)
    authManager.setAccessToken(token, true) // skipCallback = true para evitar loop
  }, [])

  // Sincroniza o estado do contexto com o authManager na inicialização
  useEffect(() => {
    const managerToken = authManager.getAccessToken()
    if (managerToken !== accessToken) {
      setAccessToken(managerToken)
    }
    
    // Configura callback para atualizações do authManager
    // Este callback só atualiza o estado local, não chama o authManager de volta
    authManager.setTokenUpdateCallback(setAccessToken)
  }, [accessToken])

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken: updateAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}
