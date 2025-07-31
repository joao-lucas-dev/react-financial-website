import React, { FC, forwardRef } from 'react'

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  compact?: boolean
}

const Input: FC<CustomInputProps> = forwardRef<
  HTMLInputElement,
  CustomInputProps
>(({ label, type, compact = false, ...props }, ref) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        {label}
        <span className="text-red-600">*</span>
      </label>
      <input
        className={`focus:outline-primary border border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 text-zinc-900 rounded-lg px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
          compact ? 'h-10 py-2' : 'h-12'
        }`}
        type={type}
        ref={ref}
        {...props}
      />
    </div>
  )
})

Input.displayName = 'Input'

export default Input
