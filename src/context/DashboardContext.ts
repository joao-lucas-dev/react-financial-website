import { createContext, Dispatch, SetStateAction } from 'react'

import { ITransaction } from '../types/transactions'

interface IContext {
  transactions: ITransaction[]
  setTransactions: Dispatch<SetStateAction<ITransaction[]>>
}

const DashboardContext = createContext({} as IContext)

export default DashboardContext
