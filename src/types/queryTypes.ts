import { DateTime } from 'luxon'
import { ITransaction } from './transactions'

// Handler types for backward compatibility
export type IHandleDeleteTransaction = (id?: string, currentMonth?: number, setCurrentMonth?: any, from?: string) => Promise<void>
export type ISetCurrentMonth = (value: number | ((prevState: number) => number)) => void | Promise<void>
export type IHandleCreateTransaction = (
  type: 'incomes' | 'outcomes',
  row: any,
  value: any,
  setValue: any,
  currentMonth: number,
  setCurrentMonth: any,
  from?: string,
) => Promise<void>

export type IOpenModal = {
  isOpen: boolean
  transaction: any
  type: string
}

// Query result types with fallbacks
export interface IDashboardData {
  overview?: {
    income: { total: number; type: 'income'; percentage?: number; status?: 'positive' | 'negative' | 'zero' }
    outcome: { total: number; type: 'outcome'; percentage?: number; status?: 'positive' | 'negative' | 'zero' }
    remaining: { total: number; type: 'remaining'; percentage?: number; status?: 'positive' | 'negative' | 'zero' }
  }
  balance?: number
  periodsSummary?: {
    today: { balance: number }
    thisWeek: { balance: number }
    thisMonth: { balance: number }
  }
  chartCategories?: {
    notIncome: {
      config: any[]
      total: number
      chartConfig: {
        labels: string[]
        datasets: any[]
      }
    }
    income: {
      config: any[]
      total: number
      chartConfig: {
        labels: string[]
        datasets: any[]
      }
    }
  }
}
