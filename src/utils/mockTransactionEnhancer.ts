import { ITransaction } from '../types/transactions'

export interface EnhancedTransaction extends ITransaction {
  payment_method: string
  merchant_logo?: string
  location?: string
  tags: string[]
  confidence_score: number
  estimated_category?: string
}

const paymentMethods = ['Credit Card', 'Debit Card', 'Cash', 'PIX', 'Bank Transfer']
const locations = [
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Brasília, DF',
  'Curitiba, PR',
  'Porto Alegre, RS',
  'Salvador, BA',
  'Fortaleza, CE',
  'Recife, PE',
  'Goiânia, GO'
]

const tagOptions = [
  'essential',
  'entertainment',
  'transport',
  'food',
  'shopping',
  'recurring',
  'one-time',
  'planned',
  'urgent',
  'investment'
]

function seededRandom(seed: string): number {
  let hash = 0
  if (seed.length === 0) return hash
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash) / Math.pow(2, 31)
}

function getRandomFromArray<T>(array: T[], seed: string): T {
  const randomIndex = Math.floor(seededRandom(seed) * array.length)
  return array[randomIndex]
}

function generateTags(transactionId: string, categoryName: string): string[] {
  const baseRandomness = seededRandom(transactionId + 'tags')
  const numTags = Math.floor(baseRandomness * 3) + 1 // 1-3 tags
  
  const selectedTags: string[] = []
  const availableTags = [...tagOptions]
  
  // Add category-specific tag logic
  if (categoryName.toLowerCase().includes('food') || categoryName.toLowerCase().includes('restaurante')) {
    selectedTags.push('food')
  } else if (categoryName.toLowerCase().includes('transport') || categoryName.toLowerCase().includes('uber')) {
    selectedTags.push('transport')
  } else if (categoryName.toLowerCase().includes('market') || categoryName.toLowerCase().includes('supermercado')) {
    selectedTags.push('essential')
  }
  
  // Fill remaining slots with random tags
  for (let i = selectedTags.length; i < numTags; i++) {
    const randomTag = getRandomFromArray(availableTags, transactionId + i.toString())
    if (!selectedTags.includes(randomTag)) {
      selectedTags.push(randomTag)
    }
  }
  
  return selectedTags.slice(0, numTags)
}

export function enhanceTransactionWithMockData(transaction: ITransaction): EnhancedTransaction {
  const transactionId = transaction.id || 'unknown'
  const categoryName = transaction.category?.name || ''
  
  return {
    ...transaction,
    payment_method: getRandomFromArray(paymentMethods, transactionId + 'payment'),
    merchant_logo: `https://via.placeholder.com/32x32/00acc1/ffffff?text=${categoryName.charAt(0).toUpperCase()}`,
    location: getRandomFromArray(locations, transactionId + 'location'),
    tags: generateTags(transactionId, categoryName) || [],
    confidence_score: Math.round((seededRandom(transactionId + 'confidence') * 0.8 + 0.2) * 100) / 100, // 0.2-1.0 range
    estimated_category: categoryName
  }
}

export function enhanceTransactionsWithMockData(transactions: ITransaction[]): EnhancedTransaction[] {
  return transactions.map(transaction => enhanceTransactionWithMockData(transaction))
}