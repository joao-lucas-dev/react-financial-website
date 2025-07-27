import React from 'react'
import { CreditCard as CreditCardIcon, Wifi, CreditCard as CardIcon } from 'lucide-react'
import { CreditCard as CreditCardType } from '../types/creditCards'

interface CreditCardProps {
  card: CreditCardType
  className?: string
  onClick?: () => void
  isActive?: boolean
}

const CreditCard: React.FC<CreditCardProps> = ({ 
  card, 
  className = "", 
  onClick,
  isActive = false 
}) => {

  // Get network symbols (circles for mastercard, etc.)
  const getNetworkSymbols = () => {
    switch (card.network) {
      case 'mastercard':
        return (
          <div className="absolute top-6 right-6 flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-red-500/80"></div>
            <div className="w-8 h-8 rounded-full bg-yellow-400/80 -ml-4"></div>
          </div>
        )
      case 'elo':
        return (
          <div className="absolute top-6 right-6">
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-current"></div>
              </div>
              <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center -ml-2">
                <div className="w-4 h-4 rounded-full bg-current"></div>
              </div>
            </div>
          </div>
        )
      case 'visa':
        return (
          <div className="absolute top-6 right-6 text-white/90 text-sm font-bold italic">
            VISA
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div 
      className={`
        relative overflow-hidden w-full max-w-sm h-56 rounded-2xl 
        bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} 
        ${card.accentColor} p-6 shadow-2xl cursor-pointer
        transition-all duration-300 hover:scale-105 hover:shadow-3xl
        ${isActive ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-transparent' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Decorative background elements */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5 blur-xl" />
      
      {/* Network symbols */}
      {getNetworkSymbols()}
      
      {/* Chip and contactless */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          {/* EMV Chip */}
          <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-yellow-200 to-yellow-400 border border-yellow-300"></div>
          {/* Contactless symbol */}
          <Wifi className="w-5 h-5 opacity-60 rotate-90" />
        </div>
      </div>

      {/* Card number */}
      <div className="mb-6">
        <p className="text-lg font-mono tracking-widest font-medium">
          {card.maskedNumber}
        </p>
      </div>

      {/* Card details - only expiry date */}
      <div className="flex justify-end items-end">
        <div className="text-right">
          <p className="text-xs opacity-70 mb-1">Válido até</p>
          <p className="text-sm font-medium">
            {card.expiryMonth}/{card.expiryYear}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CreditCard