import React, { useState, useEffect } from 'react'
import { Calendar, RotateCcw, Clock } from 'lucide-react'
import ModernSelect, { SelectOption } from './ModernSelect'
import { RecurrenceType } from '../types/transactions'

interface RecurrenceSelectorProps {
  label?: string
  value?: RecurrenceType | boolean
  onChange?: (value: RecurrenceType, interval?: number) => void
  transactionDate?: string
  disabled?: boolean
  showPreview?: boolean
}

const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  label = 'Recorrência',
  value,
  onChange,
  transactionDate,
  disabled = false,
  showPreview = true
}) => {
  // Converter boolean para RecurrenceType se necessário (backward compatibility)
  const currentRecurrence: RecurrenceType = 
    typeof value === 'boolean' 
      ? (value ? 'monthly' : 'none')
      : value || 'none'

  const [interval, setInterval] = useState<number>(1)
  const [previewDates, setPreviewDates] = useState<string[]>([])

  // Opções de recorrência com ícones
  const recurrenceOptions: SelectOption[] = [
    {
      value: 'none',
      label: 'Sem recorrência',
      icon: <X className="w-4 h-4 text-zinc-500" />
    },
    {
      value: 'daily',
      label: 'Diário',
      icon: <Calendar className="w-4 h-4 text-blue-500" />
    },
    {
      value: 'weekly',
      label: 'Semanal',
      icon: <RotateCcw className="w-4 h-4 text-green-500" />
    },
    {
      value: 'monthly',
      label: 'Mensal',
      icon: <Calendar className="w-4 h-4 text-teal-500" />
    },
    {
      value: 'quarterly',
      label: 'Trimestral',
      icon: <Clock className="w-4 h-4 text-orange-500" />
    },
    {
      value: 'biannually',
      label: 'Semestral',
      icon: <Calendar className="w-4 h-4 text-purple-500" />
    },
    {
      value: 'yearly',
      label: 'Anual',
      icon: <RotateCcw className="w-4 h-4 text-red-500" />
    }
  ]

  // Função para calcular próximas ocorrências
  const calculateNextOccurrences = (
    startDate: string, 
    recurrenceType: RecurrenceType, 
    intervalValue: number = 1,
    count: number = 3
  ): string[] => {
    if (recurrenceType === 'none' || !startDate) return []

    const dates: string[] = []
    const baseDate = new Date(startDate)
    
    for (let i = 1; i <= count; i++) {
      const nextDate = new Date(baseDate)
      
      switch (recurrenceType) {
        case 'daily':
          nextDate.setDate(baseDate.getDate() + (i * intervalValue))
          break
        case 'weekly':
          nextDate.setDate(baseDate.getDate() + (i * 7 * intervalValue))
          break
        case 'monthly':
          nextDate.setMonth(baseDate.getMonth() + (i * intervalValue))
          break
        case 'quarterly':
          nextDate.setMonth(baseDate.getMonth() + (i * 3 * intervalValue))
          break
        case 'biannually':
          nextDate.setMonth(baseDate.getMonth() + (i * 6 * intervalValue))
          break
        case 'yearly':
          nextDate.setFullYear(baseDate.getFullYear() + (i * intervalValue))
          break
      }
      
      dates.push(nextDate.toLocaleDateString('pt-BR'))
    }
    
    return dates
  }

  // Atualizar preview quando mudarem os valores
  useEffect(() => {
    if (showPreview && transactionDate && currentRecurrence !== 'none') {
      const dates = calculateNextOccurrences(transactionDate, currentRecurrence, interval)
      setPreviewDates(dates)
    } else {
      setPreviewDates([])
    }
  }, [currentRecurrence, interval, transactionDate, showPreview])

  const handleRecurrenceChange = (newRecurrence: string) => {
    const recurrenceType = newRecurrence as RecurrenceType
    if (onChange) {
      onChange(recurrenceType, recurrenceType !== 'none' ? interval : undefined)
    }
  }

  const handleIntervalChange = (newInterval: number) => {
    if (newInterval > 0 && newInterval <= 99) {
      setInterval(newInterval)
      if (onChange && currentRecurrence !== 'none') {
        onChange(currentRecurrence, newInterval)
      }
    }
  }

  const getRecurrenceDescription = (type: RecurrenceType, intervalValue: number): string => {
    if (type === 'none') return ''
    
    const intervalText = intervalValue === 1 ? '' : ` (a cada ${intervalValue})`
    
    switch (type) {
      case 'daily':
        return `Repetir diariamente${intervalText}`
      case 'weekly':
        return `Repetir semanalmente${intervalText}`
      case 'monthly':
        return `Repetir mensalmente${intervalText}`
      case 'quarterly':
        return `Repetir trimestralmente${intervalText}`
      case 'biannually':
        return `Repetir semestralmente${intervalText}`
      case 'yearly':
        return `Repetir anualmente${intervalText}`
      default:
        return ''
    }
  }

  return (
    <div className="flex flex-col">
      <ModernSelect
        label={label}
        options={recurrenceOptions}
        value={currentRecurrence}
        onChange={handleRecurrenceChange}
        disabled={disabled}
        isSearchable={false}
        placeholder="Selecione o tipo de recorrência"
      />
      
      {/* Intervalo customizado */}
      {currentRecurrence !== 'none' && (
        <div className="mt-4">
          <label className="text-sm font-medium text-gray dark:text-softGray mb-2 block">
            Intervalo
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">A cada</span>
            <input
              type="number"
              min="1"
              max="99"
              value={interval}
              onChange={(e) => handleIntervalChange(Number(e.target.value))}
              disabled={disabled}
              className="w-16 h-10 text-center border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {currentRecurrence === 'daily' && (interval === 1 ? 'dia' : 'dias')}
              {currentRecurrence === 'weekly' && (interval === 1 ? 'semana' : 'semanas')}
              {currentRecurrence === 'monthly' && (interval === 1 ? 'mês' : 'meses')}
              {currentRecurrence === 'quarterly' && (interval === 1 ? 'trimestre' : 'trimestres')}
              {currentRecurrence === 'biannually' && (interval === 1 ? 'semestre' : 'semestres')}
              {currentRecurrence === 'yearly' && (interval === 1 ? 'ano' : 'anos')}
            </span>
          </div>
        </div>
      )}
      
      {/* Descrição da recorrência */}
      {currentRecurrence !== 'none' && (
        <div className="mt-3 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
          <div className="flex items-center gap-2">
            <RotateCcw size={16} className="text-teal-600 dark:text-teal-400" />
            <span className="text-sm text-teal-700 dark:text-teal-300 font-medium">
              {getRecurrenceDescription(currentRecurrence, interval)}
            </span>
          </div>
        </div>
      )}
      
      {/* Preview das próximas ocorrências */}
      {showPreview && previewDates.length > 0 && (
        <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
            <Calendar size={16} />
            Próximas ocorrências:
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {previewDates.map((date, index) => (
              <div
                key={index}
                className="text-xs bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg p-2 text-center text-zinc-600 dark:text-zinc-400"
              >
                {date}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente X para opção "Sem recorrência"
const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default RecurrenceSelector