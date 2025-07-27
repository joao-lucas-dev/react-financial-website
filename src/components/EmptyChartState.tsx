import { TrendingUp, TrendingDown, Plus } from 'lucide-react'

interface EmptyChartStateProps {
  type: 'receitas' | 'despesas'
  onAddTransaction?: () => void
}

const EmptyChartState = ({ type, onAddTransaction }: EmptyChartStateProps) => {
  const isIncome = type === 'receitas'
  const Icon = isIncome ? TrendingUp : TrendingDown
  const colorClasses = isIncome 
    ? 'from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 text-green-600 dark:text-green-400'
    : 'from-red-100 to-red-200 dark:from-red-800 dark:to-red-900 text-red-600 dark:text-red-400'

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses.split(' ').slice(0, 4).join(' ')} rounded-full flex items-center justify-center mb-4 shadow-lg`}>
        <Icon size={28} className={colorClasses.split(' ').slice(-2).join(' ')} />
      </div>
      
      <h4 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2 text-center">
        Nenhuma {type} registrada
      </h4>
      
      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6 max-w-xs">
        Comece adicionando suas primeiras transações para ver os relatórios e gráficos
      </p>
      
      {onAddTransaction && (
        <button 
          onClick={onAddTransaction}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          <Plus size={16} />
          Adicionar Transação
        </button>
      )}
    </div>
  )
}

export default EmptyChartState