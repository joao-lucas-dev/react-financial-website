import React from 'react'
import { X, TrendingUp, TrendingDown, Plus } from 'lucide-react'
import { ISetOpenModal, ITransaction } from '../types/transactions'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  setOpenModal: ISetOpenModal
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  date,
  setOpenModal
}) => {
  if (!isOpen) return null

  const handleCreateTransaction = (type: 'income' | 'outcome') => {
    setOpenModal({
      isOpen: true,
      transaction: {
        category_id: '',
        description: '',
        price: '',
        category: { id: 0, name: '', color: '', icon: '', iconName: '', icon_name: '', type },
        transaction_day: date,
        type
      } as ITransaction,
      type: 'create',
      button: type
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-zinc-700/50 p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <Plus size={20} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Adicionar Transação
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={18} className="text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Income Option */}
          <button
            onClick={() => handleCreateTransaction('income')}
            className="w-full p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-green-700 dark:text-green-300 text-lg">
                  Adicionar Receita
                </h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Salário, vendas, investimentos...
                </p>
              </div>
              <div className="ml-auto">
                <Plus size={20} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </button>

          {/* Outcome Option */}
          <button
            onClick={() => handleCreateTransaction('outcome')}
            className="w-full p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-800 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-red-700 dark:text-red-300 text-lg">
                  Adicionar Despesa
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Compras, contas, alimentação...
                </p>
              </div>
              <div className="ml-auto">
                <Plus size={20} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-200/50 dark:border-zinc-700/50">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuickAddModal
