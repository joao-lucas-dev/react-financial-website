import authManager from '../api/authManager'

const useRefreshToken = () => {
  const refresh = async () => {
    try {
      const newToken = await authManager.refreshToken()
      return newToken
    } catch (error) {
      console.error('useRefreshToken: Refresh failed', error)
      return null
    }
  }

  return refresh
}

export default useRefreshToken
