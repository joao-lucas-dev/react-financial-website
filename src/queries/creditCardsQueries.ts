import { useQuery } from '@tanstack/react-query'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import { CreditCard } from '../types/creditCards'

interface CreditCardResponse {
  id: string
  user_id: string
  name: string
  last_four_numbers: string
  brand: string
  type: string
  credit_limit?: number
  expiry_month: string
  expiry_year: string
  is_active: boolean
  gradient_from?: string
  gradient_to?: string
  accent_color?: string
  created_at: string
  updated_at: string
}

interface CreditCardSummaryResponse {
  total_balance: number
  total_limit: number
  cards_count: number
  active_cards_count: number
}

export const CREDIT_CARDS_QUERY_KEYS = {
  creditCards: {
    list: () => ['credit-cards', 'list'],
    summary: () => ['credit-cards', 'summary'],
    detail: (id: string) => ['credit-cards', 'detail', id],
    transactions: (id: string, params?: Record<string, any>) => 
      ['credit-cards', 'transactions', id, params],
  }
} as const

// Transform backend response to frontend format
const transformCreditCard = (card: CreditCardResponse): CreditCard => {
  const getCardColors = (brand: string, cardData: CreditCardResponse) => {
    if (cardData.gradient_from && cardData.gradient_to && cardData.accent_color) {
      return {
        gradientFrom: cardData.gradient_from,
        gradientTo: cardData.gradient_to,
        accentColor: cardData.accent_color
      }
    }

    switch (brand.toLowerCase()) {
      case 'visa':
        return {
          gradientFrom: 'from-blue-500',
          gradientTo: 'to-blue-700',
          accentColor: 'text-white'
        }
      case 'mastercard':
        return {
          gradientFrom: 'from-red-500',
          gradientTo: 'to-orange-600',
          accentColor: 'text-white'
        }
      case 'elo':
        return {
          gradientFrom: 'from-yellow-500',
          gradientTo: 'to-red-600',
          accentColor: 'text-white'
        }
      case 'amex':
        return {
          gradientFrom: 'from-green-600',
          gradientTo: 'to-green-800',
          accentColor: 'text-white'
        }
      case 'hipercard':
        return {
          gradientFrom: 'from-red-600',
          gradientTo: 'to-red-800',
          accentColor: 'text-white'
        }
      default:
        return {
          gradientFrom: 'from-gray-600',
          gradientTo: 'to-gray-800',
          accentColor: 'text-white'
        }
    }
  }

  const colors = getCardColors(card.brand, card)

  return {
    id: card.id,
    name: card.name,
    maskedNumber: `•••• •••• •••• ${card.last_four_numbers}`,
    brand: card.brand as any,
    network: card.brand as any,
    type: card.type as any,
    balance: 0,
    creditLimit: card.credit_limit || 0,
    expiryMonth: card.expiry_month,
    expiryYear: card.expiry_year,
    holderName: 'Portador do Cartão',
    isActive: card.is_active,
    ...colors
  }
}

export const useCreditCards = () => {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: CREDIT_CARDS_QUERY_KEYS.creditCards.list(),
    queryFn: async () => {
      const response = await axiosPrivate.get<CreditCardResponse[]>('/credit-cards')
      
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format: expected array')
      }
      
      return response.data.map(transformCreditCard)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

export const useCreditCardSummary = () => {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: CREDIT_CARDS_QUERY_KEYS.creditCards.summary(),
    queryFn: async () => {
      const { data } = await axiosPrivate.get<CreditCardSummaryResponse>('/credit-cards/summary')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreditCardById = (id: string) => {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: CREDIT_CARDS_QUERY_KEYS.creditCards.detail(id),
    queryFn: async () => {
      const { data } = await axiosPrivate.get<CreditCardResponse>(`/credit-cards/${id}`)
      return transformCreditCard(data)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  })
}

export const useCreditCardTransactions = (
  cardId: string,
  params?: {
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }
) => {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: CREDIT_CARDS_QUERY_KEYS.creditCards.transactions(cardId, params),
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params?.startDate) searchParams.append('startDate', params.startDate)
      if (params?.endDate) searchParams.append('endDate', params.endDate)
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.offset) searchParams.append('offset', params.offset.toString())

      const { data } = await axiosPrivate.get(
        `/credit-cards/${cardId}/transactions?${searchParams.toString()}`
      )
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!cardId,
  })
}