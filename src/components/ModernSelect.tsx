import React, { forwardRef } from 'react'
import Select, { SingleValue, StylesConfig, components } from 'react-select'
import { ChevronDown } from 'lucide-react'

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
  isSearchable?: boolean
}

// Componente customizado para a seta dropdown
const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown size={16} className="text-zinc-600 dark:text-zinc-400" />
    </components.DropdownIndicator>
  )
}

// Componente customizado para as opções
const Option = (props: any) => {
  const { data, isSelected, isFocused } = props
  
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-3">
        {data.icon && (
          <span className="flex-shrink-0">
            {data.icon}
          </span>
        )}
        <span className={`${isSelected ? 'font-medium' : 'font-normal'}`}>
          {data.label}
        </span>
      </div>
    </components.Option>
  )
}

// Componente customizado para o valor selecionado
const CustomSingleValue = (props: any) => {
  const { data } = props
  
  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-3">
        {data.icon && (
          <span className="flex-shrink-0">
            {data.icon}
          </span>
        )}
        <span>{data.label}</span>
      </div>
    </components.SingleValue>
  )
}

const ModernSelect = forwardRef<any, ModernSelectProps>(
  ({ 
    label, 
    options, 
    value, 
    onChange, 
    placeholder = 'Selecione uma opção...', 
    required = false, 
    error, 
    disabled = false,
    isSearchable = true
  }, ref) => {
    
    const selectedOption = options.find(opt => opt.value === value) || null

    const handleChange = (selectedOption: SingleValue<SelectOption>) => {
      if (onChange) {
        onChange(selectedOption?.value || '')
      }
    }

    // Estilos customizados seguindo o design system
    const customStyles: StylesConfig<SelectOption, false> = {
      control: (provided, state) => ({
        ...provided,
        height: '48px',
        minHeight: '48px',
        border: error 
          ? '1px solid #ef4444' 
          : state.isFocused 
            ? '1px solid #009688' 
            : '1px solid #d9d9d9',
        borderRadius: '8px',
        boxShadow: state.isFocused ? '0 0 0 1px #009688' : 'none',
        '&:hover': {
          borderColor: error ? '#ef4444' : '#009688',
        },
        backgroundColor: 'white',
        paddingLeft: '12px',
        paddingRight: '8px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }),
      valueContainer: (provided) => ({
        ...provided,
        padding: '0 8px',
      }),
      input: (provided) => ({
        ...provided,
        margin: '0',
        padding: '0',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }),
      placeholder: (provided) => ({
        ...provided,
        color: '#9ca3af',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }),
      singleValue: (provided) => ({
        ...provided,
        color: '#374151',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }),
      menu: (provided) => ({
        ...provided,
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        zIndex: 1050,
      }),
      menuList: (provided) => ({
        ...provided,
        padding: '4px',
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected 
          ? '#009688' 
          : state.isFocused 
            ? '#f0f9ff' 
            : 'white',
        color: state.isSelected ? 'white' : '#374151',
        borderRadius: '6px',
        margin: '2px 0',
        padding: '12px 16px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: state.isSelected ? '#009688' : '#f0f9ff',
        },
      }),
      indicatorSeparator: () => ({
        display: 'none',
      }),
      dropdownIndicator: (provided) => ({
        ...provided,
        padding: '8px',
      }),
    }

    return (
      <div className="flex flex-col mt-4">
        <label className="text-md font-semibold text-gray dark:text-softGray mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        
        <Select
          ref={ref}
          options={options}
          value={selectedOption}
          onChange={handleChange}
          placeholder={placeholder}
          isDisabled={disabled}
          isSearchable={isSearchable}
          styles={customStyles}
          components={{
            DropdownIndicator,
            Option,
            SingleValue: CustomSingleValue,
          }}
          noOptionsMessage={() => 'Nenhuma opção encontrada'}
          loadingMessage={() => 'Carregando...'}
        />
        
        {error && (
          <span className="text-red-500 mt-2 text-sm">{error}</span>
        )}
      </div>
    )
  }
)

ModernSelect.displayName = 'ModernSelect'

export default ModernSelect