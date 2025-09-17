import { ArrowRight, Car, PiggyBank, Plane, Target } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  icon: string
  color: string
}

const SavingsGoalsSimple: React.FC = () => {
  const goals: SavingsGoal[] = [
    {
      id: '1',
      name: 'Carro Novo',
      targetAmount: 45000,
      currentAmount: 12500,
      icon: 'car',
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: '2',
      name: 'Viagem Europa',
      targetAmount: 15000,
      currentAmount: 8750,
      icon: 'plane',
      color: 'from-green-500 to-green-700'
    },
    {
      id: '3',
      name: 'Emergência',
      targetAmount: 20000,
      currentAmount: 5200,
      icon: 'piggybank',
      color: 'from-purple-500 to-purple-700'
    }
  ]

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const IconComponent = ({ iconName }: { iconName: string }) => {
    switch (iconName) {
      case 'car': return <Car size={20} />
      case 'plane': return <Plane size={20} />
      default: return <PiggyBank size={20} />
    }
  }

  if (goals.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl transition-colors h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <Target size={20} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div> 
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Minhas Caixinhas
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Principais objetivos financeiros
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
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
          <Link
            to="/caixinhas"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition-colors"
          >
            <Target size={16} />
            Criar Primeira Caixinha
          </Link>
        </div>
        {/* Bottom primary button: Ver todas */}
        <div className="mt-6 mt-auto flex justify-center">
          <Link
            to="/caixinhas"
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            Ver todas
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const overallProgress = (totalSaved / totalTarget) * 100

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl transition-colors h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
            <Target size={20} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div> 
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Minhas Caixinhas
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Principais objetivos financeiros
            </p>
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Economizado</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {formatCurrency(totalSaved)}
          </span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-600 rounded-full h-2">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {overallProgress.toFixed(1)}% de {formatCurrency(totalTarget)}
        </div>
      </div>

      {/* Lista Simplificada */}
      <div className="space-y-3">
        {goals.slice(0, 3).map((goal) => {
          const progress = getProgress(goal.currentAmount, goal.targetAmount)
          
          return (
            <div
              key={goal.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${goal.color} flex items-center justify-center text-white flex-shrink-0`}>
                <IconComponent iconName={goal.icon} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {goal.name}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-600 rounded-full h-1.5">
                  <div
                    className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {/* Bottom primary button: Ver todas */}
      <div className="mt-6 mt-auto flex justify-center">
        <Link
          to="/caixinhas"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          Ver todas
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}

export default SavingsGoalsSimple
