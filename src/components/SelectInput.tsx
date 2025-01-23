import React, { FC, forwardRef, useEffect, useState } from 'react'
import api from '../api/axiosInstance.ts'
import CategoryIcon from './CategoryIcon'
import { ICategory } from '../types/transactions.ts'

interface CustomSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

const SelectInput: FC<CustomSelectProps> = forwardRef<
  HTMLSelectElement,
  CustomSelectProps
>(({ label, ...props }, ref) => {
  const [categories, setCategories] = useState([])

  const getCategories = async () => {
    const { data } = await api.get('/categories')
    setCategories(data)
  }

  useEffect(() => {
    getCategories()
  }, [getCategories])

  return categories.length > 0 ? (
    <div className="w-full flex flex-col mt-4">
      <label className="text-md font-semibold text-gray">{label}</label>
      <select
        className="focus:outline-primary border border-softGray h-12 rounded-lg mt-2 px-5 bg-white"
        ref={ref}
        {...props}
      >
        {categories.map((category: ICategory) => (
          <option
            key={category.id}
            value={category.id}
            className="flex items-center"
          >
            <CategoryIcon category={category} /> {category.name}
          </option>
        ))}
      </select>
    </div>
  ) : (
    <></>
  )
})

SelectInput.displayName = 'SelectInput'

export default SelectInput
