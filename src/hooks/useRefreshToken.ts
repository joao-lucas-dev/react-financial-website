import axios from '../api/axiosInstance.ts'
import useAuthContext from './useAuthContext.tsx'

const useRefreshToken = () => {
  const { setAccessToken } = useAuthContext()

  const refresh = async () => {
    try {
      const response = await axios.post(
        '/auth/refresh-token',
        {},
        {
          withCredentials: true,
        },
      )
      setAccessToken((prev: any) => {
        return { ...prev, accessToken: response.data.accessToken }
      })
      return response.data.accessToken
    } catch {
      return null
    }
  }

  return refresh
}

export default useRefreshToken
