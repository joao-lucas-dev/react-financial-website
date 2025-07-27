import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, DollarSign } from 'lucide-react'
import MenuAside from '../../components/MenuAside'
import CreditCard from '../../components/CreditCard'
import { mockCreditCards, mockCreditCardTransactions } from '../../types/creditCards'

const CreditCardBillsPage: React.FC = () => {
  // Calcular o total gasto por cartão no mês atual
  const calculateMonthlyTotal = (cardId: string) => {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    return mockCreditCardTransactions
      .filter(transaction => {
        if (transaction.card_id !== cardId) return false
        const transactionDate = new Date(transaction.transaction_day)
        return transactionDate.getMonth() + 1 === currentMonth && 
               transactionDate.getFullYear() === currentYear
      })
      .reduce((total, transaction) => total + Number(transaction.price), 0)
  }

  // Calcular próximo vencimento (assumindo dia 10 do próximo mês)
  const getNextDueDate = () => {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(10)
    return nextMonth.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="font-sans">
      <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 transition-colors">
        <div className="flex h-full">
          <MenuAside activePage="faturas" />
          
          <main className="flex-1 mt-4 pl-0 xl-lg:pl-64 max-w-7xl mx-auto p-8">
            {/* Header Section */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 mb-8 shadow-2xl transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-semibold mb-2 text-zinc-700 dark:text-zinc-200">
                    Faturas dos Cartões
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                    Selecione um cartão para ver as transações da fatura
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Próximo vencimento</p>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} className="text-teal-600 dark:text-teal-400" />
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                      {getNextDueDate()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCreditCards.map((card) => {
                const monthlyTotal = calculateMonthlyTotal(card.id)
                
                return (
                  <Link
                    key={card.id}
                    to={`/faturas/${card.id}`}
                    className="group block transition-all duration-200 hover:scale-105"
                  >
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-2xl transition-colors hover:shadow-3xl">
                      {/* Card Visual */}
                      <div className="mb-4">
                        <CreditCard 
                          card={card}
                          isActive={true}
                          className="w-full transform scale-90"
                        />
                      </div>

                      {/* Card Info */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-zinc-700 dark:text-zinc-200">
                              {card.name}
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              {card.maskedNumber}
                            </p>
                          </div>
                          <ArrowRight 
                            size={20} 
                            className="text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" 
                          />
                        </div>

                        {/* Monthly Total */}
                        <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign size={16} className="text-teal-600 dark:text-teal-400" />
                              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                Fatura atual
                              </span>
                            </div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {monthlyTotal.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Available Limit */}
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Limite disponível
                          </span>
                          <span className="font-medium text-teal-600 dark:text-teal-400">
                            {((card.creditLimit || 0) - card.balance).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </span>
                        </div>

                        {/* Usage Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                            <span>Limite utilizado</span>
                            <span>
                              {(((card.balance / (card.creditLimit || 1)) * 100)).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-600 rounded-full h-2">
                            <div
                              className={`h-full bg-gradient-to-r ${card.gradientFrom} ${card.gradientTo} rounded-full transition-all duration-500`}
                              style={{ 
                                width: `${Math.min(100, (card.balance / (card.creditLimit || 1)) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default CreditCardBillsPage