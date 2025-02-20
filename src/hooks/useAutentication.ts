import { useCallback } from 'react'
import api from '../api/axiosInstance'
import useAuthContext from './useAuthContext.tsx'

export default function useAuthentication() {
  const { setAccessToken } = useAuthContext()

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data } = await api.post(
          '/auth/login',
          {
            email,
            password,
          },
          {
            withCredentials: true,
          },
        )

        setAccessToken(data.accessToken)
      } catch (err) {
        console.error('Erro ao fazer login:', err)
      }
    },
    [setAccessToken],
  )

  const logout = useCallback(async () => {
    try {
      await api.post(
        '/auth/logout',
        {},
        {
          withCredentials: true,
        },
      )

      setAccessToken(null)
    } catch (err) {
      console.error('Erro ao fazer login:', err)
    }
  }, [setAccessToken])

  return {
    login,
    logout,
  }
}
