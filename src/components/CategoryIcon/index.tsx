import React from 'react'
import { DynamicIcon } from 'lucide-react/dynamic'
import { ICategory } from '../../types/transactions.ts'
import './styles.css'

interface CategoryIconProps {
  category: ICategory
}

const Index: React.FC<CategoryIconProps> = ({ category }) => {
  const { color, iconName } = category

  return color && iconName ? (
    <div
      className={`w-5 h-5 rounded-full flex items-center justify-center ${color}`}
    >
      <DynamicIcon
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        name={iconName}
        size={12}
        className="text-white"
      />
    </div>
  ) : (
    <></>
  )
}

export default Index
