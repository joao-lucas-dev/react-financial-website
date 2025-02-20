import { Navigate, Outlet } from 'react-router-dom'
import useAuthContext from '../hooks/useAuthContext.tsx'
import useRefreshToken from '../hooks/useRefreshToken.ts'
import { useCallback, useEffect } from 'react'

const ProtectPage = () => {
  const { accessToken, setAccessToken } = useAuthContext()
  const refresh = useRefreshToken()

  const fetchRefreshToken = useCallback(async () => {
    const accessTokenRefreshed = await refresh()

    setAccessToken(accessTokenRefreshed)
  }, [refresh, setAccessToken])

  useEffect(() => {
    if (!accessToken) {
      fetchRefreshToken()
    }
  }, [accessToken])

  return accessToken ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectPage
