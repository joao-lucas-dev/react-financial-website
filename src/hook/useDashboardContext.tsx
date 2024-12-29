import { useContext } from 'react'
import DashboardContext from '../context/DashboardContext'

export default function useDashboardContext() {
  const context = useContext(DashboardContext)

  if (context === undefined) {
    throw new Error('You not allowed to use this context')
  }

  return context
}
