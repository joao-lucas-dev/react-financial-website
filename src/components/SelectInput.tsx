import React, { FC, forwardRef } from 'react'
import { categoryIcons } from '../common/constants'
import CategoryIcon from './CategoryIcon.tsx'

interface CustomSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

const SelectInput: FC<CustomSelectProps> = forwardRef<
  HTMLSelectElement,
  CustomSelectProps
>(({ label, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col mt-4">
      <label className="text-md font-semibold text-gray">{label}</label>
      <select
        className="focus:outline-primary border border-softGray h-12 rounded-lg mt-2 px-5 bg-white"
        ref={ref}
        {...props}
      >
        {Array.from(categoryIcons.entries()).map(([key, category]) => (
          <option key={key} value={key} className="flex items-center">
            <CategoryIcon categoryId={key} /> {category.name}
          </option>
        ))}
      </select>
    </div>
  )
})

SelectInput.displayName = 'SelectInput'

export default SelectInput
