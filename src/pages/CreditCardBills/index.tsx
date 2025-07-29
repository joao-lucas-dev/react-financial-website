import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, DollarSign, Plus, X, Edit2, Trash2, MoreVertical } from 'lucide-react'
import MenuAside from '../../components/MenuAside'
import CreditCard from '../../components/CreditCard'
import { mockCreditCards, mockCreditCardTransactions } from '../../types/creditCards'

const CreditCardBillsPage: React.FC = () => {
  const [cards, setCards] = useState(mockCreditCards)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingCard, setEditingCard] = useState<any>(null)
  const [deletingCard, setDeletingCard] = useState<any>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [newCard, setNewCard] = useState({
    name: '',
    cardNumber: '',
    creditLimit: '',
    dueDay: '10',
    brand: 'visa',
    color: 'from-blue-600 to-blue-800'
  })

  const brands = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'Mastercard' },
    { value: 'elo', label: 'Elo' },
    { value: 'american-express', label: 'American Express' }
  ]

  const colors = [
    { value: 'from-blue-600 to-blue-800', label: 'Azul', gradient: 'from-blue-600 to-blue-800' },
    { value: 'from-purple-600 to-purple-800', label: 'Roxo', gradient: 'from-purple-600 to-purple-800' },
    { value: 'from-green-600 to-green-800', label: 'Verde', gradient: 'from-green-600 to-green-800' },
    { value: 'from-red-600 to-red-800', label: 'Vermelho', gradient: 'from-red-600 to-red-800' },
    { value: 'from-orange-600 to-orange-800', label: 'Laranja', gradient: 'from-orange-600 to-orange-800' },
    { value: 'from-teal-600 to-teal-800', label: 'Teal', gradient: 'from-teal-600 to-teal-800' },
    { value: 'from-pink-600 to-pink-800', label: 'Rosa', gradient: 'from-pink-600 to-pink-800' },
    { value: 'from-gray-600 to-gray-800', label: 'Cinza', gradient: 'from-gray-600 to-gray-800' }
  ]

  const resetNewCardForm = () => {
    setNewCard({
      name: '',
      cardNumber: '',
      creditLimit: '',
      dueDay: '10',
      brand: 'visa',
      color: 'from-blue-600 to-blue-800'
    })
  }

  const handleCreateCard = () => {
    const newCardData = {
      id: Date.now().toString(),
      name: newCard.name,
      maskedNumber: `**** **** **** ${newCard.cardNumber.slice(-4)}`,
      balance: 0,
      creditLimit: parseFloat(newCard.creditLimit),
      brand: newCard.brand,
      gradientFrom: newCard.color.split(' ')[0],
      gradientTo: newCard.color.split(' ')[2],
      dueDay: parseInt(newCard.dueDay)
    }
    
    setCards(prev => [...prev, newCardData])
    resetNewCardForm()
    setShowCreateModal(false)
  }

  const handleEditCard = (card: any) => {
    setEditingCard(card)
    setNewCard({
      name: card.name,
      cardNumber: card.maskedNumber.replace(/\*/g, '0').replace(/\s/g, ''),
      creditLimit: card.creditLimit.toString(),
      dueDay: card.dueDay?.toString() || '10',
      brand: card.brand,
      color: `${card.gradientFrom} to ${card.gradientTo}`
    })
    setShowEditModal(true)
    setOpenDropdown(null)
  }

  const handleUpdateCard = () => {
    if (!editingCard) return
    
    const updatedCard = {
      ...editingCard,
      name: newCard.name,
      maskedNumber: `**** **** **** ${newCard.cardNumber.slice(-4)}`,
      creditLimit: parseFloat(newCard.creditLimit),
      brand: newCard.brand,
      gradientFrom: newCard.color.split(' ')[0],
      gradientTo: newCard.color.split(' ')[2],
      dueDay: parseInt(newCard.dueDay)
    }
    
    setCards(prev => prev.map(card => 
      card.id === editingCard.id ? updatedCard : card
    ))
    
    resetNewCardForm()
    setShowEditModal(false)
    setEditingCard(null)
  }

  const handleDeleteCard = (card: any) => {
    setDeletingCard(card)
    setShowDeleteModal(true)
    setOpenDropdown(null)
  }

  const confirmDeleteCard = () => {
    if (!deletingCard) return
    
    setCards(prev => prev.filter(card => card.id !== deletingCard.id))
    setShowDeleteModal(false)
    setDeletingCard(null)
  }

  const maskCardNumber = (number: string) => {
    return number.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setOpenDropdown(null)
    }

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [openDropdown])

  // Calcular o total gasto por cartão no mês atual
  const calculateMonthlyTotal = (cardId: string) => {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    return mockCreditCardTransactions
      .filter(transaction => {
        if (transaction.card_id !== cardId) return false
        const transactionDate = new Date(`${transaction.transaction_day}T00:00:00`)
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
      <div className="min-h-screen w-full bg-zinc-100 dark:bg-zinc-900 transition-colors">
        <div className="flex min-h-screen">
          <MenuAside activePage="cartoes" />
          
          <main className="flex-1 mt-4 pl-0 lg:pl-20 2xl:pl-72 max-w-7xl mx-auto p-8">
            {/* Header Section */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 mb-8 shadow-2xl transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-semibold mb-2 text-zinc-700 dark:text-zinc-200">
                    Meus Cartões
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                    Gerencie seus cartões de crédito e acompanhe suas faturas
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Plus size={16} />
                    Novo Cartão
                  </button>
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
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => {
                const monthlyTotal = calculateMonthlyTotal(card.id)
                
                return (
                  <div
                    key={card.id}
                    className="group relative bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-2xl transition-colors hover:shadow-3xl"
                  >
                    {/* Card Actions Dropdown */}
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setOpenDropdown(openDropdown === card.id ? null : card.id)
                        }}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={16} className="text-zinc-600 dark:text-zinc-400" />
                      </button>
                      
                      {openDropdown === card.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-600 py-1 min-w-32">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleEditCard(card)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                          >
                            <Edit2 size={14} />
                            Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDeleteCard(card)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={14} />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Card Visual */}
                    <Link
                      to={`/cartoes/${card.id}`}
                      className="block transition-all duration-200 hover:scale-105"
                    >
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
                    </Link>
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      </div>

      {/* Create Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Novo Cartão de Crédito
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetNewCardForm()
                }}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
              >
                <X size={20} className="text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Nome do Cartão
                </label>
                <input
                  type="text"
                  value={newCard.name}
                  onChange={(e) => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Cartão Principal"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  value={newCard.cardNumber}
                  onChange={(e) => setNewCard(prev => ({ ...prev, cardNumber: maskCardNumber(e.target.value) }))}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Limite (R$)
                  </label>
                  <input
                    type="number"
                    value={newCard.creditLimit}
                    onChange={(e) => setNewCard(prev => ({ ...prev, creditLimit: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Dia do Vencimento
                  </label>
                  <select
                    value={newCard.dueDay}
                    onChange={(e) => setNewCard(prev => ({ ...prev, dueDay: e.target.value }))}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Bandeira
                </label>
                <select
                  value={newCard.brand}
                  onChange={(e) => setNewCard(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  {brands.map(brand => (
                    <option key={brand.value} value={brand.value}>
                      {brand.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Cor do Cartão
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewCard(prev => ({ ...prev, color: color.value }))}
                      className={`w-full h-8 rounded-lg bg-gradient-to-br ${color.gradient} border-2 transition-all ${
                        newCard.color === color.value
                          ? 'border-zinc-900 dark:border-zinc-100 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    resetNewCardForm()
                  }}
                  className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCard}
                  disabled={!newCard.name || !newCard.cardNumber || !newCard.creditLimit}
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-400 text-white rounded-lg transition-colors"
                >
                  Criar Cartão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Card Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Editar Cartão de Crédito
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingCard(null)
                  resetNewCardForm()
                }}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
              >
                <X size={20} className="text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Nome do Cartão
                </label>
                <input
                  type="text"
                  value={newCard.name}
                  onChange={(e) => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Cartão Principal"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  value={newCard.cardNumber}
                  onChange={(e) => setNewCard(prev => ({ ...prev, cardNumber: maskCardNumber(e.target.value) }))}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Limite (R$)
                  </label>
                  <input
                    type="number"
                    value={newCard.creditLimit}
                    onChange={(e) => setNewCard(prev => ({ ...prev, creditLimit: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Dia do Vencimento
                  </label>
                  <select
                    value={newCard.dueDay}
                    onChange={(e) => setNewCard(prev => ({ ...prev, dueDay: e.target.value }))}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Bandeira
                </label>
                <select
                  value={newCard.brand}
                  onChange={(e) => setNewCard(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  {brands.map(brand => (
                    <option key={brand.value} value={brand.value}>
                      {brand.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Cor do Cartão
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewCard(prev => ({ ...prev, color: color.value }))}
                      className={`w-full h-8 rounded-lg bg-gradient-to-br ${color.gradient} border-2 transition-all ${
                        newCard.color === color.value
                          ? 'border-zinc-900 dark:border-zinc-100 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingCard(null)
                    resetNewCardForm()
                  }}
                  className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateCard}
                  disabled={!newCard.name || !newCard.cardNumber || !newCard.creditLimit}
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-400 text-white rounded-lg transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Excluir Cartão
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingCard(null)
                }}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
              >
                <X size={20} className="text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium mb-2">
                  Tem certeza que deseja excluir o cartão?
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  <strong>{deletingCard.name}</strong>
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {deletingCard.maskedNumber}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3">
                  Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletingCard(null)
                  }}
                  className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteCard}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Excluir Cartão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreditCardBillsPage