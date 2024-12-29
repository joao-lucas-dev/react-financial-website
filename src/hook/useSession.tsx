'use client'

import { useState, useEffect } from 'react'

type AccessToken = string | null

export function useSession(): AccessToken {
  const [accessToken, setAccessToken] = useState<AccessToken>(null)

  useEffect(() => {
    const getAccessToken = (): AccessToken => {
      console.log(document)
      const cookies = document.cookie
        .split('; ')
        .reduce<Record<string, string>>((acc, cookie) => {
          const [key, value] = cookie.split('=')
          acc[key] = decodeURIComponent(value || '')
          return acc
        }, {})

      return cookies.accessToken || null
    }

    const token = getAccessToken()
    setAccessToken(token)
  }, [])

  return accessToken
}
