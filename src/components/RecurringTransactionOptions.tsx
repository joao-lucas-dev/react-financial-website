import { Clock, Calendar, CalendarRange } from 'lucide-react'
import { EditMode } from '../types/transactions'

interface RecurringTransactionOptionsProps {
  value: EditMode
  onChange: (editMode: EditMode) => void
  action: 'edit' | 'delete'
}

const RecurringTransactionOptions = ({ 
  value, 
  onChange, 
  action 
}: RecurringTransactionOptionsProps) => {
  const actionText = action === 'edit' ? 'editar' : 'excluir'
  const actionTitle = action === 'edit' ? 'Editar' : 'Excluir'

  const options = [
    {
      value: 'instance_only' as EditMode,
      icon: <Clock className="w-5 h-5" />,
      title: `Apenas esta transação`,
      description: `${actionTitle} somente esta ocorrência da transação recorrente`
    },
    {
      value: 'instance_and_future' as EditMode,
      icon: <Calendar className="w-5 h-5" />,
      title: `Esta e futuras transações`,
      description: `${actionTitle} esta transação e todas as próximas ocorrências`
    },
    {
      value: 'all_instances' as EditMode,
      icon: <CalendarRange className="w-5 h-5" />,
      title: `Todas as transações`,
      description: `${actionTitle} todas as ocorrências desta transação recorrente`
    }
  ]

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-2">
          O que deseja {actionText}?
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Esta é uma transação recorrente. Escolha o que deseja {actionText}:
        </p>
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
              name="edit-mode"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value as EditMode)}
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

export default RecurringTransactionOptions