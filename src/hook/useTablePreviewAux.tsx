import { useCallback } from 'react'

import { ITransaction } from '../types/transactions'
import useDashboardContext from './useDashboardContext'

export default function useTablePreview() {
  const { setTransactions } = useDashboardContext()

  const handleGetAllTransactions = useCallback(
    async (date = new Date()) => {
      const startDate = new Date(date.setDate(date.getDate() - 3))

      const endDate = new Date(date.setDate(date.getDate() + 6))

      try {
        const response = await fetch(
          `http://localhost:8080/transactions/preview?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
          {
            method: 'GET',
          },
        )
        const data = await response.json()
        setTransactions(data)
      } catch (err) {
        console.log(err)
      }
    },
    [setTransactions],
  )

  const findTotalColor = useCallback((item: ITransaction) => {
    const total = item.total.value

    if (total >= item.total.good_value) {
      return 'green'
    } else if (
      total < item.total.good_value &&
      total >= item.total.warn_value
    ) {
      return 'orange'
    } else {
      return 'red'
    }
  }, [])

  const handleDeleteTransaction = useCallback(
    async (id: string) => {
      try {
        await fetch(`http://localhost:8080/transactions/delete/${id}`, {
          method: 'DELETE',
        })

        await handleGetAllTransactions()
      } catch (err) {
        console.log(err)
      }
    },
    [handleGetAllTransactions],
  )

  return {
    handleGetAllTransactions,
    findTotalColor,
    handleDeleteTransaction,
  }
}
