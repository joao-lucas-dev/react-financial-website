import { createContext } from 'react'

interface IContext {
  accessToken: string | null
  setAccessToken: (token: string | null) => void
}

const AuthContext = createContext({} as IContext)

export default AuthContext
