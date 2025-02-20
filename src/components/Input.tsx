import React, { FC, forwardRef } from 'react'

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

const Input: FC<CustomInputProps> = forwardRef<
  HTMLInputElement,
  CustomInputProps
>(({ label, type, ...props }, ref) => {
  return (
    <div className="flex flex-col mt-4">
      <label className="text-md font-semibold text-gray dark:text-softGray">
        {label}
        <span className="text-red-600">*</span>
      </label>
      <input
        className="focus:outline-primary border border-softGray dark:bg-zinc-800 dark:border-zinc-700 dark:text-softGray h-12 rounded-lg mt-2 px-5"
        type={type}
        ref={ref}
        {...props}
      />
    </div>
  )
})

Input.displayName = 'Input'

export default Input
