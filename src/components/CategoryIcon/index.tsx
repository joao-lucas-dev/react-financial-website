import React from 'react'
import { DynamicIcon } from 'lucide-react/dynamic'
import { ICategory } from '../../types/categories.ts'
import './styles.css'

interface CategoryIconProps {
  category: ICategory
  size?: string
}

const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 'small',
}) => {
  const { color, iconName } = category

  return color && iconName ? (
    <div
      className={`${size === 'large' ? 'w-7 h-7' : 'w-5 h-5'} rounded-full flex items-center justify-center ${color}`}
    >
      <DynamicIcon
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        name={iconName}
        size={size === 'large' ? 14 : 12}
        className="text-white"
      />
    </div>
  ) : (
    <></>
  )
}

export default CategoryIcon
