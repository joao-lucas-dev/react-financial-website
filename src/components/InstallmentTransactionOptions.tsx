import { Calendar, CalendarDays, CalendarRange } from 'lucide-react'
import { InstallmentEditMode } from '../types/transactions'

interface InstallmentTransactionOptionsProps {
  value: InstallmentEditMode
  onChange: (editMode: InstallmentEditMode) => void
  action: 'edit' | 'delete'
  currentInstallment?: number
  totalInstallments?: number
}

const InstallmentTransactionOptions = ({ 
  value, 
  onChange, 
  action,
  currentInstallment,
  totalInstallments
}: InstallmentTransactionOptionsProps) => {
  const actionText = action === 'edit' ? 'editar' : 'excluir'
  const actionTitle = action === 'edit' ? 'Editar' : 'Excluir'

  const options = [
    {
      value: 'installment_only' as InstallmentEditMode,
      icon: <Calendar className="w-5 h-5" />,
      title: `Apenas esta parcela`,
      description: `${actionTitle} somente esta parcela da transação parcelada`
    },
    {
      value: 'installment_and_future' as InstallmentEditMode,
      icon: <CalendarDays className="w-5 h-5" />,
      title: `Esta e próximas parcelas`,
      description: `${actionTitle} esta parcela e todas as próximas parcelas`
    },
    {
      value: 'all_installments' as InstallmentEditMode,
      icon: <CalendarRange className="w-5 h-5" />,
      title: `Todas as parcelas`,
      description: `${actionTitle} todas as parcelas desta transação parcelada`
    }
  ]

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-2">
          O que deseja {actionText}?
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Esta é uma transação parcelada. Escolha o que deseja {actionText}:
        </p>
        {currentInstallment && totalInstallments && (
          <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
              Parcela {currentInstallment} de {totalInstallments}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${value === option.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500'
              }
            `}
          >
            <input
              type="radio"
              name="installment-edit-mode"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value as InstallmentEditMode)}
              className="sr-only"
            />
            
            <div className={`
              flex-shrink-0 p-2 rounded-lg
              ${value === option.value
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
              }
            `}>
              {option.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className={`
                font-medium mb-1
                ${value === option.value
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-zinc-700 dark:text-zinc-200'
                }
              `}>
                {option.title}
              </div>
              <p className={`
                text-sm
                ${value === option.value
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-zinc-600 dark:text-zinc-400'
                }
              `}>
                {option.description}
              </p>
            </div>

            <div className={`
              w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1
              ${value === option.value
                ? 'border-blue-500 bg-blue-500'
                : 'border-zinc-300 dark:border-zinc-600'
              }
            `}>
              {value === option.value && (
                <div className="w-full h-full rounded-full bg-white scale-50"></div>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

export default InstallmentTransactionOptions