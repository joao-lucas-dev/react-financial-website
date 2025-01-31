import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { IOverview, IRow, ITransaction } from '../types/transactions.ts'
import { DateTime } from 'luxon'
import api from '../api/axiosInstance.ts'

export default function useTransactions(
  handleGetChartCategories: (date?: DateTime) => Promise<void>,
) {
  const [rows, setRows] = useState<IRow[]>([])
  const [overview, setOverview] = useState<IOverview>({
    income: {
      total: 0,
      type: 'income',
      percentage: 0,
    },
    outcome: {
      total: 0,
      type: 'outcome',
      percentage: 0,
    },
    daily: {
      total: 0,
      type: 'daily',
      percentage: 0,
    },
  })
  const [balance, setBalance] = useState(0)

  const handleGetBalance = useCallback(async () => {
    try {
      const date = DateTime.now()

      const { data } = await api.get(`/transactions/balance?date=${date}`, {
        headers: {
          'Content-Type': 'application/json',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      })

      setBalance(data.balance)
    } catch (err) {
      console.log(err)
    }
  }, [setBalance])

  const handleGetOverviewTransactions = useCallback(
    async (date = DateTime.now()) => {
      const startDate = date.startOf('month')
      const endDate = date.endOf('month')

      try {
        const { data } = await api.get(
          `/transactions/overview?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        setOverview(data)
      } catch (err) {
        console.log(err)
      }
    },
    [setOverview],
  )

  const handleGetPreviewTransactions = useCallback(
    async (date = DateTime.now()) => {
      const startDate = date.minus({ days: 3 }).startOf('day')
      const endDate = date.plus({ days: 3 }).endOf('day')

      try {
        const { data } = await api.get(
          `/transactions/preview?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: {
              'Content-Type': 'application/json',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          },
        )
        setRows(data)
      } catch (err) {
        console.log(err)
      }
    },
    [setRows],
  )

  const handleCreateTransaction = useCallback(
    async (
      type: 'incomes' | 'outcomes' | 'dailies',
      row: IRow,
      value = {
        formattedValue: '',
        originalValue: 0,
      },
      setValue: Dispatch<
        SetStateAction<{ formattedValue: string; originalValue: number }>
      >,
    ) => {
      try {
        const now = DateTime.now()
        const transactionDay = DateTime.fromISO(row.date).set({
          hour: now.hour,
          minute: now.minute,
          second: now.second,
          millisecond: now.millisecond,
        })

        await api.post('/transactions/create', {
          description: 'Insira uma descrição',
          price: value.originalValue,
          category_id: type === 'incomes' ? 10 : 4,
          type:
            type === 'dailies' ? 'daily' : type.substring(0, type.length - 1),
          shared_id: null,
          transaction_day: transactionDay,
        })

        const newDate = DateTime.fromISO(rows[3].date) as DateTime

        const promises = [await handleGetPreviewTransactions(newDate)]

        promises.push(await handleGetChartCategories(newDate))
        promises.push(await handleGetOverviewTransactions(newDate))
        promises.push(await handleGetBalance())

        await Promise.all(promises)

        setValue({
          formattedValue: '',
          originalValue: 0,
        })
      } catch (err) {
        console.log(err)
      }
    },
    [
      rows,
      handleGetPreviewTransactions,
      handleGetChartCategories,
      handleGetOverviewTransactions,
      handleGetBalance,
    ],
  )

  const handleDeleteTransaction = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/transactions/delete/${id}`)

        const newDate = DateTime.fromISO(rows[3].date) as DateTime

        const promises = [await handleGetPreviewTransactions(newDate)]

        promises.push(await handleGetChartCategories(newDate))
        promises.push(await handleGetOverviewTransactions(newDate))
        promises.push(await handleGetBalance())

        await Promise.all(promises)
      } catch (err) {
        console.log(err)
      }
    },
    [
      rows,
      handleGetPreviewTransactions,
      handleGetChartCategories,
      handleGetOverviewTransactions,
      handleGetBalance,
    ],
  )

  const handleUpdateTransaction = useCallback(
    async (updateTransaction: ITransaction) => {
      try {
        await api.put(
          `/transactions/update/${updateTransaction.id}`,
          updateTransaction,
        )

        const newDate = DateTime.fromISO(rows[3].date) as DateTime

        const promises = [await handleGetPreviewTransactions(newDate)]

        promises.push(await handleGetChartCategories(newDate))
        promises.push(await handleGetOverviewTransactions(newDate))
        promises.push(await handleGetBalance())

        await Promise.all(promises)
      } catch (err) {
        console.log(err)
      }
    },
    [
      rows,
      handleGetPreviewTransactions,
      handleGetChartCategories,
      handleGetOverviewTransactions,
      handleGetBalance,
    ],
  )

  return {
    rows,
    setRows,
    handleGetPreviewTransactions,
    handleDeleteTransaction,
    handleCreateTransaction,
    handleUpdateTransaction,
    handleGetOverviewTransactions,
    overview,
    handleGetBalance,
    balance,
  }
}
