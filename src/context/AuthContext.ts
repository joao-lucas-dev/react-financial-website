import { createContext, Dispatch, SetStateAction } from 'react'

interface IContext {
  accessToken: string | null
  setAccessToken: Dispatch<SetStateAction<string | null>>
}

const AuthContext = createContext({} as IContext)

export default AuthContext
