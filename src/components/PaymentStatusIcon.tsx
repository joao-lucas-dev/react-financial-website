import React from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface PaymentStatusIconProps {
  isPaid: boolean
  isAnimating: boolean
  onClick: () => void
  className?: string
}

const PaymentStatusIcon: React.FC<PaymentStatusIconProps> = ({
  isPaid,
  isAnimating,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${className} ${
        isPaid
          ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50'
          : 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50'
      } cursor-pointer hover:scale-105 ${isAnimating ? 'animate-tada' : ''}`}
      title={`${isPaid ? 'Transação paga' : 'Transação não paga'} (clique para alterar)`}
    >
      {isPaid ? (
        <ThumbsUp size={18} className="text-green-600 dark:text-green-400" />
      ) : (
        <ThumbsDown size={18} className="text-red-600 dark:text-red-400" />
      )}
    </button>
  )
}

export default PaymentStatusIcon
