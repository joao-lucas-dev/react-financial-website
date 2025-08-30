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

  private log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const prefix = `🔐 [AuthManager]`
    const logFn = console[level] || console.log
    
    if (data) {
      logFn(`${prefix} ${message}`, data)
    } else {
      logFn(`${prefix} ${message}`)
    }
  }

  setAccessToken(token: string | null) {
    this.state.accessToken = token
    this.log('info', `Token updated: ${token ? 'SET' : 'CLEARED'}`)
    
    if (this.state.onTokenUpdate) {
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
    this.log('info', 'Starting token refresh process')
    
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
      this.log('info', '✅ Token refresh successful')
      
      return data.accessToken
    } catch (error) {
      this.log('error', '❌ Token refresh failed', error)
      this.setAccessToken(null)
      throw error
    }
  }

  async refreshToken(): Promise<string> {
    // Se já está fazendo refresh, aguarda a promise existente
    if (this.state.isRefreshing && this.state.refreshPromise) {
      this.log('info', 'Waiting for ongoing refresh...')
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
    const pendingCount = this.state.pendingRequests.size
    this.log('info', `🔄 Retrying ${pendingCount} pending requests with new token`)

    const requests = Array.from(this.state.pendingRequests.values())
    this.state.pendingRequests.clear()

    const retryPromises = requests.map(async ({ resolve, reject, config, requestId }) => {
      try {
        // Atualiza o token na configuração
        if (!config.headers) {
          config.headers = {}
        }
        config.headers.Authorization = `Bearer ${newToken}`
        
        // Marca para evitar interceptação circular
        ;(config as any).skipAuthInterceptor = true
        
        this.log('info', `↻ Retrying request ${requestId}`)
        
        // Faz a chamada novamente usando a instância axios apropriada
        const response = await axiosPrivate(config)
        resolve(response)
        
        this.log('info', `✅ Request ${requestId} retry successful`)
      } catch (error) {
        this.log('error', `❌ Request ${requestId} retry failed`, error)
        reject(error)
      }
    })

    await Promise.allSettled(retryPromises)
    this.log('info', `🏁 Finished retrying all pending requests`)
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
    
    this.log('info', `📥 Added pending request ${requestId} (queue: ${this.state.pendingRequests.size})`)
    
    return requestId
  }

  removePendingRequest(requestId: string) {
    const removed = this.state.pendingRequests.delete(requestId)
    if (removed) {
      this.log('info', `📤 Removed pending request ${requestId}`)
    }
  }

  isRefreshing(): boolean {
    return this.state.isRefreshing
  }

  getPendingRequestsCount(): number {
    return this.state.pendingRequests.size
  }

  clearPendingRequests() {
    const count = this.state.pendingRequests.size
    this.state.pendingRequests.clear()
    this.log('warn', `🧹 Cleared ${count} pending requests`)
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