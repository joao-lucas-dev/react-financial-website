import React from 'react'
import { Calendar, RotateCcw, X, Clock } from 'lucide-react'
import ModernSelect, { SelectOption } from './ModernSelectRadix'

export type SimpleRecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

interface SimpleRecurrenceSelectorProps {
  label?: string
  value?: SimpleRecurrenceType
  onChange?: (value: SimpleRecurrenceType) => void
  disabled?: boolean
  required?: boolean
  error?: string
}

const SimpleRecurrenceSelector: React.FC<SimpleRecurrenceSelectorProps> = ({
  label = 'Recorrência',
  value = 'none',
  onChange,
  disabled = false,
  required = false,
  error
}) => {
  // Opções de recorrência simplificadas conforme o plano
  const recurrenceOptions: SelectOption[] = [
    {
      value: 'none',
      label: 'Não se repete',
      icon: <X className="w-4 h-4 text-zinc-500" />
    },
    {
      value: 'daily',
      label: 'Diariamente',
      icon: <Calendar className="w-4 h-4 text-blue-500" />
    },
    {
      value: 'weekly',
      label: 'Semanalmente',
      icon: <RotateCcw className="w-4 h-4 text-green-500" />
    },
    {
      value: 'monthly',
      label: 'Mensalmente',
      icon: <Clock className="w-4 h-4 text-teal-500" />
    }
  ]

  const handleRecurrenceChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue as SimpleRecurrenceType)
    }
  }

  return (
    <ModernSelect
      label={label}
      options={recurrenceOptions}
      value={value}
      onChange={handleRecurrenceChange}
      disabled={disabled}
      required={required}
      error={error}
      placeholder="Selecione a recorrência"
    />
  )
}

export default SimpleRecurrenceSelector