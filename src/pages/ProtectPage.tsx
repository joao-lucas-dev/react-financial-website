import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthContext from '../hooks/useAuthContext.tsx'
import useRefreshToken from '../hooks/useRefreshToken.ts'
import { useCallback, useEffect, useState } from 'react'

const ProtectPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { accessToken, setAccessToken } = useAuthContext()
  const refresh = useRefreshToken()
  const location = useLocation()

  const currentPath = location.pathname

  const fetchRefreshToken = useCallback(async () => {
    try {
      const accessTokenRefreshed = await refresh()
      setAccessToken(accessTokenRefreshed)
      setIsLoading(false)
    } catch {
      setIsLoading(false)
    }
  }, [refresh, setAccessToken])

  useEffect(() => {
    if (!accessToken) {
      fetchRefreshToken()
    } else {
      setIsLoading(false)
    }
  }, [accessToken, fetchRefreshToken])

  if (!accessToken && !isLoading) {
    return <Navigate to="/login" state={{ from: currentPath }} replace />
  }

  if (accessToken && !isLoading && currentPath === '/login') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default ProtectPage
