import React, { FC, forwardRef } from 'react'

interface CustomSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

const SelectInput: FC<CustomSelectProps> = forwardRef<
  HTMLSelectElement,
  CustomSelectProps
>(({ label, ...props }) => {
  return (
    <div className="w-full flex flex-col mt-4">
      <label className="text-md font-semibold text-gray">{label}</label>
      <select
        className="focus:outline-primary border border-softGray h-12 rounded-lg mt-2 px-5 bg-white"
        {...props}
      >
        <option className="hover:bg-softGray" value="food">
          Food 🍔
        </option>
        <option value="transport">Transport 🚗</option>
        <option value="shopping">Shopping 🛍️</option>
        <option value="entertainment">Entertainment 🎬</option>
      </select>
    </div>
  )
})

SelectInput.displayName = 'SelectInput'

export default SelectInput
