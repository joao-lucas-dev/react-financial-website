import React from 'react'
import { Check, X, Clock, Info } from 'lucide-react'
import { PaymentStatus as PaymentStatusType } from '../types/transactions'

interface PaymentStatusProps {
  label?: string
  value?: PaymentStatusType | boolean
  onChange?: (value: PaymentStatusType) => void
  transactionDate?: string
  disabled?: boolean
  showAutoLogic?: boolean
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  label = 'Status de Pagamento',
  value,
  onChange,
  transactionDate,
  disabled = false,
  showAutoLogic = true
}) => {
  // Converter boolean para PaymentStatusType se necessário (backward compatibility)
  const currentStatus: PaymentStatusType = 
    typeof value === 'boolean' 
      ? (value ? 'paid' : 'unpaid')
      : value || 'unpaid'

  // Lógica automática baseada na data
  const getAutoStatus = (): PaymentStatusType => {
    if (!transactionDate) return 'unpaid'
    
    const today = new Date()
    const transDate = new Date(transactionDate)
    
    // Remove horas para comparação apenas de datas
    today.setHours(0, 0, 0, 0)
    transDate.setHours(0, 0, 0, 0)
    
    if (transDate < today) return 'paid'    // Passado = pago
    if (transDate > today) return 'unpaid'  // Futuro = não pago
    return 'pending'                        // Hoje = pendente
  }

  const autoStatus = getAutoStatus()
  const shouldShowAuto = showAutoLogic && transactionDate

  const handleStatusChange = (newStatus: PaymentStatusType) => {
    if (disabled || !onChange) return
    onChange(newStatus)
  }

  const getStatusConfig = (status: PaymentStatusType) => {
    switch (status) {
      case 'paid':
        return {
          icon: <Check size={16} />,
          label: 'Pago',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-500',
          ringColor: 'ring-green-500'
        }
      case 'pending':
        return {
          icon: <Clock size={16} />,
          label: 'Pendente',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-500',
          ringColor: 'ring-yellow-500'
        }
      case 'unpaid':
      default:
        return {
          icon: <X size={16} />,
          label: 'Não Pago',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          borderColor: 'border-red-500',
          ringColor: 'ring-red-500'
        }
    }
  }

  return (
    <div className="flex flex-col mt-4">
      <label className="text-md font-semibold text-gray dark:text-softGray mb-2">
        {label}
      </label>
      
      {/* Status Options */}
      <div className="flex flex-wrap gap-3">
        {(['unpaid', 'pending', 'paid'] as PaymentStatusType[]).map((status) => {
          const config = getStatusConfig(status)
          const isSelected = currentStatus === status
          const isAuto = shouldShowAuto && autoStatus === status
          
          return (
            <button
              key={status}
              type="button"
              disabled={disabled}
              onClick={() => handleStatusChange(status)}
              className={`
                relative flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? `${config.borderColor} ${config.bgColor} ${config.color}` 
                  : 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800'
                }
                ${!disabled ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-60'}
                ${isSelected ? 'shadow-md' : 'hover:shadow-sm'}
              `}
            >
              <span className={`
                flex items-center justify-center w-5 h-5 rounded-full
                ${isSelected ? config.color : 'text-zinc-400'}
              `}>
                {config.icon}
              </span>
              
              <span className={`text-sm font-medium ${isSelected ? config.color : ''}`}>
                {config.label}
              </span>
              
              {/* Indicador automático */}
              {isAuto && shouldShowAuto && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-zinc-800"></span>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Info sobre lógica automática */}
      {shouldShowAuto && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-700 dark:text-blue-300 font-medium">
                Sugestão automática: <span className="capitalize">{getStatusConfig(autoStatus).label}</span>
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                {autoStatus === 'paid' && 'Datas passadas são marcadas como pagas por padrão'}
                {autoStatus === 'unpaid' && 'Datas futuras são marcadas como não pagas por padrão'}
                {autoStatus === 'pending' && 'Transações de hoje ficam pendentes por padrão'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentStatus