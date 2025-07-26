import api, { axiosPrivate } from '../api/axiosInstance'
import { useEffect, useRef } from 'react'
import useAuthContext from './useAuthContext'

const useAxiosPrivate = () => {
  const { accessToken, setAccessToken } = useAuthContext()
  const interceptorsRef = useRef<{
    request?: number;
    response?: number;
  }>({})

  useEffect(() => {
    // Clear existing interceptors
    if (interceptorsRef.current.request !== undefined) {
      axiosPrivate.interceptors.request.eject(interceptorsRef.current.request)
    }
    if (interceptorsRef.current.response !== undefined) {
      axiosPrivate.interceptors.response.eject(interceptorsRef.current.response)
    }
    interceptorsRef.current.request = axiosPrivate.interceptors.request.use(
      (config: any) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
      },
      (error: any) => Promise.reject(error),
    )

    let isRefreshing = false
    let failedRequestsQueue: Array<{
      onSuccess: (token: string) => void
      onFailure: (error: any) => void
    }> = []

    interceptorsRef.current.response = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (
          error.response?.status === 401 &&
          error.response.uri !== '/auth/refresh-token'
        ) {
          if (!isRefreshing) {
            isRefreshing = true

            try {
              const { data } = await api.post(
                '/auth/refresh-token',
                {},
                {
                  withCredentials: true,
                },
              )

              setAccessToken(data.accessToken)
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

              failedRequestsQueue.forEach(({ onSuccess }) => {
                onSuccess(data.accessToken)
              })
            } catch (err: any) {
              failedRequestsQueue.forEach(({ onFailure }) => {
                onFailure(err)
              })
            } finally {
              isRefreshing = false
              failedRequestsQueue = []
            }
          }

          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (newAccessToken: string) => {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                resolve(api(originalRequest))
              },
              onFailure: reject,
            })
          })
        }

        return Promise.reject(error)
      },
    )

    return () => {
      if (interceptorsRef.current.request !== undefined) {
        axiosPrivate.interceptors.request.eject(interceptorsRef.current.request)
      }
      if (interceptorsRef.current.response !== undefined) {
        axiosPrivate.interceptors.response.eject(interceptorsRef.current.response)
      }
    }
  }, [accessToken, setAccessToken])

  return axiosPrivate
}

export default useAxiosPrivate
