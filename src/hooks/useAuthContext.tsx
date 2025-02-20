import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

export default function useAuthContext() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('You not allowed to use this context')
  }

  return context
}
