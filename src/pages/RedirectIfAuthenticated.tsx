import { Navigate, Outlet } from 'react-router-dom'
import useAuthContext from '../hooks/useAuthContext.tsx'
import useRefreshToken from '../hooks/useRefreshToken.ts'
import { useCallback, useEffect, useState } from 'react'

const RedirectIfAuthenticated = () => {
  const { accessToken, setAccessToken } = useAuthContext()
  const refresh = useRefreshToken()
  const [showPage, setShowPage] = useState(false)

  const fetchRefreshToken = useCallback(async () => {
    const accessTokenRefreshed = await refresh()

    setAccessToken(accessTokenRefreshed)
    setShowPage(true)
  }, [refresh, setAccessToken])

  useEffect(() => {
    if (!accessToken) {
      fetchRefreshToken()
    }
  }, [accessToken])

  return accessToken ? <Navigate to="/dashboard" /> : showPage && <Outlet />
}

export default RedirectIfAuthenticated
