import React from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface PaymentStatusIconProps {
  transactionDate?: string
  className?: string
  isPaidOverride?: boolean | null
  onToggle?: (isPaid: boolean) => void
}

const PaymentStatusIcon: React.FC<PaymentStatusIconProps> = ({
  transactionDate,
  className = '',
  isPaidOverride = null,
  onToggle
}) => {
  // Lógica para determinar o status de pagamento baseado na data
  const getPaymentStatus = (): 'paid' | 'unpaid' => {
    if (!transactionDate) return 'unpaid'
    
    const today = new Date()
    const transDate = new Date(transactionDate)
    
    // Remove horas para comparação apenas de datas
    today.setHours(0, 0, 0, 0)
    transDate.setHours(0, 0, 0, 0)
    
    // Se a data é hoje ou no passado = pago (thumbs up)
    // Se a data é no futuro = não pago (thumbs down)
    return transDate <= today ? 'paid' : 'unpaid'
  }

  const status = getPaymentStatus()
  const isPaid = isPaidOverride !== null ? isPaidOverride : status === 'paid'

  const handleClick = () => {
    if (onToggle) {
      onToggle(!isPaid)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${className} ${
        isPaid 
          ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50' 
          : 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50'
      } ${onToggle ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
      title={`${isPaid ? 'Transação paga' : 'Transação não paga'}${onToggle ? ' (clique para alterar)' : ''}`}
    >
      {isPaid ? (
        <ThumbsUp 
          size={18} 
          className="text-green-600 dark:text-green-400" 
        />
      ) : (
        <ThumbsDown 
          size={18} 
          className="text-red-600 dark:text-red-400" 
        />
      )}
    </button>
  )
}

export default PaymentStatusIcon