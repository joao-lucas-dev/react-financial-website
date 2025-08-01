import React from 'react'
import * as Select from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  color?: string
}

interface ModernSelectProps {
  label: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
}

const ModernSelect: React.FC<ModernSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção...',
  required = false,
  error,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      
      <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger
          className={`
            flex items-center justify-between h-10 px-3 py-2 rounded-lg border transition-colors
            ${error 
              ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
              : 'border-zinc-300 dark:border-zinc-600 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
            }
            bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
            ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
            hover:border-teal-500 dark:hover:border-teal-400
            focus:outline-none
          `}
        >
          <div className="flex items-center gap-2 flex-1">
            <Select.Value placeholder={placeholder} />
          </div>
          <Select.Icon>
            <ChevronDown size={16} className="text-zinc-600 dark:text-zinc-400" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="
              overflow-hidden bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 
              rounded-lg shadow-lg z-50 max-h-64 w-full min-w-[var(--radix-select-trigger-width)]
            "
            position="popper"
            sideOffset={4}
            align="start"
          >
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="
                    relative flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer
                    text-zinc-900 dark:text-zinc-100
                    hover:bg-teal-50 dark:hover:bg-teal-900/20
                    focus:bg-teal-50 dark:focus:bg-teal-900/20
                    focus:outline-none
                    data-[state=checked]:bg-teal-100 dark:data-[state=checked]:bg-teal-900/30
                    data-[state=checked]:text-teal-700 dark:data-[state=checked]:text-teal-300
                  "
                >
                  <Select.ItemText>
                    <div className="flex items-center gap-2">
                      {option.icon && (
                        <span className="flex-shrink-0">
                          {option.icon}
                        </span>
                      )}
                      <span>{option.label}</span>
                    </div>
                  </Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2">
                    <Check size={14} className="text-teal-600 dark:text-teal-400" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      
      {error && (
        <span className="text-red-500 mt-1 text-sm">{error}</span>
      )}
    </div>
  )
}

export default ModernSelect