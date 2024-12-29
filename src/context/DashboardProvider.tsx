import React, { useState } from 'react'
import DashboardContext from './DashboardContext'
import { ITransaction } from '../types/transactions.ts'

export default function DashboardProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [transactions, setTransactions] = useState<ITransaction[]>([])

  return (
    <DashboardContext.Provider value={{ transactions, setTransactions }}>
      {children}
    </DashboardContext.Provider>
  )
}
