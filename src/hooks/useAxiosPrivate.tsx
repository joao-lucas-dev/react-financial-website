import { axiosPrivate } from '../api/axiosInstance'
import { useEffect } from 'react'
import useAuthContext from './useAuthContext'
import authManager from '../api/authManager'
import { setupAxiosInterceptors } from '../api/setupInterceptors'

const useAxiosPrivate = () => {
  const { accessToken, setAccessToken } = useAuthContext()

  useEffect(() => {
    // Configura os interceptors globais (apenas uma vez)
    setupAxiosInterceptors()
    
    // Configura callback para sincronização do token no contexto
    authManager.setTokenUpdateCallback(setAccessToken)
    
    // Sincroniza o token atual com o authManager
    if (accessToken !== authManager.getAccessToken()) {
      authManager.setAccessToken(accessToken)
    }
  }, [accessToken, setAccessToken])

  return axiosPrivate
}

export default useAxiosPrivate
