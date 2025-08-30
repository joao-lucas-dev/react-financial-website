import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import { IOverview, IRow, ITransaction } from '../types/transactions'
import { EnhancedTransaction, enhanceTransactionsWithMockData } from '../utils/mockTransactionEnhancer'

export const QUERY_KEYS = {
  transactions: {
    overview: (date: DateTime) => ['transactions', 'overview', date.toISODate()],
    balance: (date: DateTime) => ['transactions', 'balance', date.toISODate()],
    recent: (filter: string, sort: string, direction: string, type: string) => 
      ['transactions', 'recent', filter, sort, direction, type],
    preview: (date: DateTime) => ['transactions', 'preview', date.toISODate()],
    month: (date: DateTime) => ['transactions', 'month', date.year, date.month],
    periodsSummary: () => ['transactions', 'periods-summary'],
  }
} as const

export const useTransactionsOverview = (date: DateTime = DateTime.now()) => {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: QUERY_KEYS.transactions.overview(date),
    queryFn: async () => {
      const { data } = await axiosPrivate.get<IOverview>(
        `/transactions/overview?startDate=${date.startOf('month')}&endDate=${date.endOf('month')}`
      ) 
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useTransactionsBalance = (date: DateTime = DateTime.now()) => {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: QUERY_KEYS.transactions.balance(date),
    queryFn: async () => {
      const { data } = await axiosPrivate.get(`/transactions/balance?date=${date}`)
      return data.balance as number
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useRecentTransactions = (
  filter: 'before' | 'after' | 'both' = 'both',
  sort: string = 'updated_at',
  direction: 'asc' | 'desc' = 'desc',
  type: 'income' | 'outcome' | 'all' = 'all'
) => {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: QUERY_KEYS.transactions.recent(filter, sort, direction, type),
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/transactions/recent?filter=${filter}&sort=${sort}&direction=${direction.toUpperCase()}&type=${type}`
      )
      return enhanceTransactionsWithMockData(response.data) as EnhancedTransaction[]
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useTransactionsPreview = (date: DateTime = DateTime.now()) => {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: QUERY_KEYS.transactions.preview(date),
    queryFn: async () => {
      const startDate = date.minus({ days: 1 })
      const endDate = date.plus({ days: 1 })
      
      const { data } = await axiosPrivate.get<IRow[]>(
        `/transactions/preview?startDate=${startDate}&endDate=${endDate}`
      )
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useTransactionsMonth = (date: DateTime = DateTime.now()) => {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: QUERY_KEYS.transactions.month(date),
    queryFn: async () => {
      const month = date.month
      const year = date.year
      
      const { data } = await axiosPrivate.get<IRow[]>(
        `/transactions?month=${month}&year=${year}`
      )
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const usePeriodsSummary = () => {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: QUERY_KEYS.transactions.periodsSummary(),
    queryFn: async () => {
      const { data } = await axiosPrivate.get('/transactions/summary-periods')
      return data as {
        today: { balance: number }
        thisWeek: { balance: number }
        thisMonth: { balance: number }
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Mutation hooks
export const useCreateTransaction = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (transaction: Partial<ITransaction>) => {
      const { data } = await axiosPrivate.post('/transactions/create', transaction)
      return data
    },
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useCreateCompleteTransaction = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (transaction: ITransaction) => {
      const { data } = await axiosPrivate.post('/transactions/create', {
        type: transaction.type,
        description: transaction.description,
        price: transaction.price,
        category_id: transaction.category_id,
        transaction_day: transaction.transaction_day,
        shared_id: null,
        is_paid: transaction.is_paid,
        card_id: transaction.card_id,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useCreateInstallmentTransaction = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (transaction: ITransaction) => {
      const { data } = await axiosPrivate.post('/transactions/create', {
        type: transaction.type,
        description: transaction.description,
        price: transaction.price,
        category_id: transaction.category_id,
        transaction_day: transaction.transaction_day,
        shared_id: null,
        installments: transaction.installments,
        is_paid: transaction.is_paid,
        card_id: transaction.card_id,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useCreateRecurringTransaction = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (transaction: ITransaction) => {
      const payload = {
        description: transaction.description,
        price: transaction.price,
        category_id: transaction.category_id,
        type: transaction.type,
        shared_id: null,
        start_date: transaction.start_date || transaction.transaction_day,
        recurrence_pattern: transaction.recurrence_pattern,
        recurrence_interval: transaction.recurrence_interval || 1,
        end_date: transaction.end_date ? 
          (typeof transaction.end_date === 'string' ? transaction.end_date : transaction.end_date.toISOString().split('T')[0]) 
          : undefined,
        card_id: transaction.card_id,
        is_paid: transaction.is_paid,
      }
      
      const { data } = await axiosPrivate.post('/transactions/recurring/create', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useUpdateTransaction = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (transaction: ITransaction) => {
      const { data } = await axiosPrivate.put(
        `/transactions/update/${transaction.id}`,
        transaction
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useDeleteTransaction = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosPrivate.delete(`/transactions/delete/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useDeleteMultipleTransactions = () => {
  const axiosPrivate = useAxiosPrivate()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await axiosPrivate.delete('/transactions/delete-multiple', { 
        data: { ids } 
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}