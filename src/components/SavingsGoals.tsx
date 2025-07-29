import React, { useState } from 'react'
import { 
  PiggyBank, 
  Car, 
  Home, 
  Plane, 
  Plus, 
  Target, 
  Calendar,
  TrendingUp,
  Edit3,
  Trash2,
  DollarSign,
  Gift,
  GraduationCap,
  Heart,
  Smartphone,
  Gamepad2
} from 'lucide-react'

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

interface SavingsGoalsProps {
  onAddTransaction?: () => void
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
  'from-blue-500 to-blue-700',
  'from-green-500 to-green-700', 
  'from-purple-500 to-purple-700',
  'from-orange-500 to-orange-700',
  'from-pink-500 to-pink-700',
  'from-teal-500 to-teal-700',
  'from-red-500 to-red-700',
  'from-indigo-500 to-indigo-700'
]

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ onAddTransaction }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>([
    // {
    //   id: '1',
    //   name: 'Carro Novo',
    //   targetAmount: 45000,
    //   currentAmount: 12500,
    //   icon: 'car',
    //   color: 'from-blue-500 to-blue-700',
    //   deadline: '2024-12-31',
    //   description: 'Economizando para comprar um carro 0km',
    //   createdAt: '2024-01-15'
    // },
    // {
    //   id: '2', 
    //   name: 'Viagem Europa',
    //   targetAmount: 15000,
    //   currentAmount: 8750,
    //   icon: 'plane',
    //   color: 'from-green-500 to-green-700',
    //   deadline: '2024-07-01',
    //   description: 'Mochilão pela Europa no meio do ano',
    //   createdAt: '2024-01-20'
    // },
    // {
    //   id: '3',
    //   name: 'Emergência',
    //   targetAmount: 20000,
    //   currentAmount: 5200,
    //   icon: 'piggybank',
    //   color: 'from-purple-500 to-purple-700',
    //   description: 'Reserva de emergência para 6 meses',
    //   createdAt: '2024-02-01'
    // }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddMoneyModal, setShowAddMoneyModal] = useState<string | null>(null)
  const [addAmount, setAddAmount] = useState('')

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

  const IconComponent = ({ iconName }: { iconName: string }) => {
    const IconEl = GOAL_ICONS[iconName as keyof typeof GOAL_ICONS]?.icon || PiggyBank
    return <IconEl size={24} />
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
            <Target size={20} className="text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="text-base font-medium text-zinc-700 dark:text-zinc-200">
            Minhas Caixinhas
          </h3>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nova Caixinha
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
            <PiggyBank className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-lg font-medium text-zinc-400 dark:text-zinc-500 mb-2">
            Nenhuma caixinha criada
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-4">
            Crie sua primeira caixinha para começar a economizar!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            Criar Primeira Caixinha
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {goals.map((goal) => {
            const progress = getProgress(goal.currentAmount, goal.targetAmount)
            const remaining = getRemainingAmount(goal.currentAmount, goal.targetAmount)
            const daysToDeadline = getDaysToDeadline(goal.deadline)
            
            return (
              <div
                key={goal.id}
                className="group p-4 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700/50 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${goal.color} flex items-center justify-center text-white flex-shrink-0`}>
                    <IconComponent iconName={goal.icon} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                          {goal.name}
                        </h4>
                        {goal.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {goal.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setShowAddMoneyModal(goal.id)}
                          className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                          title="Adicionar dinheiro"
                        >
                          <Plus size={14} className="text-green-600 dark:text-green-400" />
                        </button>
                        <button
                          className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded"
                          title="Editar"
                        >
                          <Edit3 size={14} className="text-zinc-600 dark:text-zinc-400" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                        </span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {progress.toFixed(1)}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-zinc-200 dark:bg-zinc-600 rounded-full h-2">
                        <div
                          className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Additional Info */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Faltam {formatCurrency(remaining)}
                        </span>
                        {daysToDeadline && (
                          <span className={`flex items-center gap-1 ${
                            daysToDeadline <= 30 
                              ? 'text-red-600 dark:text-red-400' 
                              : daysToDeadline <= 90 
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-zinc-500 dark:text-zinc-400'
                          }`}>
                            <Calendar size={12} />
                            {daysToDeadline} dias
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
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

export default SavingsGoals