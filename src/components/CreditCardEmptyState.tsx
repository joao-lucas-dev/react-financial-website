import React from 'react'
import { CreditCard, Sparkles } from 'lucide-react'

interface CreditCardEmptyStateProps {
  // No props needed for display-only empty state
}

const CreditCardEmptyState: React.FC<CreditCardEmptyStateProps> = () => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Empty Card Placeholder */}
      <div className="relative w-full h-56 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col items-center justify-center transition-colors">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 opacity-60"></div>
          <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 opacity-40"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 opacity-30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Icon with animation */}
          <div className="relative mb-4">
            <CreditCard className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mx-auto" />
            <Sparkles className="w-4 h-4 text-teal-400 absolute -top-1 -right-1 animate-pulse" />
          </div>

          {/* Text */}
          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-2">
            Nenhum cartão criado ainda
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 px-4">
            Nenhum cartão cadastrado ainda. Adicione cartões para visualizar suas informações aqui.
          </p>
        </div>
      </div>

      {/* Benefits/Features list */}
      <div className="mt-6 space-y-3">
        <div className="flex items-start gap-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div>
          <div>
            <p className="text-zinc-700 dark:text-zinc-200 font-medium">
              Controle seus gastos
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs">
              Acompanhe todas as transações em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
          <div>
            <p className="text-zinc-700 dark:text-zinc-200 font-medium">
              Múltiplos cartões
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs">
              Gerencie todos os seus cartões em um só lugar
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
          <div>
            <p className="text-zinc-700 dark:text-zinc-200 font-medium">
              Análises detalhadas
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs">
              Relatórios completos de seus gastos por cartão
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreditCardEmptyState