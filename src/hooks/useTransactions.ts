import React, { Dispatch, SetStateAction, useCallback, useState, useRef } from 'react'
import { IOverview, IRow, ITransaction } from '../types/transactions.ts'
import { DateTime } from 'luxon'
import useAxiosPrivate from './useAxiosPrivate.tsx'
import { enhanceTransactionsWithMockData, EnhancedTransaction } from '../utils/mockTransactionEnhancer.ts'

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
    remaining: {
      total: 0,
      type: 'remaining',
      percentage: 0,
    },
  })
  const [balance, setBalance] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState<EnhancedTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [periodsSummary, setPeriodsSummary] = useState({
    today: { balance: 0 },
    thisWeek: { balance: 0 },
    thisMonth: { balance: 0 },
  })
  const axiosPrivate = useAxiosPrivate()
  const loadingRef = useRef<Record<string, boolean>>({})

  const handleGetRecentTransactions = useCallback(
    async (
      filter: 'before' | 'after' | 'both' = 'both',
      sort: string = 'updated_at',
      direction: 'asc' | 'desc' = 'desc',
      type: 'income' | 'outcome' | 'all' = 'all',
    ) => {
      const key = `recent-${filter}-${sort}-${direction}-${type}`;
      if (loadingRef.current[key]) return;
      
      loadingRef.current[key] = true;
      try {
        const response = await axiosPrivate.get(
          `/transactions/recent?filter=${filter}&sort=${sort}&direction=${direction.toUpperCase()}&type=${type}`,
        )

        const enhancedData = enhanceTransactionsWithMockData(response.data)
        setRecentTransactions(enhancedData)
      } catch (err) {
        console.log(err)
      } finally {
        loadingRef.current[key] = false;
      }
    },
    [axiosPrivate],
  )

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

  const handleGetPeriodsSummary = useCallback(async () => {
    try {
      const { data } = await axiosPrivate.get('/transactions/summary-periods')
      setPeriodsSummary(data)
    } catch (err) {
      console.log(err)
    }
  }, [axiosPrivate])

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

  const handleGetPreviewTransactions = useCallback(
    async (date = DateTime.now()) => {
      const startDate = date.minus({ days: 1 });
      const endDate = date.plus({ days: 1 });

      try {
        const { data } = await axiosPrivate.get(
          `/transactions/preview?startDate=${startDate}&endDate=${endDate}`,
        );

        setRows(data);
      } catch (err) {
        console.error('Erro ao buscar transações:', err);
      }
    },
    [axiosPrivate],
  );

  const handleCreateTransaction = useCallback(
    async (
      type: 'incomes' | 'outcomes',
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
      from?: string,
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
          type: type.substring(0, type.length - 1),
          shared_id: null,
          transaction_day: transactionDay,
        })

        const newDate = DateTime.fromISO(rows[3].date) as DateTime

        const promises = []

        if (from === 'dashboard') {
          promises.push(handleGetPreviewTransactions(newDate))
        } else {
          promises.push(handleGetTransactionsMonth(newDate))
        }

        if (newDate.month === currentMonth) {
          promises.push(handleGetChartCategories(newDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(newDate))
          promises.push(handleGetRecentTransactions())
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
      handleGetPreviewTransactions,
      handleGetRecentTransactions,
    ],
  )

  const handleCreateCompleteTransaction = useCallback(
    async (createTransaction: ITransaction, currentMonth: number) => {
      try {
        await axiosPrivate.post('/transactions/create', {
          type: createTransaction.type,
          description: createTransaction.description,
          price: createTransaction.price,
          category_id: createTransaction.category_id,
          transaction_day: createTransaction.transaction_day,
          shared_id: null,
          is_paid: createTransaction.is_paid,
          card_id: createTransaction.card_id,
        })

        const newDate = DateTime.fromISO(
          createTransaction.transaction_day,
        ) as DateTime

        const promises = []

        if (newDate.month === currentMonth) {
          promises.push(handleGetTransactionsMonth(newDate))
          promises.push(handleGetChartCategories(newDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(newDate))
          promises.push(handleGetRecentTransactions())

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
      handleGetRecentTransactions,
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
      from: string,
    ) => {
      try {
        await axiosPrivate.delete(`/transactions/delete/${id}`)

        const newDate = DateTime.fromISO(rows[3].date) as DateTime

        const promises = []

        if (from === 'dashboard') {
          promises.push(handleGetPreviewTransactions(newDate))
        } else {
          promises.push(handleGetTransactionsMonth(newDate))
        }

        if (newDate.month === currentMonth) {
          promises.push(handleGetChartCategories(newDate))
          promises.push(handleGetOverviewTransactions(newDate))
          promises.push(handleGetBalance())
          promises.push(handleGetRecentTransactions())
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
      handleGetPreviewTransactions,
      handleGetRecentTransactions,
    ],
  )

  const handleUpdateTransaction = useCallback(
    async (
      updateTransaction: ITransaction,
      currentMonth: number,
      setCurrentMonth: Dispatch<
        React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
      >,
      from: string,
    ) => {
      try {
        await axiosPrivate.put(
          `/transactions/update/${updateTransaction.id}`,
          updateTransaction,
        )

        const newDate = DateTime.fromISO(rows[3].date) as DateTime

        const promises = []

        if (from === 'dashboard') {
          promises.push(handleGetPreviewTransactions(newDate))
        } else {
          promises.push(handleGetTransactionsMonth(newDate))
        }

        if (newDate.month === currentMonth) {
          promises.push(handleGetChartCategories(newDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(newDate))
          promises.push(handleGetRecentTransactions())
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
      handleGetPreviewTransactions,
      handleGetRecentTransactions,
    ],
  )

  const handleDeleteMultipleTransactions = useCallback(
    async (
      ids: string[],
      currentMonth: number,
      setCurrentMonth: Dispatch<
        React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
      >,
      from: string,
    ) => {
      try {
        await axiosPrivate.delete('/transactions/delete-multiple', { data: { ids } })

        const newDate = DateTime.fromISO(rows[3].date) as DateTime

        const promises = []

        if (from === 'dashboard') {
          promises.push(handleGetPreviewTransactions(newDate))
        } else {
          promises.push(handleGetTransactionsMonth(newDate))
        }

        if (newDate.month === currentMonth) {
          promises.push(handleGetChartCategories(newDate))
          promises.push(handleGetOverviewTransactions(newDate))
          promises.push(handleGetBalance())
          promises.push(handleGetRecentTransactions())
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
      handleGetPreviewTransactions,
      handleGetRecentTransactions,
    ],
  )

  const handleCreateRecurringTransaction = useCallback(
    async (createTransaction: ITransaction, currentMonth: number) => {
      try {
        console.log('🎯 useTransactions - handleCreateRecurringTransaction called');
        console.log('🎯 useTransactions - Input transaction:', createTransaction);
        
        const payload = {
          description: createTransaction.description,
          price: createTransaction.price,
          category_id: createTransaction.category_id,
          type: createTransaction.type,
          shared_id: null,
          start_date: createTransaction.start_date || createTransaction.transaction_day,
          recurrence_pattern: createTransaction.recurrence_pattern,
          recurrence_interval: createTransaction.recurrence_interval || 1,
          end_date: createTransaction.end_date ? createTransaction.end_date.toISOString().split('T')[0] : undefined,
          card_id: createTransaction.card_id,
          is_paid: createTransaction.is_paid,
        }
        
        console.log('🎯 useTransactions - Final payload to send:', payload);
        console.log('🎯 useTransactions - Making POST to /transactions/recurring/create');
        
        const response = await axiosPrivate.post('/transactions/recurring/create', payload)
        console.log('🎯 useTransactions - Response:', response.data);

        const newDate = DateTime.fromISO(
          createTransaction.transaction_day,
        ) as DateTime

        const promises = []

        if (newDate.month === currentMonth) {
          promises.push(handleGetTransactionsMonth(newDate))
          promises.push(handleGetChartCategories(newDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(newDate))
          promises.push(handleGetRecentTransactions())

          await Promise.all(promises)
        }
      } catch (err) {
        console.error('Error creating recurring transaction:', err)
        if (err.response) {
          console.error('Response data:', err.response.data)
          console.error('Response status:', err.response.status)
        }
      }
    },
    [
      handleGetTransactionsMonth,
      handleGetChartCategories,
      handleGetBalance,
      handleGetOverviewTransactions,
      axiosPrivate,
      handleGetRecentTransactions,
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
    handleGetPreviewTransactions,
    handleCreateCompleteTransaction,
    handleCreateRecurringTransaction, // Add this line
    handleGetRecentTransactions,
    recentTransactions,
    handleDeleteMultipleTransactions,
    handleGetPeriodsSummary,
    periodsSummary,
    isLoading,
  }
}
