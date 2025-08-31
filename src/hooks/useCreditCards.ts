import { useState, useCallback } from 'react'
import useAxiosPrivate from './useAxiosPrivate'
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

const useCreditCards = () => {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [summary, setSummary] = useState<CreditCardSummaryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const axiosPrivate = useAxiosPrivate()

  // Function to transform backend response to frontend format
  const transformCreditCard = (card: CreditCardResponse): CreditCard => {
    // Generate gradient colors based on brand or use backend-provided values
    const getCardColors = (brand: string, cardData: CreditCardResponse) => {
      // Use backend-provided colors if available
      if (cardData.gradient_from && cardData.gradient_to && cardData.accent_color) {
        return {
          gradientFrom: cardData.gradient_from,
          gradientTo: cardData.gradient_to,
          accentColor: cardData.accent_color
        }
      }

      // Fallback to default colors based on brand
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
      name: card.name, // Use real name from backend
      maskedNumber: `•••• •••• •••• ${card.last_four_numbers}`, // Format masked number
      brand: card.brand as any,
      network: card.brand as any,
      type: card.type as any,
      balance: 0, // No balance in backend, set to 0 for now
      creditLimit: card.credit_limit || 0,
      expiryMonth: card.expiry_month,
      expiryYear: card.expiry_year,
      holderName: 'Portador do Cartão', // Default holder name
      isActive: card.is_active,
      ...colors
    }
  }

  const fetchCreditCards = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axiosPrivate.get('/credit-cards')
      
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format: expected array')
      }
      
      const transformedCards = response.data.map(transformCreditCard)
      setCreditCards(transformedCards)
    } catch (err: any) {
      console.error('Error fetching credit cards:', err)
      setError(err.response?.data?.message || err.message || 'Erro ao carregar cartões de crédito')
      setCreditCards([])
    } finally {
      setIsLoading(false)
    }
  }, [axiosPrivate])

  const fetchCreditCardSummary = useCallback(async () => {
    try {
      const response = await axiosPrivate.get('/credit-cards/summary')
      setSummary(response.data)
    } catch (err: any) {
      console.error('Error fetching credit cards summary:', err)
      setSummary(null)
    }
  }, [axiosPrivate])

  const fetchCreditCardById = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axiosPrivate.get(`/credit-cards/${id}`)
      return transformCreditCard(response.data)
    } catch (err: any) {
      console.error('Error fetching credit card:', err)
      setError(err.response?.data?.message || 'Erro ao carregar cartão de crédito')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [axiosPrivate])

  const fetchCreditCardTransactions = useCallback(async (
    cardId: string,
    startDate?: string,
    endDate?: string,
    limit?: number,
    offset?: number
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (limit) params.append('limit', limit.toString())
      if (offset) params.append('offset', offset.toString())

      const response = await axiosPrivate.get(
        `/credit-cards/${cardId}/transactions?${params.toString()}`
      )
      return response.data
    } catch (err: any) {
      console.error('Error fetching credit card transactions:', err)
      setError(err.response?.data?.message || 'Erro ao carregar transações do cartão')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [axiosPrivate])

  return {
    creditCards,
    summary,
    isLoading,
    error,
    fetchCreditCards,
    fetchCreditCardSummary,
    fetchCreditCardById,
    fetchCreditCardTransactions,
    setCreditCards,
    setError
  }
}

export default useCreditCards