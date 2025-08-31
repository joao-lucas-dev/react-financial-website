import { axiosPrivate } from '../api/axiosInstance'
import { useEffect } from 'react'
import useAuthContext from './useAuthContext'
import authManager from '../api/authManager'
import { setupAxiosInterceptors } from '../api/setupInterceptors'

const useAxiosPrivate = () => {
  const { accessToken } = useAuthContext()

  useEffect(() => {
    // Configura os interceptors globais (apenas uma vez)
    setupAxiosInterceptors()
    
    // Sincroniza o token atual com o authManager se necessário
    // O callback já foi configurado no AuthProvider, não precisamos duplicar aqui
    if (accessToken !== authManager.getAccessToken()) {
      authManager.setAccessToken(accessToken, true) // skipCallback = true para evitar loop
    }
  }, [accessToken])

  return axiosPrivate
}

export default useAxiosPrivate
