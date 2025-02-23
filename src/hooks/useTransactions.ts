import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { IOverview, IRow, ITransaction } from '../types/transactions.ts'
import { DateTime } from 'luxon'
import useAxiosPrivate from './useAxiosPrivate.tsx'

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
  const axiosPrivate = useAxiosPrivate()

  const handleGetBalance = useCallback(async () => {
    try {
      const date = DateTime.now()

      const { data } = await axiosPrivate.get(
        `/transactions/balance?date=${date}`,
      )

      setBalance(data.balance)
    } catch (err) {
      console.log(err)
    }
  }, [setBalance, axiosPrivate])

  const handleGetOverviewTransactions = useCallback(
    async (date = DateTime.now()) => {
      const startDate = date.startOf('month')
      const endDate = date.endOf('month')

      try {
        const { data } = await axiosPrivate.get(
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
    [axiosPrivate],
  )

  const handleGetTransactionsMonth = useCallback(
    async (date = DateTime.now()) => {
      const month = date.month
      const year = date.year

      try {
        const { data } = await axiosPrivate.get(
          `/transactions?month=${month}&year=${year}`,
        )

        setRows(data)
      } catch (err) {
        console.error('Erro ao buscar transações:', err)
      }
    },
    [axiosPrivate],
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
      currentMonth: number,
      setCurrentMonth: Dispatch<
        React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
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

        await axiosPrivate.post('/transactions/create', {
          description: 'Insira uma descrição',
          price: value.originalValue,
          category_id: type === 'incomes' ? 10 : 4,
          type:
            type === 'dailies' ? 'daily' : type.substring(0, type.length - 1),
          shared_id: null,
          transaction_day: transactionDay,
        })

        const newDate = DateTime.fromISO(rows[3].date) as DateTime

        const promises = [await handleGetTransactionsMonth(newDate)]

        if (newDate.month !== currentMonth) {
          promises.push(await handleGetChartCategories(newDate))
          promises.push(await handleGetBalance())
          promises.push(await handleGetOverviewTransactions(newDate))
          // @ts-expect-error TS2345
          setCurrentMonth(newDate.month)
        }

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
      handleGetChartCategories,
      handleGetOverviewTransactions,
      handleGetBalance,
      handleGetTransactionsMonth,
      axiosPrivate,
    ],
  )

  const handleCreateCompleteTransaction = useCallback(
    async (createTransaction: ITransaction, currentMonth: number) => {
      try {
        await axiosPrivate.post('/transactions/create', {
          description: createTransaction.description,
          price: createTransaction.price,
          category_id: createTransaction.category_id,
          type: createTransaction.type,
          shared_id: null,
          transaction_day: createTransaction.transaction_day,
        })

        const newDate = DateTime.fromJSDate(
          <Date>createTransaction.transaction_day,
        ) as DateTime

        const promises = []

        if (newDate.month === currentMonth) {
          promises.push(await handleGetTransactionsMonth(newDate))
          promises.push(await handleGetChartCategories(newDate))
          promises.push(await handleGetBalance())
          promises.push(await handleGetOverviewTransactions(newDate))

          await Promise.all(promises)
        }
      } catch (err) {
        console.log(err)
      }
    },
    [
      handleGetTransactionsMonth,
      handleGetChartCategories,
      handleGetBalance,
      handleGetOverviewTransactions,
      axiosPrivate,
    ],
  )

  const handleDeleteTransaction = useCallback(
    async (
      id?: string,
      // @ts-expect-error TS1016
      currentMonth: number,
      setCurrentMonth: Dispatch<
        React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
      >,
    ) => {
      try {
        await axiosPrivate.delete(`/transactions/delete/${id}`)

        const newDate = DateTime.fromISO(rows[3].date) as DateTime

        const promises = [await handleGetTransactionsMonth(newDate)]

        if (newDate.month !== currentMonth) {
          promises.push(await handleGetChartCategories(newDate))
          promises.push(await handleGetOverviewTransactions(newDate))
          promises.push(await handleGetBalance())
          // @ts-expect-error TS2345
          setCurrentMonth(newDate.month)
        }

        await Promise.all(promises)
      } catch (err) {
        console.log(err)
      }
    },
    [
      rows,
      handleGetChartCategories,
      handleGetOverviewTransactions,
      handleGetBalance,
      handleGetTransactionsMonth,
      axiosPrivate,
    ],
  )

  const handleUpdateTransaction = useCallback(
    async (
      updateTransaction: ITransaction,
      currentMonth: number,
      setCurrentMonth: Dispatch<
        React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
      >,
    ) => {
      try {
        await axiosPrivate.put(
          `/transactions/update/${updateTransaction.id}`,
          updateTransaction,
        )

        const newDate = DateTime.fromISO(rows[3].date) as DateTime

        const promises = [await handleGetTransactionsMonth(newDate)]

        if (newDate.month !== currentMonth) {
          promises.push(await handleGetChartCategories(newDate))
          promises.push(await handleGetBalance())
          promises.push(await handleGetOverviewTransactions(newDate))
          // @ts-expect-error TS2345
          setCurrentMonth(newDate.month)
        }

        await Promise.all(promises)
      } catch (err) {
        console.log(err)
      }
    },
    [
      rows,
      handleGetChartCategories,
      handleGetOverviewTransactions,
      handleGetBalance,
      handleGetTransactionsMonth,
      axiosPrivate,
    ],
  )

  return {
    rows,
    setRows,
    handleDeleteTransaction,
    handleCreateTransaction,
    handleUpdateTransaction,
    handleGetOverviewTransactions,
    overview,
    handleGetBalance,
    balance,
    handleGetTransactionsMonth,
    handleCreateCompleteTransaction,
  }
}
