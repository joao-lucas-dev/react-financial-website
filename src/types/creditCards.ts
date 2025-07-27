export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard'
export type CardType = 'credit' | 'debit' | 'prepaid'
export type CardNetwork = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard'

export interface CreditCard {
  id: string
  name: string
  maskedNumber: string // Format: "•••• •••• •••• 1234"
  brand: CardBrand
  network: CardNetwork
  type: CardType
  balance: number
  creditLimit?: number
  expiryMonth: string // Format: "12"
  expiryYear: string   // Format: "28"
  holderName: string
  isActive: boolean
  gradientFrom: string  // Tailwind color class
  gradientTo: string    // Tailwind color class
  accentColor: string   // Tailwind color class for text/icons
}

export interface CreditCardMockData {
  cards: CreditCard[]
  totalBalance: number
  totalLimit: number
}

// Mock data for development
export const mockCreditCards: CreditCard[] = [
  {
    id: '1',
    name: 'Cartão Principal',
    maskedNumber: '•••• •••• •••• 7707',
    brand: 'elo',
    network: 'elo',
    type: 'credit',
    balance: 8500.00,
    creditLimit: 15000.00,
    expiryMonth: '12',
    expiryYear: '28',
    holderName: 'João Silva',
    isActive: true,
    gradientFrom: 'from-red-500',
    gradientTo: 'to-pink-600',
    accentColor: 'text-white'
  },
  {
    id: '2',
    name: 'Cartão Premium',
    maskedNumber: '•••• •••• •••• 4532',
    brand: 'visa',
    network: 'visa',
    type: 'credit',
    balance: 12300.00,
    creditLimit: 25000.00,
    expiryMonth: '09',
    expiryYear: '29',
    holderName: 'João Silva',
    isActive: true,
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-purple-800',
    accentColor: 'text-purple-100'
  },
  {
    id: '3',
    name: 'Cartão Black',
    maskedNumber: '•••• •••• •••• 8923',
    brand: 'mastercard',
    network: 'mastercard',
    type: 'credit',
    balance: 25800.00,
    creditLimit: 50000.00,
    expiryMonth: '03',
    expiryYear: '30',
    holderName: 'João Silva',
    isActive: true,
    gradientFrom: 'from-zinc-800',
    gradientTo: 'to-zinc-900',
    accentColor: 'text-zinc-100'
  }
]

export const mockCreditCardData: CreditCardMockData = {
  cards: mockCreditCards,
  totalBalance: mockCreditCards.reduce((sum, card) => sum + card.balance, 0),
  totalLimit: mockCreditCards.reduce((sum, card) => sum + (card.creditLimit || 0), 0)
}