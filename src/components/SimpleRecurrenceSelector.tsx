import React from 'react'
import ModernSelect, { SelectOption } from './ModernSelect'
import { RecurrenceType } from '../types/transactions'

interface SimpleRecurrenceSelectorProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

const SimpleRecurrenceSelector: React.FC<SimpleRecurrenceSelectorProps> = ({
  value = 'none',
  onChange,
  disabled = false
}) => {
  const recurrenceOptions: SelectOption[] = [
    { value: 'none', label: 'Avulso (sem recorrência)', icon: <span>📝</span> },
    { value: 'daily', label: 'Diário', icon: <span>📅</span> },
    { value: 'weekly', label: 'Semanal', icon: <span>📆</span> },
    { value: 'monthly', label: 'Mensal', icon: <span>🗓️</span> },
    { value: 'quarterly', label: 'Trimestral', icon: <span>📊</span> },
    { value: 'biannually', label: 'Semestral', icon: <span>📋</span> },
    { value: 'yearly', label: 'Anual', icon: <span>📄</span> }
  ]

  return (
    <ModernSelect
      label="Tipo de Recorrência"
      options={recurrenceOptions}
      value={value}
      onChange={onChange}
      disabled={disabled}
      isSearchable={false}
      placeholder="Selecione o tipo de recorrência..."
    />
  )
}

export default SimpleRecurrenceSelector