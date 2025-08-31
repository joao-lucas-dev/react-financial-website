import { AxiosRequestConfig } from 'axios'
import api, { axiosPrivate } from './axiosInstance'

interface PendingRequest {
  resolve: (value: any) => void
  reject: (error: any) => void
  config: AxiosRequestConfig
  requestId: string
}

interface AuthState {
  accessToken: string | null
  isRefreshing: boolean
  refreshPromise: Promise<string> | null
  pendingRequests: Map<string, PendingRequest>
  requestCounter: number
  onTokenUpdate?: (token: string | null) => void
}

class AuthManager {
  private state: AuthState = {
    accessToken: null,
    isRefreshing: false,
    refreshPromise: null,
    pendingRequests: new Map(),
    requestCounter: 0,
  }

  private generateRequestId(): string {
    return `req_${++this.state.requestCounter}_${Date.now()}`
  }



  setAccessToken(token: string | null, skipCallback = false) {
    this.state.accessToken = token
    
    if (this.state.onTokenUpdate && !skipCallback) {
      this.state.onTokenUpdate(token)
    }
  }

  getAccessToken(): string | null {
    return this.state.accessToken
  }

  setTokenUpdateCallback(callback: (token: string | null) => void) {
    this.state.onTokenUpdate = callback
  }



  private async performTokenRefresh(): Promise<string> {
    try {
      const { data } = await api.post(
        '/auth/refresh-token',
        {},
        { 
          withCredentials: true,
          // Evita interceptação circular
          skipAuthInterceptor: true
        } as any
      )

      if (!data?.accessToken) {
        throw new Error('No access token received from refresh endpoint')
      }

      this.setAccessToken(data.accessToken)
      
      return data.accessToken
    } catch (error) {
      this.setAccessToken(null)
      throw error
    }
  }

  async refreshToken(): Promise<string> {
    // Se já está fazendo refresh, aguarda a promise existente
    if (this.state.isRefreshing && this.state.refreshPromise) {
      return this.state.refreshPromise
    }

    this.state.isRefreshing = true
    this.state.refreshPromise = this.performTokenRefresh()

    try {
      const newToken = await this.state.refreshPromise
      await this.retryPendingRequests(newToken)
      return newToken
    } finally {
      this.state.isRefreshing = false
      this.state.refreshPromise = null
    }
  }

  private async retryPendingRequests(newToken: string) {
    const requests = Array.from(this.state.pendingRequests.values())
    this.state.pendingRequests.clear()

    const retryPromises = requests.map(async ({ resolve, reject, config }) => {
      try {
        // Atualiza o token na configuração
        if (!config.headers) {
          config.headers = {}
        }
        config.headers.Authorization = `Bearer ${newToken}`
        
        // Marca para evitar interceptação circular
        ;(config as any).skipAuthInterceptor = true
        
        // Faz a chamada novamente usando a instância axios apropriada
        const response = await axiosPrivate(config)
        resolve(response)
      } catch (error) {
        reject(error)
      }
    })

    await Promise.allSettled(retryPromises)
  }

  addPendingRequest(
    config: AxiosRequestConfig,
    resolve: (value: any) => void,
    reject: (error: any) => void
  ): string {
    const requestId = this.generateRequestId()
    
    this.state.pendingRequests.set(requestId, {
      resolve,
      reject,
      config,
      requestId
    })
    
    return requestId
  }

  removePendingRequest(requestId: string) {
    this.state.pendingRequests.delete(requestId)
  }

  isRefreshing(): boolean {
    return this.state.isRefreshing
  }

  getPendingRequestsCount(): number {
    return this.state.pendingRequests.size
  }

  clearPendingRequests() {
    this.state.pendingRequests.clear()
  }

  // Para debugging
  getState() {
    return {
      hasToken: !!this.state.accessToken,
      isRefreshing: this.state.isRefreshing,
      pendingRequestsCount: this.state.pendingRequests.size,
      requestCounter: this.state.requestCounter
    }
  }
}

// Instância singleton
export const authManager = new AuthManager()

export default authManager