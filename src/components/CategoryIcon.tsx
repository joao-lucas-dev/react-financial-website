import React from 'react'
import { categoryIcons } from '../common/constants'

interface CategoryIconProps {
  categoryId: number
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ categoryId }) => {
  const Icon = categoryIcons.get(categoryId)?.icon
  const colorClass = categoryIcons.get(categoryId)?.color

  return (
    <div
      className={`w-5 h-5 rounded-full flex items-center justify-center ${colorClass}`}
    >
      {Icon && <Icon size={12} className="text-white" />}
    </div>
  )
}

export default CategoryIcon
