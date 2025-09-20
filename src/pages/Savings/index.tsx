import {
  Calendar,
  Car,
  Check,
  Edit3,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  Home,
  PiggyBank,
  Plane,
  Plus,
  Smartphone,
  Target,
  Trash2,
  X
} from 'lucide-react'
import React, { useState } from 'react'
import MenuAside from '../../components/MenuAside'

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  icon: string
  color: string
  deadline?: string
  description?: string
  createdAt: string
}

const GOAL_ICONS = {
  car: { icon: Car, label: 'Carro' },
  home: { icon: Home, label: 'Casa' },
  plane: { icon: Plane, label: 'Viagem' },
  piggybank: { icon: PiggyBank, label: 'Poupança' },
  gift: { icon: Gift, label: 'Presente' },
  graduation: { icon: GraduationCap, label: 'Educação' },
  heart: { icon: Heart, label: 'Saúde' },
  phone: { icon: Smartphone, label: 'Eletrônicos' },
  game: { icon: Gamepad2, label: 'Lazer' }
}

const GOAL_COLORS = [
  { value: 'from-blue-500 to-blue-700', label: 'Azul' },
  { value: 'from-green-500 to-green-700', label: 'Verde' },
  { value: 'from-purple-500 to-purple-700', label: 'Roxo' },
  { value: 'from-orange-500 to-orange-700', label: 'Laranja' },
  { value: 'from-pink-500 to-pink-700', label: 'Rosa' },
  { value: 'from-teal-500 to-teal-700', label: 'Teal' },
  { value: 'from-red-500 to-red-700', label: 'Vermelho' },
  { value: 'from-indigo-500 to-indigo-700', label: 'Índigo' }
]

