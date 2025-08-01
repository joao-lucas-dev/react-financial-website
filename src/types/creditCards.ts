export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard'
export type CardType = 'credit' | 'debit' | 'prepaid'
export type CardNetwork = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard'

export interface ICreditCard {
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

// Mock data de transações de cartão de crédito para desenvolvimento
export const mockCreditCardTransactions = [
  // Transações do Cartão Principal (id: '1')
  {
    id: 'cc-1-001',
    card_id: '1',
    category_id: 'food',
    description: 'Supermercado Extra',
    price: 285.90,
    category: { id: 'food', name: 'Alimentação', color: '#FF9800', icon: '🍽️' },
    transaction_day: '2024-01-25',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    created_at: '2024-01-25T10:30:00Z'
  },
  {
    id: 'cc-1-002',
    card_id: '1',
    category_id: 'transport',
    description: 'Uber - Centro',
    price: 28.50,
    category: { id: 'transport', name: 'Transporte', color: '#2196F3', icon: '🚗' },
    transaction_day: '2024-01-24',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    created_at: '2024-01-24T15:45:00Z'
  },
  {
    id: 'cc-1-003',
    card_id: '1',
    category_id: 'shopping',
    description: 'Amazon - Livros',
    price: 89.90,
    category: { id: 'shopping', name: 'Compras', color: '#9C27B0', icon: '🛍️' },
    transaction_day: '2024-01-23',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    created_at: '2024-01-23T09:20:00Z'
  },
  {
    id: 'cc-1-004',
    card_id: '1',
    category_id: 'food',
    description: 'McDonald\'s',
    price: 42.80,
    category: { id: 'food', name: 'Alimentação', color: '#FF9800', icon: '🍽️' },
    transaction_day: '2024-01-22',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    created_at: '2024-01-22T19:30:00Z'
  },
  {
    id: 'cc-1-005',
    card_id: '1',
    category_id: 'entertainment',
    description: 'Netflix',
    price: 39.90,
    category: { id: 'entertainment', name: 'Entretenimento', color: '#E91E63', icon: '🎬' },
    transaction_day: '2024-01-15',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    transaction_mode: 'recurring',
    recurrence_type: 'monthly' as const,
    created_at: '2024-01-15T08:00:00Z'
  },

  // Transações do Cartão Premium (id: '2')
  {
    id: 'cc-2-001',
    card_id: '2',
    category_id: 'fuel',
    description: 'Posto Shell',
    price: 320.00,
    category: { id: 'fuel', name: 'Combustível', color: '#607D8B', icon: '⛽' },
    transaction_day: '2024-01-26',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    created_at: '2024-01-26T16:45:00Z'
  },
  {
    id: 'cc-2-002',
    card_id: '2',
    category_id: 'restaurant',
    description: 'Restaurante Italiano',
    price: 185.50,
    category: { id: 'restaurant', name: 'Restaurante', color: '#4CAF50', icon: '🍝' },
    transaction_day: '2024-01-25',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    created_at: '2024-01-25T20:15:00Z'
  },
  {
    id: 'cc-2-003',
    card_id: '2',
    category_id: 'shopping',
    description: 'Apple Store - iPhone Case',
    price: 299.00,
    category: { id: 'shopping', name: 'Compras', color: '#9C27B0', icon: '🛍️' },
    transaction_day: '2024-01-24',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    created_at: '2024-01-24T14:20:00Z'
  },
  {
    id: 'cc-2-004',
    card_id: '2',
    category_id: 'health',
    description: 'Farmácia São Paulo',
    price: 67.90,
    category: { id: 'health', name: 'Saúde', color: '#4CAF50', icon: '💊' },
    transaction_day: '2024-01-23',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    created_at: '2024-01-23T11:30:00Z'
  },

  // Transações do Cartão Black (id: '3')
  {
    id: 'cc-3-001',
    card_id: '3',
    category_id: 'travel',
    description: 'Booking.com - Hotel',
    price: 850.00,
    category: { id: 'travel', name: 'Viagem', color: '#FF5722', icon: '✈️' },
    transaction_day: '2024-01-27',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    created_at: '2024-01-27T09:45:00Z'
  },
  {
    id: 'cc-3-002',
    card_id: '3',
    category_id: 'restaurant',
    description: 'Restaurante Gourmet',
    price: 450.00,
    category: { id: 'restaurant', name: 'Restaurante', color: '#4CAF50', icon: '🍝' },
    transaction_day: '2024-01-26',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    created_at: '2024-01-26T21:00:00Z'
  },
  {
    id: 'cc-3-003',
    card_id: '3',
    category_id: 'shopping',
    description: 'Louis Vuitton',
    price: 1200.00,
    category: { id: 'shopping', name: 'Compras', color: '#9C27B0', icon: '🛍️' },
    transaction_day: '2024-01-25',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    created_at: '2024-01-25T16:30:00Z'
  },
  {
    id: 'cc-3-004',
    card_id: '3',
    category_id: 'entertainment',
    description: 'Spotify Premium',
    price: 19.90,
    category: { id: 'entertainment', name: 'Entretenimento', color: '#E91E63', icon: '🎬' },
    transaction_day: '2024-01-20',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    transaction_mode: 'recurring',
    recurrence_type: 'monthly' as const,
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'cc-3-005',
    card_id: '3',
    category_id: 'business',
    description: 'Coworking Space',
    price: 350.00,
    category: { id: 'business', name: 'Negócios', color: '#795548', icon: '💼' },
    transaction_day: '2024-01-18',
    type: 'outcome' as const,
    is_paid: false,
    payment_status: 'unpaid' as const,
    created_at: '2024-01-18T08:15:00Z'
  }
]