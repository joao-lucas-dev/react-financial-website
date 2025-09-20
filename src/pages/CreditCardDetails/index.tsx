import { ArrowLeft, CheckCircle, Clock, DollarSign, XCircle } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CreditCard from '../../components/CreditCard'
import MenuAside from '../../components/MenuAside'
import { mockCreditCards, mockCreditCardTransactions } from '../../types/creditCards'
import { ITransaction } from '../../types/transactions'

const CreditCardDetailsPage: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Encontrar o cartão atual
  const currentCard = mockCreditCards.find(card => card.id === cardId)

  // Filtrar transações por cartão e mês/ano
  const filteredTransactions = useMemo(() => {
    return mockCreditCardTransactions.filter(transaction => {
      if (transaction.card_id !== cardId) return false
      const transactionDate = new Date(`${transaction.transaction_day}T00:00:00`)
      return transactionDate.getMonth() + 1 === selectedMonth && 
             transactionDate.getFullYear() === selectedYear
    }).sort((a, b) => new Date(`${b.transaction_day}T00:00:00`).getTime() - new Date(`${a.transaction_day}T00:00:00`).getTime())
  }, [cardId, selectedMonth, selectedYear])

  // Calcular estatísticas
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + Number(t.price), 0)
  const paidTransactions = filteredTransactions.filter(t => t.is_paid).length
  const unpaidTransactions = filteredTransactions.filter(t => !t.is_paid).length

  // Função para determinar status de pagamento baseado na data
  const getPaymentStatus = (transaction: ITransaction) => {
    const today = new Date()
    const transactionDate = new Date(`${transaction.transaction_day}T00:00:00`)
    today.setHours(0, 0, 0, 0)
    transactionDate.setHours(0, 0, 0, 0)

    if (transaction.is_paid) return 'paid'
    if (transactionDate <= today) return 'unpaid'
    return 'pending'
  }

  const getStatusIcon = (transaction: ITransaction) => {
    const status = getPaymentStatus(transaction)
    switch (status) {
      case 'paid':
        return <CheckCircle size={16} className="text-green-500" />
      case 'unpaid':
        return <XCircle size={16} className="text-red-500" />
      case 'pending':
        return <Clock size={16} className="text-orange-500" />
    }
  }

  const getStatusText = (transaction: ITransaction) => {
    const status = getPaymentStatus(transaction)
    switch (status) {
      case 'paid': return 'Pago'
      case 'unpaid': return 'Não pago'
      case 'pending': return 'Pendente'
    }
  }

  const getStatusColor = (transaction: ITransaction) => {
    const status = getPaymentStatus(transaction)
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'unpaid': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'pending': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
    }
  }

  // Gerar opções de mês/ano
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })
  }))

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: 2024 - i,
    label: (2024 - i).toString()
  }))

  if (!currentCard) {
    return (
      <div className="font-sans">
        <div className="min-h-screen w-full bg-zinc-100 dark:bg-zinc-900 transition-colors">
          <div className="flex min-h-screen">
            <MenuAside activePage="cartoes" />
            <main className="flex-1 mt-4 pl-0 lg:pl-20 2xl:pl-72 max-w-7xl mx-auto p-8">
              <div className="text-center py-12">
                <h1 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
                  Cartão não encontrado
                </h1>
                <Link 
                  to="/cartoes"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Voltar para lista de cartões
                </Link>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="font-sans">
      <div className="min-h-screen w-full bg-zinc-100 dark:bg-zinc-900 transition-colors">
        <div className="flex min-h-screen">
          <MenuAside activePage="cartoes" />
          
          <main className="flex-1 mt-4 pl-0 lg:pl-20 2xl:pl-72 max-w-7xl mx-auto p-8">
            {/* Header Section */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 mb-8 shadow-2xl transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Link
                    to="/cartoes"
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-200">
                      Fatura - {currentCard.name}
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                      {currentCard.maskedNumber}
                    </p>
                  </div>
                </div>

                {/* Month/Year Selectors */}
                <div className="flex items-center gap-3">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-3 py-2 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {monthOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-2 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {yearOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Card Preview and Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                {/* Card Visual */}
                <div>
                  <CreditCard 
                    card={currentCard}
                    isActive={true}
                    className="w-full"
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={16} className="text-teal-600 dark:text-teal-400" />
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Total da Fatura
                      </span>
                    </div>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  
                  <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Transações Pagas
                      </span>
                    </div>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {paidTransactions}
                    </p>
                  </div>
                  
                  <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle size={16} className="text-red-600" />
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Pendentes
                      </span>
                    </div>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {unpaidTransactions}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl transition-colors">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-6">
                  Transações de {monthOptions.find(m => m.value === selectedMonth)?.label} {selectedYear}
                </h2>

                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Nenhuma transação encontrada para este período
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {/* Category Icon */}
                          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-600 flex items-center justify-center text-lg">
                            {transaction.category.icon}
                          </div>
                          
                          {/* Transaction Info */}
                          <div>
                            <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                              {transaction.description}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-300">
                                {transaction.category.name}
                              </span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {new Date(`${transaction.transaction_day}T00:00:00`).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Payment Status */}
                          <div className="flex items-center gap-2">
                            {getStatusIcon(transaction)}
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(transaction)}`}>
                              {getStatusText(transaction)}
                            </span>
                          </div>

                          {/* Amount */}
                          <div className="text-right">
                            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                              -{Number(transaction.price).toLocaleString('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default CreditCardDetailsPage