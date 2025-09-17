import { ArrowRight, BarChart3, Calendar, CreditCard, Eye, PieChart, Plus, TrendingDown, TrendingUp, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { IRow, ISetOpenModal, ITransaction } from '../types/transactions'
import CategoryIcon from './CategoryIcon'

interface DayDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  dayData: IRow
  setOpenModal: ISetOpenModal
  initialFilter?: 'all' | 'income' | 'outcome'
}

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  dayData,
  setOpenModal,
  initialFilter = 'all'
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'outcome'>(initialFilter)
  const [isClosing, setIsClosing] = useState(false)

  // Atualiza a aba ativa quando o filtro inicial muda
  useEffect(() => {
    setActiveTab(initialFilter)
  }, [initialFilter])

  // Função para calcular status de pagamento automático baseado na data
  const getAutoPaymentStatus = (transaction: ITransaction) => {
    const today = new Date()
    const transDate = new Date(`${transaction.transaction_day}T00:00:00`)
    
    today.setHours(0, 0, 0, 0)
    transDate.setHours(0, 0, 0, 0)
    
    if (transaction.is_paid !== undefined) return transaction.is_paid
    
    return transDate <= today
  }

  const getPaymentIcon = (transaction: ITransaction) => {
    const isPaid = getAutoPaymentStatus(transaction)
    return isPaid ? (
      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
      </div>
    ) : (
      <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
      </div>
    )
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200)
  }

  const handleAddTransaction = (type: 'income' | 'outcome') => {
    setOpenModal({
      isOpen: true,
      transaction: {
        category_id: '',
        description: '',
        price: '',
        category: { id: 0, name: '', color: '', icon: '', iconName: '', icon_name: '', type: type },
        transaction_day: dayData.date,
        type: type
      } as ITransaction,
      type: 'create',
      button: type,
    })
    handleClose()
  }

  const formatTransactionDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const allTransactions = [
    ...(dayData.incomes?.transactions || []).map(t => ({ ...t, type: 'income' as const })),
    ...(dayData.outcomes?.transactions || []).map(t => ({ ...t, type: 'outcome' as const }))
  ]

  const filteredTransactions = activeTab === 'all' 
    ? allTransactions 
    : allTransactions.filter(t => t.type === activeTab)

  const totalTransactions = allTransactions.length
  const paidTransactions = allTransactions.filter(t => getAutoPaymentStatus(t)).length
  const unpaidTransactions = totalTransactions - paidTransactions

  // const largestExpense = dayData.outcomes?.transactions?.reduce((max, t) => 
  //   Math.abs(Number(t.price)) > Math.abs(Number(max.price)) ? t : max
  // , dayData.outcomes.transactions[0])

  const mainCategory = (() => {
    const categoryMap = new Map<string, { count: number, total: number, name: string }>()
    
    allTransactions.forEach(t => {
      const key = t.category?.name || 'Sem categoria'
      const current = categoryMap.get(key) || { count: 0, total: 0, name: key }
      categoryMap.set(key, {
        count: current.count + 1,
        total: current.total + Math.abs(Number(t.price)),
        name: key
      })
    })

    return Array.from(categoryMap.values()).reduce((max, current) => 
      current.total > max.total ? current : max
    , { count: 0, total: 0, name: 'Nenhuma' })
  })()

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
      isClosing ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Backdrop with Glassmorphism */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-6xl max-h-[90vh] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-zinc-700/50 overflow-hidden transition-all duration-200 ${
        isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-teal-500/10 to-blue-500/10 dark:from-teal-600/20 dark:to-blue-600/20 p-6 border-b border-zinc-200/50 dark:border-zinc-700/50">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/80 dark:hover:bg-zinc-800/80 rounded-full transition-colors"
          >
            <X size={20} className="text-zinc-600 dark:text-zinc-400" />
          </button>
          
          <div className="flex items-center justify-between pr-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-xl">
                <Calendar size={24} className="text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Detalhes do Dia
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 capitalize">
                  {formatTransactionDate(dayData.date)}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {dayData.incomes?.valueFormatted || 'R$ 0,00'}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">Receitas</div>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {dayData.outcomes?.valueFormatted || 'R$ 0,00'}
                </div>
                <div className="text-xs text-red-700 dark:text-red-300">Despesas</div>
              </div>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg">
                <div className={`text-lg font-bold ${
                  Number(dayData.total?.value || 0) >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {dayData.total?.valueFormatted || 'R$ 0,00'}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Saldo</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Left Sidebar - Stats */}
          <div className="w-80 bg-zinc-50/80 dark:bg-zinc-800/50 p-6 border-r border-zinc-200/50 dark:border-zinc-700/50 overflow-y-auto">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <BarChart3 size={16} />
              Resumo do Dia
            </h3>
            
            <div className="space-y-4">
              {/* Transaction Count */}
              <div className="p-4 bg-white/80 dark:bg-zinc-800/80 rounded-lg backdrop-blur-sm">
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
              {/* {largestExpense && (
                <div className="p-4 bg-white/80 dark:bg-zinc-800/80 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Target size={16} className="text-red-600 dark:text-red-400" />
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Maior Gasto</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
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
              )} */}

              {/* Main Category */}
              {mainCategory.name !== 'Nenhuma' && (
                <div className="p-4 bg-white/80 dark:bg-zinc-800/80 rounded-lg backdrop-blur-sm">
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
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              {[
                { key: 'all', label: 'Todas', count: totalTransactions },
                { key: 'income', label: 'Receitas', count: dayData.incomes?.transactions?.length || 0 },
                { key: 'outcome', label: 'Despesas', count: dayData.outcomes?.transactions?.length || 0 }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Transactions List */}
            {filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                {filteredTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id || index}
                    className="p-4 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Category Icon */}
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
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
                          <div className="flex items-center gap-2">
                            {(transaction.fromCreditCard || transaction.card_id) && (
                              <CreditCard className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                            )}
                            <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                              {transaction.description}
                            </h4>
                            {(transaction.installment_info || transaction.installments) && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                {transaction.installment_info || `${transaction.installments}x parcelas`}
                              </span>
                            )}
                            {transaction.is_recurring && (
                              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs rounded-full">
                                ↻ Recorrente
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400">
                              {transaction.category?.name || 'Sem categoria'}
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
                            {transaction.price} 
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setOpenModal({
                              isOpen: true,
                              transaction,
                              type: 'edit'
                            })
                            handleClose()
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-all duration-200"
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
                  {activeTab === 'all' ? 'Adicione sua primeira transação!' : 
                   activeTab === 'income' ? 'Nenhuma receita neste dia' : 'Nenhuma despesa neste dia'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50/80 dark:bg-zinc-800/50 border-t border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex justify-center">
            <a
              href="/transacoes"
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
            >
              Ver todas as transações
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DayDetailsModal