const SavingsPage: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  //   {
  //     id: '1',
  //     name: 'Carro Novo',
  //     targetAmount: 45000,
  //     currentAmount: 12500,
  //     icon: 'car',
  //     color: 'from-blue-500 to-blue-700',
  //     deadline: '2024-12-31',
  //     description: 'Economizando para comprar um carro 0km',
  //     createdAt: '2024-01-15'
  //   },
  //   {
  //     id: '2', 
  //     name: 'Viagem Europa',
  //     targetAmount: 15000,
  //     currentAmount: 8750,
  //     icon: 'plane',
  //     color: 'from-green-500 to-green-700',
  //     deadline: '2024-07-01',
  //     description: 'Mochilão pela Europa no meio do ano',
  //     createdAt: '2024-01-20'
  //   },
  //   {
  //     id: '3',
  //     name: 'Reserva de Emergência',
  //     targetAmount: 20000,
  //     currentAmount: 5200,
  //     icon: 'piggybank',
  //     color: 'from-purple-500 to-purple-700',
  //     description: 'Reserva de emergência para 6 meses',
  //     createdAt: '2024-02-01'
  //   },
  //   {
  //     id: '4',
  //     name: 'Casa Própria',
  //     targetAmount: 80000,
  //     currentAmount: 23000,
  //     icon: 'home',
  //     color: 'from-orange-500 to-orange-700',
  //     deadline: '2025-06-01',
  //     description: 'Entrada para financiamento da casa própria',
  //     createdAt: '2024-01-10'
  //   }
  // ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddMoneyModal, setShowAddMoneyModal] = useState<string | null>(null)
  const [setShowEditModal] = useState<string | null>(null)
  const [addAmount, setAddAmount] = useState('')
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    description: '',
    deadline: '',
    icon: 'piggybank',
    color: 'from-blue-500 to-blue-700'
  })

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getRemainingAmount = (current: number, target: number) => {
    return Math.max(target - current, 0)
  }

  const getDaysToDeadline = (deadline?: string) => {
    if (!deadline) return null
    const today = new Date()
    const deadlineDate = new Date(`${deadline}T00:00:00`)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleAddMoney = (goalId: string) => {
    const amount = parseFloat(addAmount.replace(/[^\d,]/g, '').replace(',', '.'))
    if (amount > 0) {
      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, currentAmount: goal.currentAmount + amount }
          : goal
      ))
      setAddAmount('')
      setShowAddMoneyModal(null)
    }
  }

  const handleCreateGoal = () => {
    if (newGoal.name && newGoal.targetAmount) {
      const goal: SavingsGoal = {
        id: Date.now().toString(),
        name: newGoal.name,
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: 0,
        description: newGoal.description,
        deadline: newGoal.deadline || undefined,
        icon: newGoal.icon,
        color: newGoal.color,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setGoals(prev => [...prev, goal])
      setNewGoal({
        name: '',
        targetAmount: '',
        description: '',
        deadline: '',
        icon: 'piggybank',
        color: 'from-blue-500 to-blue-700'
      })
      setShowCreateModal(false)
    }
  }

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId))
  }

  const IconComponent = ({ iconName }: { iconName: string }) => {
    const IconEl = GOAL_ICONS[iconName as keyof typeof GOAL_ICONS]?.icon || PiggyBank
    return <IconEl size={24} />
  }

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const achievedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount).length

  return (
    <div className="font-sans">
      <div className="min-h-screen w-full bg-zinc-100 dark:bg-zinc-900 transition-colors">
        <div className="flex min-h-screen">
          <MenuAside activePage="caixinhas" />
          
          <main className="flex-1 mt-4 pl-0 lg:pl-20 2xl:pl-72 max-w-7xl mx-auto p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Minhas Caixinhas
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Organize suas economias e alcance seus objetivos financeiros
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  <Plus size={20} />
                  Nova Caixinha
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <PiggyBank size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Economizado</span>
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(totalSaved)}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Target size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Meta Total</span>
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(totalTarget)}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Check size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Metas Alcançadas</span>
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {achievedGoals} de {goals.length}
                </div>
              </div>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const progress = getProgress(goal.currentAmount, goal.targetAmount)
                const remaining = getRemainingAmount(goal.currentAmount, goal.targetAmount)
                const daysToDeadline = getDaysToDeadline(goal.deadline)
                const isCompleted = goal.currentAmount >= goal.targetAmount
                
                return (
                  <div
                    key={goal.id}
                    className={`group bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg transition-all duration-200 hover:shadow-xl ${
                      isCompleted ? 'ring-2 ring-green-500' : ''
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${goal.color} flex items-center justify-center text-white`}>
                          <IconComponent iconName={goal.icon} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {goal.name}
                          </h3>
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full mt-1">
                              <Check size={12} />
                              Concluída
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setShowAddMoneyModal(goal.id)}
                          className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          title="Adicionar dinheiro"
                        >
                          <Plus size={16} className="text-green-600 dark:text-green-400" />
                        </button>
                        <button
                          onClick={() => setShowEditModal(goal.id)}
                          className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={16} className="text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {goal.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                        {goal.description}
                      </p>
                    )}

                    {/* Progress */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {formatCurrency(goal.currentAmount)}
                        </span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {progress.toFixed(1)}%
                        </span>
                      </div>

                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3">
                        <div
                          className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Meta: {formatCurrency(goal.targetAmount)}
                        </span>
                        {!isCompleted && (
                          <span className="text-zinc-500 dark:text-zinc-400">
                            Faltam {formatCurrency(remaining)}
                          </span>
                        )}
                      </div>

                      {/* Deadline */}
                      {daysToDeadline && (
                        <div className={`flex items-center gap-1 text-xs ${
                          daysToDeadline <= 30 
                            ? 'text-red-600 dark:text-red-400' 
                            : daysToDeadline <= 90 
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-zinc-500 dark:text-zinc-400'
                        }`}>
                          <Calendar size={12} />
                          {daysToDeadline > 0 ? `${daysToDeadline} dias restantes` : 'Prazo vencido'}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Empty State */}
            {goals.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-6">
                  <PiggyBank className="w-12 h-12 text-zinc-400 dark:text-zinc-500" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Nenhuma caixinha criada
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                  Crie sua primeira caixinha para começar a economizar e alcançar seus objetivos!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  Criar Primeira Caixinha
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Nova Caixinha
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
              >
                <X size={20} className="text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Nome da Caixinha
                </label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Carro novo, Viagem..."
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Meta (R$)
                </label>
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva sua meta..."
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Prazo (opcional)
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Ícone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(GOAL_ICONS).map(([key, { icon: Icon, label }]) => (
                    <button
                      key={key}
                      onClick={() => setNewGoal(prev => ({ ...prev, icon: key }))}
                      className={`p-3 rounded-lg border transition-colors ${
                        newGoal.icon === key
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30'
                          : 'border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <Icon size={20} className="mx-auto mb-1" />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Cor
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {GOAL_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewGoal(prev => ({ ...prev, color: color.value }))}
                      className={`w-full h-8 rounded-lg bg-gradient-to-r ${color.value} border-2 transition-all ${
                        newGoal.color === color.value
                          ? 'border-zinc-900 dark:border-zinc-100'
                          : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateGoal}
                  disabled={!newGoal.name || !newGoal.targetAmount}
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-400 text-white rounded-lg transition-colors"
                >
                  Criar Caixinha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Adicionar Dinheiro
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Valor
                </label>
                <input
                  type="text"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="R$ 0,00"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddMoneyModal(null)}
                  className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleAddMoney(showAddMoneyModal)}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SavingsPage