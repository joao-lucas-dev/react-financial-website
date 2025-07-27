import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import CreditCard from './CreditCard'
import { CreditCard as CreditCardType } from '../types/creditCards'

interface CreditCardCarouselProps {
  cards: CreditCardType[]
  onAddCard?: () => void
  onCardClick?: (card: CreditCardType) => void
}

const CreditCardCarousel: React.FC<CreditCardCarouselProps> = ({
  cards,
  onAddCard,
  onCardClick
}) => {
  const [activeIndex, setActiveIndex] = useState(0)

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length)
  }

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  const goToCard = (index: number) => {
    setActiveIndex(index)
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Cards Stack */}
      <div className="relative h-64 w-full">
        {cards.map((card, index) => {
          // Calculate position based on active card
          const offset = index - activeIndex
          const isActive = index === activeIndex
          
          // Position calculation for stacking effect
          let transform = ''
          let zIndex = cards.length - Math.abs(offset)
          let opacity = 1
          
          if (offset === 0) {
            // Active card - front and center
            transform = 'translateX(0px) translateY(0px) rotate(0deg) scale(1)'
            opacity = 1
          } else if (offset === 1 || (offset < 0 && Math.abs(offset) === cards.length - 1)) {
            // Next card - slightly to the right and back
            transform = 'translateX(15px) translateY(10px) rotate(3deg) scale(0.95)'
            opacity = 0.8
          } else if (offset === -1 || (offset > 0 && offset === cards.length - 1)) {
            // Previous card - slightly to the left and back
            transform = 'translateX(-15px) translateY(10px) rotate(-3deg) scale(0.95)'
            opacity = 0.8
          } else if (offset > 0) {
            // Cards further to the right
            transform = `translateX(${15 + (offset - 1) * 5}px) translateY(${10 + (offset - 1) * 5}px) rotate(${3 + offset}deg) scale(${0.95 - offset * 0.05})`
            opacity = Math.max(0.4, 0.8 - offset * 0.2)
          } else {
            // Cards further to the left
            transform = `translateX(${-15 + (offset + 1) * 5}px) translateY(${10 + Math.abs(offset + 1) * 5}px) rotate(${-3 + offset}deg) scale(${0.95 - Math.abs(offset) * 0.05})`
            opacity = Math.max(0.4, 0.8 - Math.abs(offset) * 0.2)
          }

          return (
            <div
              key={card.id}
              className="absolute inset-0 transition-all duration-300 ease-out cursor-pointer"
              style={{
                transform,
                zIndex,
                opacity
              }}
              onClick={() => {
                if (!isActive) {
                  setActiveIndex(index)
                } else {
                  onCardClick?.(card)
                }
              }}
            >
              <CreditCard 
                card={card} 
                isActive={isActive}
                className="w-full"
              />
            </div>
          )
        })}
      </div>

      {/* Navigation Controls */}
      {cards.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={prevCard}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Next Button */}
          <button
            onClick={nextCard}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Add Card Button */}
      <button
        onClick={onAddCard}
        className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white border-0 cursor-pointer z-20 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 hover:from-teal-400 hover:to-teal-600"
      >
        <Plus size={20} />
      </button>

      {/* Dots Indicator */}
      {cards.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => goToCard(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === activeIndex 
                  ? 'bg-teal-600 w-6' 
                  : 'bg-zinc-300 dark:bg-zinc-600 hover:bg-teal-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Card Info */}
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
          {cards[activeIndex]?.name}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Limite disponível: {' '}
          <span className="font-medium text-teal-600 dark:text-teal-400">
            {((cards[activeIndex]?.creditLimit || 0) - cards[activeIndex]?.balance).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </span>
        </p>
      </div>
    </div>
  )
}

export default CreditCardCarousel