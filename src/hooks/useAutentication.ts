import { useCallback } from 'react'
import Cookies from 'js-cookie'
import { decodeJwt } from 'jose'
import api from '../api/axiosInstance'

export default function useAuthentication() {
  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', {
        email,
        password,
      })

      const { accessToken } = data

      Cookies.set('accessToken', accessToken)
    } catch (err) {
      console.error('Erro ao fazer login:', err)
    }
  }, [])

  const getUserSession = useCallback(() => {
    const accessToken = Cookies.get('access_token')
    if (accessToken) return decodeJwt(accessToken)

    return null
  }, [])

  return {
    login,
    getUserSession,
  }
}
