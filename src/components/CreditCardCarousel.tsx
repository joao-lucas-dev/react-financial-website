import React, { useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import CreditCard from './CreditCard'
import { CreditCard as CreditCardType } from '../types/creditCards'
import { Link } from 'react-router'

interface CreditCardCarouselProps {
  cards: CreditCardType[]
  onCardClick?: (card: CreditCardType) => void
}

const CreditCardCarousel: React.FC<CreditCardCarouselProps> = ({
  cards,
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
          const zIndex = cards.length - Math.abs(offset)
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
            className="absolute left-[-4rem] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 z-10 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Next Button */}
          <button
            onClick={nextCard}
            className="absolute right-[-0.5rem] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 z-10 shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}


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
      <div className="mt-4 text-center flex">
        <div>
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
        <div className="flex flex-1 items-center justify-center">
          <Link
            to="/cartoes"
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            Ver fatura
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CreditCardCarousel
