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
      forceRefresh: boolean = false,
    ) => {
      const key = `recent-${filter}-${sort}-${direction}-${type}`;
      
      // Se forceRefresh é true, limpa o cache antes de verificar
      if (forceRefresh) {
        loadingRef.current[key] = false;
      }
      
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

        const promises = []

        if (from === 'dashboard') {
          // Para dashboard, sempre recarregue tudo com data atual
          const currentDate = DateTime.now()
          promises.push(handleGetPreviewTransactions(currentDate))
          promises.push(handleGetChartCategories(currentDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(currentDate))
          promises.push(handleGetRecentTransactions())
          promises.push(handleGetPeriodsSummary())
        } else {
          // Para outras páginas, use a lógica original
          const newDate = DateTime.fromISO(rows[3]?.date || DateTime.now().toISODate()) as DateTime
          promises.push(handleGetTransactionsMonth(newDate))
          
          if (newDate.month === currentMonth) {
            promises.push(handleGetChartCategories(newDate))
            promises.push(handleGetBalance())
            promises.push(handleGetOverviewTransactions(newDate))
            promises.push(handleGetRecentTransactions())
            promises.push(handleGetPeriodsSummary())
            // @ts-expect-error TS2345
            setCurrentMonth(newDate.month)
          }
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
      handleGetPeriodsSummary,
    ],
  )

  const handleCreateInstallmentTransaction = useCallback(
    async (createTransaction: ITransaction, currentMonth: number, setCurrentMonth?: any, from: string = 'transactions') => {
      try {
        await axiosPrivate.post('/transactions/create', {
          type: createTransaction.type,
          description: createTransaction.description,
          price: createTransaction.price,
          category_id: createTransaction.category_id,
          transaction_day: createTransaction.transaction_day,
          shared_id: null,
          installments: createTransaction.installments,
          is_paid: createTransaction.is_paid,
          card_id: createTransaction.card_id,
        })

        const promises = []

        if (from === 'dashboard') {
          // Para dashboard, sempre recarregue tudo com data atual
          const currentDate = DateTime.now()
          promises.push(handleGetPreviewTransactions(currentDate))
          promises.push(handleGetChartCategories(currentDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(currentDate))
          promises.push(handleGetRecentTransactions('both', 'updated_at', 'desc', 'all', true))
          promises.push(handleGetPeriodsSummary())
        } else {
          // Para outras páginas, use a lógica original
          const newDate = DateTime.fromISO(createTransaction.transaction_day) as DateTime
          
          if (newDate.month === currentMonth) {
            promises.push(handleGetTransactionsMonth(newDate))
            promises.push(handleGetChartCategories(newDate))
            promises.push(handleGetBalance())
            promises.push(handleGetOverviewTransactions(newDate))
            promises.push(handleGetRecentTransactions('both', 'updated_at', 'desc', 'all', true))
            promises.push(handleGetPeriodsSummary())
          }
        }

        await Promise.all(promises)
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
      handleGetPeriodsSummary,
    ],
  )

  const handleCreateCompleteTransaction = useCallback(
    async (createTransaction: ITransaction, currentMonth: number, setCurrentMonth?: any, from: string = 'transactions') => {
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

        const promises = []

        if (from === 'dashboard') {
          // Para dashboard, sempre recarregue tudo com data atual
          const currentDate = DateTime.now()
          promises.push(handleGetPreviewTransactions(currentDate))
          promises.push(handleGetChartCategories(currentDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(currentDate))
          promises.push(handleGetRecentTransactions('both', 'updated_at', 'desc', 'all', true))
          promises.push(handleGetPeriodsSummary())
        } else {
          // Para outras páginas, use a lógica original
          const newDate = DateTime.fromISO(createTransaction.transaction_day) as DateTime
          
          if (newDate.month === currentMonth) {
            promises.push(handleGetTransactionsMonth(newDate))
            promises.push(handleGetChartCategories(newDate))
            promises.push(handleGetBalance())
            promises.push(handleGetOverviewTransactions(newDate))
            promises.push(handleGetRecentTransactions('both', 'updated_at', 'desc', 'all', true))
            promises.push(handleGetPeriodsSummary())
          }
        }

        await Promise.all(promises)
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
      handleGetPeriodsSummary,
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

        const promises = []

        if (from === 'dashboard') {
          // Para dashboard, sempre recarregue tudo com data atual
          const currentDate = DateTime.now()
          promises.push(handleGetPreviewTransactions(currentDate))
          promises.push(handleGetChartCategories(currentDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(currentDate))
          promises.push(handleGetRecentTransactions())
          promises.push(handleGetPeriodsSummary())
        } else {
          // Para outras páginas, use a lógica original
          const newDate = DateTime.fromISO(rows[3]?.date || DateTime.now().toISODate()) as DateTime
          promises.push(handleGetTransactionsMonth(newDate))
          
          if (newDate.month === currentMonth) {
            promises.push(handleGetChartCategories(newDate))
            promises.push(handleGetOverviewTransactions(newDate))
            promises.push(handleGetBalance())
            promises.push(handleGetRecentTransactions())
            promises.push(handleGetPeriodsSummary())
            // @ts-expect-error TS2345
            setCurrentMonth(newDate.month)
          }
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
      handleGetPeriodsSummary,
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

        const promises = []

        if (from === 'dashboard') {
          // Para dashboard, sempre recarregue tudo com data atual
          const currentDate = DateTime.now()
          promises.push(handleGetPreviewTransactions(currentDate))
          promises.push(handleGetChartCategories(currentDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(currentDate))
          promises.push(handleGetRecentTransactions())
          promises.push(handleGetPeriodsSummary())
        } else {
          // Para outras páginas, use a lógica original
          const newDate = DateTime.fromISO(rows[3]?.date || DateTime.now().toISODate()) as DateTime
          promises.push(handleGetTransactionsMonth(newDate))
          
          if (newDate.month === currentMonth) {
            promises.push(handleGetChartCategories(newDate))
            promises.push(handleGetBalance())
            promises.push(handleGetOverviewTransactions(newDate))
            promises.push(handleGetRecentTransactions())
            promises.push(handleGetPeriodsSummary())
            // @ts-expect-error TS2345
            setCurrentMonth(newDate.month)
          }
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
      handleGetPeriodsSummary,
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

        const promises = []

        if (from === 'dashboard') {
          // Para dashboard, sempre recarregue tudo com data atual
          const currentDate = DateTime.now()
          promises.push(handleGetPreviewTransactions(currentDate))
          promises.push(handleGetChartCategories(currentDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(currentDate))
          promises.push(handleGetRecentTransactions())
          promises.push(handleGetPeriodsSummary())
        } else {
          // Para outras páginas, use a lógica original
          const newDate = DateTime.fromISO(rows[3]?.date || DateTime.now().toISODate()) as DateTime
          promises.push(handleGetTransactionsMonth(newDate))
          
          if (newDate.month === currentMonth) {
            promises.push(handleGetChartCategories(newDate))
            promises.push(handleGetOverviewTransactions(newDate))
            promises.push(handleGetBalance())
            promises.push(handleGetRecentTransactions())
            promises.push(handleGetPeriodsSummary())
            // @ts-expect-error TS2345
            setCurrentMonth(newDate.month)
          }
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
      handleGetPeriodsSummary,
    ],
  )

  const handleCreateRecurringTransaction = useCallback(
    async (createTransaction: ITransaction, currentMonth: number, setCurrentMonth?: any, from: string = 'transactions') => {
      try {
        
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
        
        const response = await axiosPrivate.post('/transactions/recurring/create', payload)

        const promises = []

        if (from === 'dashboard') {
          // Para dashboard, sempre recarregue tudo com data atual
          const currentDate = DateTime.now()
          promises.push(handleGetPreviewTransactions(currentDate))
          promises.push(handleGetChartCategories(currentDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(currentDate))
          promises.push(handleGetRecentTransactions('both', 'updated_at', 'desc', 'all', true))
          promises.push(handleGetPeriodsSummary())
        } else {
          // Para outras páginas, use a lógica original
          const transactionDay = typeof createTransaction.transaction_day === 'string' 
            ? createTransaction.transaction_day 
            : createTransaction.transaction_day.toISOString()
          const newDate = DateTime.fromISO(transactionDay) as DateTime
          
          // Para transações recorrentes, sempre atualizamos os dados, pois podem afetar multiple meses
          promises.push(handleGetTransactionsMonth(newDate))
          promises.push(handleGetChartCategories(newDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(newDate))
          promises.push(handleGetRecentTransactions('both', 'updated_at', 'desc', 'all', true))
          promises.push(handleGetPeriodsSummary())
          
          // Se a transação está em um mês diferente, também atualize o mês atual
          if (newDate.month !== currentMonth) {
            const currentDate = DateTime.now()
            promises.push(handleGetTransactionsMonth(currentDate))
            promises.push(handleGetChartCategories(currentDate))
            promises.push(handleGetOverviewTransactions(currentDate))
          }
        }

        await Promise.all(promises)
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
      handleGetPreviewTransactions,
      handleGetRecentTransactions,
      handleGetPeriodsSummary,
    ],
  )

  const handleUpdateRecurringTransaction = useCallback(
    async (
      updateTransaction: ITransaction,
      editMode: 'instance_only' | 'instance_and_future' | 'all_instances',
      currentMonth: number,
      setCurrentMonth: Dispatch<
        React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
      >,
      from: string,
    ) => {
      try {
        const payload = {
          ...updateTransaction,
          edit_mode: editMode,
        }

        await axiosPrivate.put(
          `/transactions/recurring/update/${updateTransaction.id}`,
          payload,
        )

        const promises = []

        if (from === 'dashboard') {
          // Para dashboard, sempre recarregue tudo com data atual
          const currentDate = DateTime.now()
          promises.push(handleGetPreviewTransactions(currentDate))
          promises.push(handleGetChartCategories(currentDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(currentDate))
          promises.push(handleGetRecentTransactions())
          promises.push(handleGetPeriodsSummary())
        } else {
          // Para outras páginas, use a lógica original
          const newDate = DateTime.fromISO(rows[3]?.date || DateTime.now().toISODate()) as DateTime
          promises.push(handleGetTransactionsMonth(newDate))
          
          if (newDate.month === currentMonth) {
            promises.push(handleGetChartCategories(newDate))
            promises.push(handleGetBalance())
            promises.push(handleGetOverviewTransactions(newDate))
            promises.push(handleGetRecentTransactions())
            promises.push(handleGetPeriodsSummary())
            // @ts-expect-error TS2345
            setCurrentMonth(newDate.month)
          }
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
      handleGetPeriodsSummary,
    ],
  )

  const handleDeleteRecurringTransaction = useCallback(
    async (
      id: string,
      editMode: 'instance_only' | 'instance_and_future' | 'all_instances',
      currentMonth: number,
      setCurrentMonth: Dispatch<
        React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
      >,
      from: string,
    ) => {
      try {
        await axiosPrivate.delete(`/transactions/recurring/delete/${id}`, {
          data: { edit_mode: editMode }
        })

        const promises = []

        if (from === 'dashboard') {
          // Para dashboard, sempre recarregue tudo com data atual
          const currentDate = DateTime.now()
          promises.push(handleGetPreviewTransactions(currentDate))
          promises.push(handleGetChartCategories(currentDate))
          promises.push(handleGetBalance())
          promises.push(handleGetOverviewTransactions(currentDate))
          promises.push(handleGetRecentTransactions())
          promises.push(handleGetPeriodsSummary())
        } else {
          // Para outras páginas, use a lógica original
          const newDate = DateTime.fromISO(rows[3]?.date || DateTime.now().toISODate()) as DateTime
          promises.push(handleGetTransactionsMonth(newDate))
          
          if (newDate.month === currentMonth) {
            promises.push(handleGetChartCategories(newDate))
            promises.push(handleGetOverviewTransactions(newDate))
            promises.push(handleGetBalance())
            promises.push(handleGetRecentTransactions())
            promises.push(handleGetPeriodsSummary())
            // @ts-expect-error TS2345
            setCurrentMonth(newDate.month)
          }
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
      handleGetPeriodsSummary,
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
    handleCreateInstallmentTransaction,
    handleCreateRecurringTransaction,
    handleUpdateRecurringTransaction,
    handleDeleteRecurringTransaction,
    handleGetRecentTransactions,
    recentTransactions,
    handleDeleteMultipleTransactions,
    handleGetPeriodsSummary,
    periodsSummary,
    isLoading,
  }
}
