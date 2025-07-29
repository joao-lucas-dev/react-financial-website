import React, { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Calendar, BarChart3, Eye, PieChart, Target } from 'lucide-react'
import CategoryIcon from '../CategoryIcon'
import { IRow, ITransaction, ISetOpenModal } from '../../types/transactions'

interface TransactionsListViewProps {
  rows: IRow[]
  setOpenModal: ISetOpenModal
  categories: any[]
  handleCreateTransaction: (transaction: ITransaction) => void
  handleUpdateTransaction: (transaction: ITransaction) => void
  handleDeleteTransaction: (id: string) => void
  currentMonth: any
  setCurrentMonth: any
}

const TransactionsListView: React.FC<TransactionsListViewProps> = ({
  rows,
  setOpenModal,
  categories,
  handleCreateTransaction,
  handleUpdateTransaction,
  handleDeleteTransaction,
  currentMonth,
  setCurrentMonth
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'outcome'>('all')
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  // Función para calcular status de pagamento automático baseado na data
  const getAutoPaymentStatus = (transaction: ITransaction) => {
    if (transaction.is_paid !== undefined) return transaction.is_paid
    
    if (!transaction.transaction_day) return false
    
    const today = new Date()
    const transDate = new Date(`${transaction.transaction_day}T00:00:00`)
    
    // Check if the date is valid
    if (isNaN(transDate.getTime())) return false
    
    today.setHours(0, 0, 0, 0)
    transDate.setHours(0, 0, 0, 0)
    
    return transDate <= today
  }

  const getPaymentIcon = (transaction: ITransaction) => {
    const isPaid = getAutoPaymentStatus(transaction)
    return isPaid ? (
      <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
      </div>
    ) : (
      <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
      </div>
    )
  }

  const handleAddTransaction = (type: 'income' | 'outcome') => {
    setOpenModal({
      isOpen: true,
      transaction: {
        category_id: '',
        description: '',
        price: '',
        category: { id: '', name: '', color: '', icon: '', iconName: '', icon_name: '', type: type },
        transaction_day: new Date().toISOString().split('T')[0],
        type: type
      } as ITransaction,
      type: 'create'
    })
  }

  // Calcular estatísticas gerais
  const allTransactions: (ITransaction & { type: 'income' | 'outcome', dayData: IRow })[] = []
  let totalIncome = 0
  let totalOutcome = 0
  let totalBalance = 0

  rows.forEach(row => {
    if (row.incomes?.transactions) {
      row.incomes.transactions.forEach(t => {
        allTransactions.push({ ...t, type: 'income', dayData: row })
        const price = Number(t.price)
        if (!isNaN(price) && t.price !== undefined && t.price !== null) {
          totalIncome += price
        }
      })
    }
    if (row.outcomes?.transactions) {
      row.outcomes.transactions.forEach(t => {
        allTransactions.push({ ...t, type: 'outcome', dayData: row })
        const price = Number(t.price)
        if (!isNaN(price) && t.price !== undefined && t.price !== null) {
          totalOutcome += Math.abs(price)
        }
      })
    }
  })

  totalBalance = totalIncome - totalOutcome

  const filteredTransactions = activeFilter === 'all' 
    ? allTransactions 
    : allTransactions.filter(t => t.type === activeFilter)

  const totalTransactions = allTransactions.length
  const paidTransactions = allTransactions.filter(t => getAutoPaymentStatus(t)).length
  const unpaidTransactions = totalTransactions - paidTransactions

  // Encontrar maior gasto
  const largestExpense = allTransactions
    .filter(t => t.type === 'outcome')
    .filter(t => {
      const price = Number(t.price)
      return !isNaN(price) && t.price !== undefined && t.price !== null
    })
    .reduce((max, t) => {
      const currentPrice = Math.abs(Number(t.price))
      const maxPrice = max ? Math.abs(Number(max.price)) : 0
      return currentPrice > maxPrice ? t : max
    }, null as (ITransaction & { type: 'income' | 'outcome', dayData: IRow }) | null)

  // Categoria principal
  const mainCategory = (() => {
    const categoryMap = new Map<string, { count: number, total: number, name: string }>()
    
    allTransactions.forEach(t => {
      const key = t.category?.name || 'Sem categoria'
      const current = categoryMap.get(key) || { count: 0, total: 0, name: key }
      const price = Number(t.price)
      const validPrice = !isNaN(price) && t.price !== undefined && t.price !== null ? Math.abs(price) : 0
      
      categoryMap.set(key, {
        count: current.count + 1,
        total: current.total + validPrice,
        name: key
      })
    })

    const categories = Array.from(categoryMap.values())
    return categories.length > 0 
      ? categories.reduce((max, current) => current.total > max.total ? current : max)
      : { count: 0, total: 0, name: 'Nenhuma' }
  })()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
      {/* Left Sidebar - Stats */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <BarChart3 size={16} />
          Resumo do Período
        </h3>
        
        <div className="space-y-4">
          {/* Totals Overview */}
          <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Receitas</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Despesas</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {totalOutcome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-600">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Saldo</span>
                <span className={`font-bold ${totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Count */}
          <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <PieChart size={16} className="text-teal-600 dark:text-teal-400" />
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Transações</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Total</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{totalTransactions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Pagas</span>
                <span className="font-medium text-green-600 dark:text-green-400">{paidTransactions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Pendentes</span>
                <span className="font-medium text-red-600 dark:text-red-400">{unpaidTransactions}</span>
              </div>
            </div>
          </div>

          {/* Largest Expense */}
          {largestExpense && (
            <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Target size={16} className="text-red-600 dark:text-red-400" />
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Maior Gasto</span>
              </div>
              <div className="space-y-2">
                <div className="font-bold text-red-600 dark:text-red-400">
                  {Number(largestExpense.price).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {largestExpense.description}
                </div>
              </div>
            </div>
          )}

          {/* Main Category */}
          {mainCategory.name !== 'Nenhuma' && (
            <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Eye size={16} className="text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Categoria Principal</span>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {mainCategory.name}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {mainCategory.count} transações • {mainCategory.total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            <button
              onClick={() => handleAddTransaction('income')}
              className="w-full p-3 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              <TrendingUp size={16} />
              Adicionar Receita
            </button>
            <button
              onClick={() => handleAddTransaction('outcome')}
              className="w-full p-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              <TrendingDown size={16} />
              Adicionar Despesa
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Transactions */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'Todas', count: totalTransactions },
            { key: 'income', label: 'Receitas', count: allTransactions.filter(t => t.type === 'income').length },
            { key: 'outcome', label: 'Despesas', count: allTransactions.filter(t => t.type === 'outcome').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === tab.key
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredTransactions.map((transaction, index) => (
              <div
                key={transaction.id || index}
                className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Category Icon */}
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-600 flex items-center justify-center">
                      {transaction.category ? (
                        <CategoryIcon
                          category={transaction.category}
                          size="small"
                        />
                      ) : (
                        <span className="text-xs text-zinc-400">?</span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                        {transaction.description}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-zinc-200 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-400">
                          {transaction.category?.name || 'Sem categoria'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-zinc-200 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-400">
                          {transaction.transaction_day ? 
                            new Date(`${transaction.transaction_day}T00:00:00`).toLocaleDateString('pt-BR') : 
                            'Data inválida'
                          }
                        </span>
                        {getPaymentIcon(transaction)}
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {getAutoPaymentStatus(transaction) ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        transaction.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {(() => {
                          const price = Number(transaction.price);
                          if (isNaN(price) || transaction.price === undefined || transaction.price === null) {
                            return 'R$ 0,00';
                          }
                          return Math.abs(price).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          });
                        })()}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setOpenModal({
                          isOpen: true,
                          transaction,
                          type: 'edit'
                        })
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg transition-all duration-200"
                    >
                      <Eye size={16} className="text-zinc-600 dark:text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-lg font-medium text-zinc-400 dark:text-zinc-500">
              Nenhuma transação encontrada
            </p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
              {activeFilter === 'all' ? 'Adicione sua primeira transação!' : 
               activeFilter === 'income' ? 'Nenhuma receita neste período' : 'Nenhuma despesa neste período'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionsListView