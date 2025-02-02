import { FC, forwardRef } from 'react'
import CategoryIcon from './CategoryIcon'
import { ICategory } from '../types/transactions.ts'
import { Select } from 'antd'
import { Controller, Control } from 'react-hook-form'

interface CustomSelectProps {
  label: string
  categories: ICategory[]
  control: Control
}

const SelectInput: FC<CustomSelectProps> = forwardRef<
  HTMLSelectElement,
  CustomSelectProps
>(({ label, categories, control }) => {
  return (
    <div className="w-full flex flex-col mt-4">
      <label className="text-md font-semibold text-gray">{label}</label>
      <Controller
        name="category"
        control={control}
        rules={{ required: 'Seleção obrigatória' }}
        render={({ field }) => {
          return (
            <Select
              {...field}
              className="w-full mt-2 h-12 focus:border-0"
              options={categories.map((category) => ({
                value: String(category.id),
                label: (
                  <span key={category.id} className="flex items-center">
                    <CategoryIcon category={category} />
                    <span className="ml-2">{category.name}</span>
                  </span>
                ),
              }))}
            />
          )
        }}
      />
    </div>
  )
})

SelectInput.displayName = 'SelectInput'

export default SelectInput
