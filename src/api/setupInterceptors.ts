import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { axiosPrivate } from './axiosInstance'
import authManager from './authManager'

let interceptorsSetup = false

export const setupAxiosInterceptors = () => {
  // Evita configurar múltiplas vezes
  if (interceptorsSetup) {
    console.log('🔐 [Interceptors] Already setup, skipping...')
    return
  }

  console.log('🔐 [Interceptors] Setting up global auth interceptors...')

  // Request interceptor - adiciona token automaticamente
  axiosPrivate.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      // Não intercepta requests marcados para skip
      if ((config as any).skipAuthInterceptor) {
        return config
      }

      const token = authManager.getAccessToken()
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error: AxiosError) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - gerencia 401 e refresh de token
  axiosPrivate.interceptors.response.use(
    (response: AxiosResponse) => {
      // Sucesso - apenas retorna
      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config

      // Verifica se é erro 401 e não é o endpoint de refresh
      if (
        error.response?.status === 401 &&
        originalRequest &&
        originalRequest.url !== '/auth/refresh-token' &&
        !(originalRequest as any).skipAuthInterceptor
      ) {
        console.log('🔐 [Interceptors] 401 detected, handling token refresh...')

        // Cria uma Promise que será resolvida quando o token for refreshed
        return new Promise((resolve, reject) => {
          // Adiciona à queue de requests pendentes
          const requestId = authManager.addPendingRequest(
            originalRequest,
            resolve,
            reject
          )

          // Se não está fazendo refresh, inicia o processo
          if (!authManager.isRefreshing()) {
            authManager.refreshToken().catch((refreshError) => {
              console.error('🔐 [Interceptors] Token refresh failed:', refreshError)
              // Se o refresh falhou, remove a request da queue e rejeita
              authManager.removePendingRequest(requestId)
              reject(refreshError)
            })
          }
          // Se já está fazendo refresh, a request fica na queue até terminar
        })
      }

      // Para outros erros, apenas rejeita
      return Promise.reject(error)
    }
  )

  interceptorsSetup = true
  console.log('✅ [Interceptors] Global auth interceptors setup complete')
}

// Função para resetar (útil para testes)
export const resetInterceptors = () => {
  axiosPrivate.interceptors.request.clear()
  axiosPrivate.interceptors.response.clear()
  interceptorsSetup = false
  console.log('🔄 [Interceptors] Interceptors reset')
}