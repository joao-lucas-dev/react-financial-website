import {
  LucideIcon,
  Bike,
  House,
  ShoppingCart,
  EllipsisVertical,
  BadgeX,
  Landmark,
  Cross,
  CircleDollarSign,
  NotebookPen,
} from 'lucide-react'

import React from 'react'

interface CategoryIconProps {
  category: string
}

const icons: Record<string, LucideIcon> = {
  delivery: Bike,
  shopping: ShoppingCart,
  house: House,
  outros: EllipsisVertical,
  unexpected: BadgeX,
  investments: Landmark,
  health: Cross,
  salary: CircleDollarSign,
  studies: NotebookPen,
}

const colors: Record<string, string> = {
  delivery: 'bg-red-500',
  shopping: 'bg-purple-500',
  house: 'bg-blue-500',
  outros: 'bg-zinc-500',
  unexpected: 'bg-red-300',
  investments: 'bg-purple-300',
  health: 'bg-green-500',
  salary: 'bg-green-700',
  studies: 'bg-blue-300',
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ category }) => {
  const Icon = icons[category]
  const colorClass = colors[category]

  return (
    <div
      className={`w-5 h-5 rounded-full flex items-center justify-center ${colorClass}`}
    >
      <Icon size={12} className="text-white" />
    </div>
  )
}

export default CategoryIcon
